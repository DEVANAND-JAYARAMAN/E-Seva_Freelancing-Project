package main

import (
	"log"
	"os"

	"eservice-backend/auth"
	"eservice-backend/billing"
	"eservice-backend/crm"
	"eservice-backend/db"

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
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001", "http://13.233.100.136:3000", "http://13.233.100.136", "https://main.dft1zhsxacjk.amplifyapp.com"}
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
