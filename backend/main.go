package main

import (
	"log"
	"os"

	"eservice-backend/admin"
	"eservice-backend/apizone"
	"eservice-backend/auth"
	"eservice-backend/billing"
	"eservice-backend/crm"
	"eservice-backend/db"
	"eservice-backend/notification"
	"eservice-backend/service"
	"eservice-backend/wallet"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize AWS DynamoDB Connection
	db.ConnectDynamoDB()

	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"https://thuruvancommunications.com",
		"https://www.thuruvancommunications.com",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Ensure uploads directory exists
	os.MkdirAll("uploads", os.ModePerm)

	// Routes
	api := r.Group("/api")
	{
		// Serve uploaded files under /api/uploads to be correctly proxied by Nginx
		api.Static("/uploads", "./uploads")

		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		authGroup := api.Group("/auth")
		{
			authGroup.POST("/signup", auth.Signup)
			authGroup.POST("/login", auth.Login)
		}

		// Public payment callbacks (idempotent credit inside ProcessMugavaiPayment)
		api.POST("/wallet/payment/callback", wallet.HandlePaymentCallback)
		v1Public := api.Group("/v1/wallet")
		{
			v1Public.POST("/recharge/webhook", service.RechargeWebhook)
			v1Public.Any("/recharge/return", service.RechargeReturn)
			v1Public.Any("/recharge/return/", service.RechargeReturn)
		}

		// Authenticated routes
		secured := api.Group("/")
		secured.Use(auth.RequireAuth())
		{
			secured.GET("/retailers", auth.RequireAdmin(), auth.GetRetailers)
			secured.GET("/distributors", auth.RequireAdmin(), auth.GetDistributors)
			secured.PUT("/users/:id", auth.RequireAdmin(), auth.UpdateUser)
			secured.PUT("/users/:id/", auth.RequireAdmin(), auth.UpdateUser)
			secured.DELETE("/users/:id", auth.RequireAdmin(), auth.DeleteUser)
			secured.DELETE("/users/:id/", auth.RequireAdmin(), auth.DeleteUser)

			crmGroup := secured.Group("/crm")
			{
				crmGroup.POST("/customers", crm.CreateCustomer)
				crmGroup.GET("/customers", crm.GetCustomers)
			}

			billingGroup := secured.Group("/billing")
			{
				billingGroup.POST("/invoices", billing.CreateInvoice)
				billingGroup.GET("/invoices", billing.GetInvoices)
			}

			// Notifications
			secured.POST("/notifications", notification.CreateNotification)
			secured.GET("/notifications", notification.GetNotifications)
			secured.DELETE("/notifications/all", notification.ClearAllNotifications)
			secured.PATCH("/notifications/read-all", notification.MarkAllAsRead)
			secured.PATCH("/notifications/:id/read", notification.MarkAsRead)
			secured.DELETE("/notifications/:id", notification.DeleteNotification)

			// Global Alerts & Service Messages
			secured.GET("/alerts", notification.GetGlobalAlerts)
			secured.POST("/alerts", auth.RequireAdmin(), notification.CreateGlobalAlert)
			secured.PUT("/alerts/:id", auth.RequireAdmin(), notification.ToggleGlobalAlert)
			secured.DELETE("/alerts/:id", auth.RequireAdmin(), notification.DeleteGlobalAlert)

			secured.GET("/service-messages/:serviceId", notification.GetServiceMessages)
			secured.POST("/service-messages", auth.RequireAdmin(), notification.CreateServiceMessage)
			secured.PUT("/service-messages/:id", auth.RequireAdmin(), notification.ToggleServiceMessage)
			secured.DELETE("/service-messages/:id", auth.RequireAdmin(), notification.DeleteServiceMessage)

			settingsGroup := secured.Group("/settings")
			{
				settingsGroup.GET("/:key", service.GetSetting)
				settingsGroup.PUT("/:key", auth.RequireAdmin(), service.UpdateSetting)
			}

			secured.POST("/uploads", service.UploadFile)
			secured.POST("/uploads/", service.UploadFile)

			serviceGroup := secured.Group("/services")
			{
				serviceGroup.POST("/request", service.CreateServiceRequest)
				serviceGroup.POST("/request/", service.CreateServiceRequest)
				serviceGroup.POST("/:id/status", auth.RequireAdmin(), service.UpdateServiceRequestStatus)
				serviceGroup.POST("/:id/status/", auth.RequireAdmin(), service.UpdateServiceRequestStatus)
				serviceGroup.POST("/:id/resubmit", service.ResubmitServiceRequest)
				serviceGroup.POST("/:id/resubmit/", service.ResubmitServiceRequest)
				serviceGroup.GET("/requests", service.GetServiceRequests)
				serviceGroup.POST("/dynamic", auth.RequireAdmin(), service.CreateDynamicService)
				serviceGroup.GET("/dynamic", service.GetDynamicServices)
				serviceGroup.PUT("/dynamic/:id", auth.RequireAdmin(), service.UpdateDynamicService)
				serviceGroup.PUT("/dynamic/:id/cost", auth.RequireAdmin(), service.UpdateOfficialCost)
				serviceGroup.DELETE("/dynamic/:id", auth.RequireAdmin(), service.DeleteDynamicService)
				serviceGroup.GET("/pricing", service.GetPricingConfig)
				serviceGroup.PUT("/pricing", auth.RequireAdmin(), service.UpdatePricingConfig)
				serviceGroup.GET("/pdf-pricing", service.GetPdfPricingConfig)
				serviceGroup.PUT("/pdf-pricing", auth.RequireAdmin(), service.UpdatePdfPricingConfig)
				serviceGroup.GET("/pdf-catalog", service.GetPdfServicesCatalog)
				serviceGroup.PUT("/pdf-catalog", auth.RequireAdmin(), service.UpdatePdfServicesCatalog)
			}

			walletGroup := secured.Group("/wallet")
			{
				walletGroup.GET("/transactions", service.GetWalletTransactions)
				walletGroup.GET("/balance", wallet.GetWalletBalance)
				walletGroup.POST("/reset", auth.RequireAdmin(), wallet.ResetWallet)
				walletGroup.POST("/recharge/gateway", wallet.InitiateGatewayRecharge)
				walletGroup.POST("/recharge/manual", auth.RequireAdmin(), wallet.ManualRecharge)
				walletGroup.GET("/recharge/status/:order_id", wallet.CheckGatewayRechargeStatus)
				walletGroup.POST("/recharge/confirm", service.ConfirmGatewayRecharge)
			}

			adminGroup := secured.Group("/admin")
			adminGroup.Use(auth.RequireAdmin())
			{
				adminGroup.GET("/dashboard", admin.GetDashboardStats)
				adminGroup.POST("/dashboard/reset", admin.ResetDashboardCounts)
				adminGroup.POST("/dashboard/reset/", admin.ResetDashboardCounts)
				adminGroup.POST("/dashboard/clear-reset", admin.ClearDashboardReset)
				adminGroup.POST("/dashboard/clear-reset/", admin.ClearDashboardReset)
				adminGroup.GET("/partners-overview", admin.GetPartnersOverview)
				adminGroup.GET("/wallet/transactions", admin.GetAdminWalletTransactions)
				adminGroup.GET("/daily-payments", admin.GetDailyPayments)
				adminGroup.POST("/wallet/add-money", admin.AdminAddMoneyHandler)
				adminGroup.POST("/wallet/credit", wallet.AdminCreditWallet)
			}

			secured.POST("/v1/wallet/recharge/gateway", service.RechargeGateway)
			secured.POST("/v1/external-api/aadhaar-to-pan", apizone.AadhaarToPan)
			secured.POST("/v1/external-api/aadhaar-to-pan/", apizone.AadhaarToPan)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
