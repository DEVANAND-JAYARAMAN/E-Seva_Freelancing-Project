package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thuruvan/billing-api/internal/models"
)

func GetShop(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var s models.Shop
		err := db.QueryRow(`SELECT id,name,tagline,address,phone,upi_id,bill_prefix,currency,last_bill_no,footer_note FROM shop WHERE id=1`).
			Scan(&s.ID, &s.Name, &s.Tagline, &s.Address, &s.Phone, &s.UPIID, &s.BillPrefix, &s.Currency, &s.LastBillNo, &s.FooterNote)
		if err != nil {
			c.JSON(500, gin.H{"error": "shop not found"})
			return
		}
		c.JSON(200, s)
	}
}

func UpdateShop(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var s models.Shop
		if err := c.BindJSON(&s); err != nil {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}
		_, err := db.Exec(`UPDATE shop SET name=?, tagline=?, address=?, phone=?, upi_id=?, bill_prefix=?, footer_note=? WHERE id=1`,
			s.Name, s.Tagline, s.Address, s.Phone, s.UPIID, s.BillPrefix, s.FooterNote)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"ok": true})
	}
}

func ListServices(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query(`SELECT id,name,category,rate,status FROM services ORDER BY category, name`)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var list []models.Service
		for rows.Next() {
			var s models.Service
			_ = rows.Scan(&s.ID, &s.Name, &s.Category, &s.Rate, &s.Status)
			list = append(list, s)
		}
		c.JSON(200, list)
	}
}

func CreateService(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var s models.Service
		if err := c.BindJSON(&s); err != nil {
			c.JSON(400, gin.H{"error": "invalid body"})
			return
		}
		if s.Category == "" {
			s.Category = "General"
		}
		res, err := db.Exec(`INSERT INTO services (name,category,rate) VALUES (?,?,?)`, s.Name, s.Category, s.Rate)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		s.ID = int(id)
		s.Status = "active"
		c.JSON(201, s)
	}
}

func ToggleService(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec(`UPDATE services SET status = IF(status='active','inactive','active') WHERE id=?`, id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"ok": true})
	}
}
