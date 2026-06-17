package handlers

import (
	"database/sql"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var slugRe = regexp.MustCompile(`[^a-z0-9]+`)

func tokenFor(secret string, uid, shopID int64, role string) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid": uid, "shop_id": shopID, "role": role,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})
	return t.SignedString([]byte(secret))
}

func Login(db *sql.DB, secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if c.BindJSON(&req) != nil {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}
		var uid, shopID int64
		var name, hash, role string
		err := db.QueryRow(`SELECT u.id, u.shop_id, u.name, u.password_hash, u.role FROM users u WHERE u.email=?`, req.Email).
			Scan(&uid, &shopID, &name, &hash, &role)
		if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
			c.JSON(401, gin.H{"error": "invalid credentials"})
			return
		}
		tok, _ := tokenFor(secret, uid, shopID, role)
		c.JSON(200, gin.H{"token": tok, "user": gin.H{"id": uid, "name": name, "email": req.Email, "role": role, "shop_id": shopID}})
	}
}

func Register(db *sql.DB, secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ShopName string `json:"shop_name"`
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if c.BindJSON(&req) != nil || req.Email == "" || req.Password == "" || req.ShopName == "" {
			c.JSON(400, gin.H{"error": "shop_name, email, password required"})
			return
		}
		slug := slugRe.ReplaceAllString(strings.ToLower(req.ShopName), "-")
		slug = strings.Trim(slug, "-")
		hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 10)

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer tx.Rollback()

		trial := time.Now().Add(14 * 24 * time.Hour)
		res, err := tx.Exec(`INSERT INTO shops (name, slug, trial_ends_at) VALUES (?,?,?)`, req.ShopName, slug, trial)
		if err != nil {
			c.JSON(400, gin.H{"error": "shop already exists or invalid"})
			return
		}
		shopID, _ := res.LastInsertId()
		name := req.Name
		if name == "" {
			name = req.ShopName
		}
		res, err = tx.Exec(`INSERT INTO users (shop_id,name,email,password_hash,role) VALUES (?,?,?,?,'owner')`,
			shopID, name, req.Email, string(hash))
		if err != nil {
			c.JSON(400, gin.H{"error": "email already registered"})
			return
		}
		uid, _ := res.LastInsertId()

		defaults := [][3]interface{}{
			{"Xerox B/W (1 side)", "Xerox Work", 2.0},
			{"Aadhaar Print", "Aadhaar", 30.0},
			{"Community Certificate", "e-Sevai / CSC", 60.0},
		}
		for _, d := range defaults {
			_, _ = tx.Exec(`INSERT INTO services (shop_id,name,category,rate) VALUES (?,?,?,?)`, shopID, d[0], d[1], d[2])
		}
		if err = tx.Commit(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		tok, _ := tokenFor(secret, uid, shopID, "owner")
		c.JSON(201, gin.H{"token": tok, "user": gin.H{"id": uid, "shop_id": shopID, "email": req.Email}})
	}
}

func Dashboard(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := c.MustGet("shop_id").(int64)
		today := time.Now().Format("2006-01-02")
		var count int
		var total float64
		_ = db.QueryRow(`SELECT COUNT(*), COALESCE(SUM(total),0) FROM bills WHERE shop_id=? AND DATE(created_at)=?`, sid, today).Scan(&count, &total)
		c.JSON(200, gin.H{"today_bills": count, "today_total": total})
	}
}
