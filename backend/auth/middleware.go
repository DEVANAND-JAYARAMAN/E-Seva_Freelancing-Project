package auth

import (
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	ContextUserID = "authUserId"
	ContextRole   = "authRole"
)

func jwtSecretBytes() []byte {
	if s := strings.TrimSpace(os.Getenv("JWT_SECRET")); s != "" {
		return []byte(s)
	}
	// Keep legacy default so already-issued tokens remain valid until rotated.
	return []byte("your-super-secret-jwt-key-change-this-in-production")
}

func parseBearerClaims(c *gin.Context) (userId string, role string, err error) {
	header := c.GetHeader("Authorization")
	if header == "" {
		return "", "", errors.New("Authorization required")
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
		return "", "", errors.New("Invalid Authorization header")
	}
	tokenStr := strings.TrimSpace(parts[1])
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenSignatureInvalid
		}
		return jwtSecretBytes(), nil
	})
	if err != nil || token == nil || !token.Valid {
		return "", "", errors.New("Invalid or expired token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", errors.New("Invalid token claims")
	}
	userId, _ = claims["userId"].(string)
	role, _ = claims["role"].(string)
	userId = strings.TrimSpace(userId)
	role = strings.ToLower(strings.TrimSpace(role))
	if userId == "" {
		return "", "", errors.New("Invalid token subject")
	}
	return userId, role, nil
}

func setAuthContext(c *gin.Context, userId, role string) {
	c.Set(ContextUserID, userId)
	c.Set(ContextRole, role)
}

// RequireAuth validates Bearer JWT and stores userId/role on the Gin context.
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, role, err := parseBearerClaims(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		setAuthContext(c, userId, role)
		c.Next()
	}
}

// RequireAdmin requires a valid JWT with role=admin.
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, role, err := parseBearerClaims(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}
		setAuthContext(c, userId, role)
		c.Next()
	}
}

func UserID(c *gin.Context) string {
	v, _ := c.Get(ContextUserID)
	s, _ := v.(string)
	return s
}

func Role(c *gin.Context) string {
	v, _ := c.Get(ContextRole)
	s, _ := v.(string)
	return s
}

func IsAdmin(c *gin.Context) bool {
	return Role(c) == "admin"
}
