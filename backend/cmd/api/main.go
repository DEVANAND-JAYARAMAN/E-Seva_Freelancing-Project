package main

import (
	"eservice-backend/config"
	"eservice-backend/internal/application"
	"eservice-backend/internal/auth"
	"eservice-backend/internal/middleware"
	"eservice-backend/internal/platform/postgres"
	"eservice-backend/internal/wallet"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to database
	db, err := postgres.Connect(cfg.Database.ConnectionString())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize database schema
	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}

	// Initialize repositories
	authRepo := auth.NewRepository(db)
	walletRepo := wallet.NewRepository(db)
	appRepo := application.NewRepository(db)

	// Initialize services
	authService := auth.NewService(
		authRepo,
		cfg.JWT.Secret,
		cfg.JWT.ExpiryHours,
		cfg.JWT.RefreshExpiryHours,
	)
	walletService := wallet.NewService(walletRepo)
	appService := application.NewService(appRepo, walletService)

	// Initialize handlers
	authHandler := auth.NewHandler(authService)
	walletHandler := wallet.NewHandler(walletService)
	appHandler := application.NewHandler(appService)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Custom logger middleware
	router.Use(middleware.Logger())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "E-Service API is running",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public auth routes
		authRoutes := v1.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
			authRoutes.POST("/refresh", authHandler.RefreshToken)
			authRoutes.POST("/logout", authHandler.Logout)
		}

		// Webhooks (Public)
		v1.POST("/webhooks/mugavi", walletHandler.GatewayWebhook)

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(authService))
		{
			// User profile
			protected.GET("/profile", authHandler.GetProfile)

			// Admin only routes
			adminRoutes := protected.Group("/admin")
			adminRoutes.Use(middleware.RequireRole("admin"))
			{
				adminRoutes.GET("/users", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Admin users endpoint"})
				})

				// Wallet Approval / Rejection routes
				adminRoutes.GET("/wallet/requests", walletHandler.GetAllRechargeRequests)
				adminRoutes.POST("/wallet/requests/:id/approve", walletHandler.ApproveRecharge)
				adminRoutes.POST("/wallet/requests/:id/reject", walletHandler.RejectRecharge)

				// Application Processing
				adminRoutes.GET("/applications", appHandler.GetAllApplications)
				adminRoutes.PATCH("/applications/:id/status", appHandler.UpdateApplicationStatus)
			}

			// Wallet routes (for all authenticated users)
			walletRoutes := protected.Group("/wallet")
			{
				walletRoutes.GET("/balance", walletHandler.GetBalance)
				walletRoutes.POST("/request", walletHandler.RequestRecharge)
				walletRoutes.POST("/recharge/gateway", walletHandler.InitiateGatewayRecharge)
				walletRoutes.GET("/requests", walletHandler.GetUserRechargeRequests)
				walletRoutes.GET("/transactions", walletHandler.GetTransactionHistory)
				walletRoutes.GET("/check-balance", walletHandler.CheckBalance)
			}

			// Application routes
			applicationRoutes := protected.Group("/applications")
			{
				applicationRoutes.GET("", appHandler.GetUserApplications)
				applicationRoutes.POST("", appHandler.SubmitApplication)
				applicationRoutes.GET("/:id", appHandler.GetApplication)
				applicationRoutes.GET("/services", appHandler.GetServiceTypes)
				applicationRoutes.GET("/services/:id", appHandler.GetServiceType)
			}
		}
	}

	// Start server
	log.Printf("Starting server on port %s", cfg.Server.Port)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
