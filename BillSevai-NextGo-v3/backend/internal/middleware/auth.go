package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func CORS(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
			return
		}
		token, err := jwt.Parse(strings.TrimPrefix(h, "Bearer "), func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", int64(claims["uid"].(float64)))
		c.Set("shop_id", int64(claims["shop_id"].(float64)))
		c.Set("role", claims["role"].(string))
		c.Next()
	}
}

func ShopID(c *gin.Context) int64 { return c.GetInt64("shop_id") }
func UserID(c *gin.Context) int64 { return c.GetInt64("user_id") }
