package admin

import "github.com/gin-gonic/gin"

// EC2 start/stop is handled by Lambda function.
// This package is kept for future backend-side admin routes.

func RegisterRoutes(api *gin.RouterGroup) {
	api.GET("/admin/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
