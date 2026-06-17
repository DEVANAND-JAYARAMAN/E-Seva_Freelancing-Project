package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/thuruvan/billing-api/internal/config"
	"github.com/thuruvan/billing-api/internal/db"
	"github.com/thuruvan/billing-api/internal/handlers"
	"github.com/thuruvan/billing-api/internal/middleware"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	database, err := db.Connect(cfg.DSN())
	if err != nil {
		log.Fatal("db connect:", err)
	}
	defer database.Close()

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS(cfg.FrontendURL))

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", handlers.Login(database, cfg.JWTSecret))

		auth := api.Group("")
		auth.Use(middleware.Auth(cfg.JWTSecret))
		{
			auth.GET("/shop", handlers.GetShop(database))
			auth.PUT("/shop", handlers.UpdateShop(database))

			auth.GET("/services", handlers.ListServices(database))
			auth.POST("/services", handlers.CreateService(database))
			auth.PATCH("/services/:id/toggle", handlers.ToggleService(database))

			auth.GET("/bills", handlers.ListBills(database))
			auth.GET("/bills/:id", handlers.GetBill(database))
			auth.POST("/bills", handlers.CreateBill(database))
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	addr := ":" + cfg.Port
	log.Println("billing-api listening on", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
