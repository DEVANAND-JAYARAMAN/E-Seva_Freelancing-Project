package handlers

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/thuruvan/billing-api/internal/models"
)

func ListBills(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		date := c.Query("date")
		if date == "" {
			date = time.Now().Format("2006-01-02")
		}
		rows, err := db.Query(`SELECT id,bill_no,customer_name,customer_mobile,subtotal,discount,total,pay_mode,created_at
			FROM bills WHERE DATE(created_at)=? ORDER BY id DESC`, date)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var bills []models.Bill
		for rows.Next() {
			var b models.Bill
			_ = rows.Scan(&b.ID, &b.BillNo, &b.CustomerName, &b.CustomerMobile, &b.Subtotal, &b.Discount, &b.Total, &b.PayMode, &b.CreatedAt)
			bills = append(bills, b)
		}
		c.JSON(200, bills)
	}
}

func GetBill(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var b models.Bill
		err := db.QueryRow(`SELECT id,bill_no,customer_name,customer_mobile,subtotal,discount,total,pay_mode,created_at FROM bills WHERE id=?`, id).
			Scan(&b.ID, &b.BillNo, &b.CustomerName, &b.CustomerMobile, &b.Subtotal, &b.Discount, &b.Total, &b.PayMode, &b.CreatedAt)
		if err != nil {
			c.JSON(404, gin.H{"error": "not found"})
			return
		}
		rows, _ := db.Query(`SELECT id,service_name,rate,qty,amount FROM bill_items WHERE bill_id=?`, id)
		defer rows.Close()
		for rows.Next() {
			var it models.BillItem
			_ = rows.Scan(&it.ID, &it.ServiceName, &it.Rate, &it.Qty, &it.Amount)
			b.Items = append(b.Items, it)
		}
		c.JSON(200, b)
	}
}

func CreateBill(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateBillRequest
		if err := c.BindJSON(&req); err != nil || len(req.Items) == 0 {
			c.JSON(400, gin.H{"error": "items required"})
			return
		}
		if req.CustomerName == "" {
			req.CustomerName = "Walk-in"
		}
		if req.PayMode == "" {
			req.PayMode = "Cash"
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer tx.Rollback()

		var prefix string
		var lastNo int
		if err := tx.QueryRow(`SELECT bill_prefix, last_bill_no FROM shop WHERE id=1 FOR UPDATE`).Scan(&prefix, &lastNo); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		lastNo++
		billNo := fmt.Sprintf("%s%04d", prefix, lastNo)

		var subtotal float64
		for _, it := range req.Items {
			qty := it.Qty
			if qty < 1 {
				qty = 1
			}
			subtotal += it.Rate * float64(qty)
		}
		total := subtotal - req.Discount
		if total < 0 {
			total = 0
		}

		res, err := tx.Exec(`INSERT INTO bills (bill_no,customer_name,customer_mobile,subtotal,discount,total,pay_mode)
			VALUES (?,?,?,?,?,?,?)`, billNo, req.CustomerName, nullStr(req.CustomerMobile), subtotal, req.Discount, total, req.PayMode)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		billID, _ := res.LastInsertId()

		for _, it := range req.Items {
			qty := it.Qty
			if qty < 1 {
				qty = 1
			}
			amt := it.Rate * float64(qty)
			_, err = tx.Exec(`INSERT INTO bill_items (bill_id,service_name,rate,qty,amount) VALUES (?,?,?,?,?)`,
				billID, it.Name, it.Rate, qty, amt)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}

		if _, err = tx.Exec(`UPDATE shop SET last_bill_no=? WHERE id=1`, lastNo); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		if err = tx.Commit(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(201, gin.H{"id": billID, "bill_no": billNo})
	}
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
