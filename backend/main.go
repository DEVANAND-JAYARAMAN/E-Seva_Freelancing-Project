package main

import (
	"log"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "eservice-backend/docs"
	"eservice-backend/handlers"
	"eservice-backend/auth"
	"eservice-backend/db"
)

// @title E-Seva Platform API
// @version 1.0
// @description Backend API for E-Seva Platform managing services, retailers, and notifications.
// @host localhost:8080
// @BasePath /api

func main() {
	// Initialize DynamoDB Client (from the new db package)
	db.ConnectDynamoDB()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Swagger Endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	{
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/signup", auth.Signup)
			authGroup.POST("/login", auth.Login)
		}

		// 1. Submit a service request after payment
		api.POST("/services/request", handlers.SubmitServiceRequest)

		// 2. Admin fetch all service requests
		api.GET("/admin/requests", handlers.GetAdminServiceRequests)

		// 3. Trigger Notification when new retailer/distributor is added
		api.POST("/admin/retailer", handlers.AddRetailerOrDistributor)

		// 4. WebSocket for real-time notifications in the admin panel
		api.GET("/admin/notifications/ws", handlers.NotificationsWS)
		
		// 5. REST fallback for notifications
		api.GET("/admin/notifications", handlers.GetNotifications)
	}

	log.Println("Starting API server on :8080")
	r.Run(":8080")
}
