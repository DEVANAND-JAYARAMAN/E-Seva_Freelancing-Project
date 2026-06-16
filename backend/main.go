package main

import (
	"log"
	"os"

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
	ec2IP := os.Getenv("EC2_PUBLIC_IP")
	allowOrigins := []string{"http://localhost:3000", "http://localhost:3001", "https://main.dft1zhsxacjk.amplifyapp.com", "https://thuruvancommunications.com"}
	if ec2IP != "" {
		allowOrigins = append(allowOrigins, "http://"+ec2IP, "http://"+ec2IP+":3000")
	}
	config.AllowOrigins = allowOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		authGroup := api.Group("/auth")
		{
			authGroup.POST("/signup", auth.Signup)
			authGroup.POST("/login", auth.Login)
		}

		crmGroup := api.Group("/crm")
		{
			crmGroup.POST("/customers", crm.CreateCustomer)
			crmGroup.GET("/customers", crm.GetCustomers)
		}

		billingGroup := api.Group("/billing")
		{
			billingGroup.POST("/invoices", billing.CreateInvoice)
			billingGroup.GET("/invoices", billing.GetInvoices)
		}

		notificationGroup := api.Group("/notifications")
		{
			notificationGroup.POST("/", notification.CreateNotification)
			notificationGroup.GET("/", notification.GetNotifications)
			notificationGroup.PATCH("/:id/read", notification.MarkAsRead)
		}

		serviceGroup := api.Group("/services")
		{
			serviceGroup.POST("/request", service.CreateServiceRequest)
			serviceGroup.POST("/:id/status", service.UpdateServiceRequestStatus)
			serviceGroup.GET("/requests", service.GetServiceRequests)
		}

		walletGroup := api.Group("/wallet")
		{
			walletGroup.GET("/transactions", service.GetWalletTransactions)
			walletGroup.POST("/recharge/gateway", wallet.InitiateGatewayRecharge)
			walletGroup.POST("/payment/callback", wallet.HandlePaymentCallback)
		}

		v1Group := api.Group("/v1")
		{
			walletV1 := v1Group.Group("/wallet")
			{
				walletV1.POST("/recharge/gateway", service.RechargeGateway)
				walletV1.POST("/recharge/webhook", service.RechargeWebhook)
			}
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
