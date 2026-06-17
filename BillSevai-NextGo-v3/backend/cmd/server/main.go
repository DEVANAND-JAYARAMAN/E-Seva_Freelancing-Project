package main

import (
	"log"

	"github.com/billsevai/api/internal/config"
	"github.com/billsevai/api/internal/db"
	"github.com/billsevai/api/internal/handlers"
	"github.com/billsevai/api/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	database, err := db.Connect(cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	r := gin.Default()
	r.Use(middleware.CORS(cfg.FrontendURL))

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", handlers.Login(database, cfg.JWTSecret))
		api.POST("/auth/register", handlers.Register(database, cfg.JWTSecret))

		auth := api.Group("")
		auth.Use(middleware.Auth(cfg.JWTSecret))
		{
			auth.GET("/dashboard", handlers.Dashboard(database))
			auth.GET("/shop", handlers.GetShop(database))
			auth.PUT("/shop", handlers.UpdateShop(database))
			auth.GET("/services", handlers.ListServices(database))
			auth.POST("/services", handlers.CreateService(database))
			auth.GET("/customers", handlers.ListCustomers(database))
			auth.POST("/customers", handlers.CreateCustomer(database))
			auth.GET("/bills", handlers.ListBills(database))
			auth.GET("/bills/:id", handlers.GetBill(database))
			auth.POST("/bills", handlers.CreateBill(database))
		}
	}

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "app": "BillSevai API"}) })
	log.Println("BillSevai API on :" + cfg.Port)
	_ = r.Run(":" + cfg.Port)
}
