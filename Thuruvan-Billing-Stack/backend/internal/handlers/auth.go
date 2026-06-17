package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(db *sql.DB, secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginReq
		if err := c.BindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}
		var id int
		var name, hash string
		err := db.QueryRow("SELECT id, name, password_hash FROM users WHERE email = ?", req.Email).
			Scan(&id, &name, &hash)
		if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
			c.JSON(401, gin.H{"error": "invalid credentials"})
			return
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": id,
			"exp": time.Now().Add(24 * time.Hour).Unix(),
		})
		signed, _ := token.SignedString([]byte(secret))
		c.JSON(200, gin.H{"token": signed, "user": gin.H{"id": id, "name": name, "email": req.Email}})
	}
}
