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
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001", "http://3.111.41.182:3000", "http://3.111.41.182", "https://main.dft1zhsxacjk.amplifyapp.com", "https://thuruvancommunications.com"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
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

		walletGroup := api.Group("/wallets")
		{
			walletGroup.GET("/transactions", service.GetWalletTransactions)
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
