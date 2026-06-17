package handlers

import (
	"database/sql"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/billsevai/api/internal/middleware"
)

func GetShop(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		row := db.QueryRow(`SELECT id,name,slug,tagline,address,phone,gstin,currency,bill_prefix,footer_note,brand_color,upi_id,print_format,plan,status FROM shops WHERE id=?`, sid)
		var s map[string]interface{} = make(map[string]interface{})
		var id int64
		var name, slug, currency, billPrefix, brandColor, printFormat, plan, status string
		var tagline, address, phone, gstin, footer, upi sql.NullString
		if err := row.Scan(&id, &name, &slug, &tagline, &address, &phone, &gstin, &currency, &billPrefix, &footer, &brandColor, &upi, &printFormat, &plan, &status); err != nil {
			c.JSON(404, gin.H{"error": "not found"})
			return
		}
		s["id"] = id
		s["name"] = name
		s["slug"] = slug
		s["currency"] = currency
		s["bill_prefix"] = billPrefix
		s["brand_color"] = brandColor
		s["print_format"] = printFormat
		s["plan"] = plan
		s["status"] = status
		if tagline.Valid {
			s["tagline"] = tagline.String
		}
		if address.Valid {
			s["address"] = address.String
		}
		if phone.Valid {
			s["phone"] = phone.String
		}
		if gstin.Valid {
			s["gstin"] = gstin.String
		}
		if footer.Valid {
			s["footer_note"] = footer.String
		}
		if upi.Valid {
			s["upi_id"] = upi.String
		}
		c.JSON(200, s)
	}
}

func UpdateShop(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		var req map[string]interface{}
		if c.BindJSON(&req) != nil {
			c.JSON(400, gin.H{"error": "invalid"})
			return
		}
		_, err := db.Exec(`UPDATE shops SET name=?, tagline=?, address=?, phone=?, gstin=?, upi_id=?, bill_prefix=?, footer_note=?, brand_color=?, print_format=? WHERE id=?`,
			req["name"], req["tagline"], req["address"], req["phone"], req["gstin"], req["upi_id"],
			req["bill_prefix"], req["footer_note"], req["brand_color"], req["print_format"], sid)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"ok": true})
	}
}

func ListServices(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		rows, err := db.Query(`SELECT id,name,category,counter,rate,cost,tax_rate,active FROM services WHERE shop_id=? ORDER BY category,name`, sid)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var out []gin.H
		for rows.Next() {
			var id int64
			var name, cat, counter string
			var rate, cost, tax float64
			var active int
			_ = rows.Scan(&id, &name, &cat, &counter, &rate, &cost, &tax, &active)
			out = append(out, gin.H{"id": id, "name": name, "category": cat, "counter": counter, "rate": rate, "cost": cost, "tax_rate": tax, "active": active == 1})
		}
		c.JSON(200, out)
	}
}

func CreateService(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		var req struct {
			Name, Category string
			Rate, Cost     float64
		}
		if c.BindJSON(&req) != nil {
			c.JSON(400, gin.H{"error": "invalid"})
			return
		}
		if req.Category == "" {
			req.Category = "General"
		}
		res, err := db.Exec(`INSERT INTO services (shop_id,name,category,rate,cost) VALUES (?,?,?,?,?)`, sid, req.Name, req.Category, req.Rate, req.Cost)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		c.JSON(201, gin.H{"id": id})
	}
}

func ListCustomers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		q := c.Query("q")
		var rows *sql.Rows
		var err error
		if q != "" {
			like := "%" + q + "%"
			rows, err = db.Query(`SELECT id,name,mobile,credit_balance FROM customers WHERE shop_id=? AND (name LIKE ? OR mobile LIKE ?) LIMIT 50`, sid, like, like)
		} else {
			rows, err = db.Query(`SELECT id,name,mobile,credit_balance FROM customers WHERE shop_id=? ORDER BY id DESC LIMIT 100`, sid)
		}
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var out []gin.H
		for rows.Next() {
			var id int64
			var name string
			var mobile sql.NullString
			var credit float64
			_ = rows.Scan(&id, &name, &mobile, &credit)
			m := gin.H{"id": id, "name": name, "credit_balance": credit}
			if mobile.Valid {
				m["mobile"] = mobile.String
			}
			out = append(out, m)
		}
		c.JSON(200, out)
	}
}

func CreateCustomer(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		var req struct{ Name, Mobile, Address string }
		if c.BindJSON(&req) != nil || req.Name == "" {
			c.JSON(400, gin.H{"error": "name required"})
			return
		}
		res, err := db.Exec(`INSERT INTO customers (shop_id,name,mobile,address) VALUES (?,?,?,?)`, sid, req.Name, req.Mobile, req.Address)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		c.JSON(201, gin.H{"id": id})
	}
}

func ListBills(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		date := c.DefaultQuery("date", "")
		q := `SELECT id,bill_no,customer_name,customer_mobile,total,pay_mode,status,created_at FROM bills WHERE shop_id=?`
		args := []interface{}{sid}
		if date != "" {
			q += ` AND DATE(created_at)=?`
			args = append(args, date)
		}
		q += ` ORDER BY id DESC LIMIT 200`
		rows, err := db.Query(q, args...)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var out []gin.H
		for rows.Next() {
			var id int64
			var billNo, custName, payMode, status string
			var mobile sql.NullString
			var total float64
			var created interface{}
			_ = rows.Scan(&id, &billNo, &custName, &mobile, &total, &payMode, &status, &created)
			b := gin.H{"id": id, "bill_no": billNo, "customer_name": custName, "total": total, "pay_mode": payMode, "status": status, "created_at": created}
			if mobile.Valid {
				b["customer_mobile"] = mobile.String
			}
			out = append(out, b)
		}
		c.JSON(200, out)
	}
}

func GetBill(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		id := c.Param("id")
		var b gin.H = make(gin.H)
		var billID int64
		var billNo, custName, payMode, status string
		var mobile sql.NullString
		var sub, disc, total float64
		var created interface{}
		err := db.QueryRow(`SELECT id,bill_no,customer_name,customer_mobile,subtotal,discount,total,pay_mode,status,created_at FROM bills WHERE id=? AND shop_id=?`, id, sid).
			Scan(&billID, &billNo, &custName, &mobile, &sub, &disc, &total, &payMode, &status, &created)
		if err != nil {
			c.JSON(404, gin.H{"error": "not found"})
			return
		}
		b["id"] = billID
		b["bill_no"] = billNo
		b["customer_name"] = custName
		b["subtotal"] = sub
		b["discount"] = disc
		b["total"] = total
		b["pay_mode"] = payMode
		b["status"] = status
		b["created_at"] = created
		if mobile.Valid {
			b["customer_mobile"] = mobile.String
		}
		rows, _ := db.Query(`SELECT name,rate,qty,amount,tax_amount FROM bill_items WHERE bill_id=?`, id)
		defer rows.Close()
		var items []gin.H
		for rows.Next() {
			var name string
			var rate, amt, tax float64
			var qty int
			_ = rows.Scan(&name, &rate, &qty, &amt, &tax)
			items = append(items, gin.H{"service_name": name, "rate": rate, "qty": qty, "amount": amt, "tax_amount": tax})
		}
		b["items"] = items
		var sName, sTag, sAddr, sPhone, sCur, sFoot, sUpi, sBrand sql.NullString
		_ = db.QueryRow(`SELECT name,tagline,address,phone,currency,footer_note,upi_id,brand_color FROM shops WHERE id=?`, sid).
			Scan(&sName, &sTag, &sAddr, &sPhone, &sCur, &sFoot, &sUpi, &sBrand)
		shop := gin.H{"name": sName.String, "currency": sCur.String}
		if sTag.Valid {
			shop["tagline"] = sTag.String
		}
		if sAddr.Valid {
			shop["address"] = sAddr.String
		}
		if sPhone.Valid {
			shop["phone"] = sPhone.String
		}
		if sFoot.Valid {
			shop["footer_note"] = sFoot.String
		}
		if sUpi.Valid {
			shop["upi_id"] = sUpi.String
		}
		if sBrand.Valid {
			shop["brand_color"] = sBrand.String
		}
		b["shop"] = shop
		c.JSON(200, b)
	}
}

func CreateBill(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := middleware.ShopID(c)
		uid := middleware.UserID(c)
		var req struct {
			CustomerName, CustomerMobile, PayMode, Status string
			CustomerID                                   *int64
			Discount, GstPct                             float64
			Items                                        []struct {
				ID   *int64  `json:"id"`
				Name string  `json:"name"`
				Rate float64 `json:"rate"`
				Qty  int     `json:"qty"`
			} `json:"items"`
		}
		if c.BindJSON(&req) != nil || len(req.Items) == 0 {
			c.JSON(400, gin.H{"error": "items required"})
			return
		}
		if req.CustomerName == "" {
			req.CustomerName = "Walk-in"
		}
		if req.PayMode == "" {
			req.PayMode = "Cash"
		}
		if req.Status == "" {
			req.Status = "Completed"
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer tx.Rollback()

		var prefix string
		var lastNo int
		if err = tx.QueryRow(`SELECT bill_prefix,last_bill_no FROM shops WHERE id=? FOR UPDATE`, sid).Scan(&prefix, &lastNo); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		lastNo++
		billNo := fmt.Sprintf("%s%04d", prefix, lastNo)

		var subtotal, taxTotal float64
		type line struct {
			svcID      sql.NullInt64
			name       string
			rate       float64
			qty        int
			amount     float64
			cost, tax  float64
		}
		var lines []line
		for _, it := range req.Items {
			qty := it.Qty
			if qty < 1 {
				qty = 1
			}
			amt := it.Rate * float64(qty)
			tax := 0.0
			if req.GstPct > 0 {
				tax = amt * req.GstPct / 100
			}
			var svcID sql.NullInt64
			if it.ID != nil {
				svcID = sql.NullInt64{Int64: *it.ID, Valid: true}
			}
			lines = append(lines, line{svcID, it.Name, it.Rate, qty, amt, 0, tax})
			subtotal += amt
			taxTotal += tax
		}
		total := subtotal - req.Discount + taxTotal
		if total < 0 {
			total = 0
		}

		res, err := tx.Exec(`INSERT INTO bills (shop_id,user_id,customer_id,bill_no,customer_name,customer_mobile,subtotal,discount,total,pay_mode,status)
			VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
			sid, uid, req.CustomerID, billNo, req.CustomerName, nullStr(req.CustomerMobile), subtotal, req.Discount, total, req.PayMode, req.Status)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		billID, _ := res.LastInsertId()
		for _, ln := range lines {
			_, err = tx.Exec(`INSERT INTO bill_items (bill_id,service_id,name,rate,qty,amount,item_cost,tax_amount) VALUES (?,?,?,?,?,?,?,?)`,
				billID, ln.svcID, ln.name, ln.rate, ln.qty, ln.amount, ln.cost, ln.tax)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
		_, _ = tx.Exec(`UPDATE shops SET last_bill_no=? WHERE id=?`, lastNo, sid)
		if err = tx.Commit(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(201, gin.H{"id": billID, "bill_no": billNo, "total": total})
	}
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
