const fs = require('fs');

let code = fs.readFileSync('backend/service/service_handlers.go', 'utf8');

const targetWebhook = `// RechargeWebhook handles the callback from Mugavai payment gateway
func RechargeWebhook(c *gin.Context) {
	var req RechargeWebhookReq
	if err := c.ShouldBind(&req); err != nil {
		log.Printf("[Webhook] Error binding: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	actualOrderID := req.OrderID
	if actualOrderID == "" {
		actualOrderID = req.ClientTxnID
	}

	actualUTR := req.UTR
	if actualUTR == "" {
		actualUTR = req.UpiTxnID
	}

	var parsedAmount float64
	switch v := req.Amount.(type) {
	case float64:
		parsedAmount = v
	case string:
		fmt.Sscanf(v, "%f", &parsedAmount)
	}

	log.Printf("[Webhook] Order=%s Status=%s Amount=%.2f UTR=%s", actualOrderID, req.Status, parsedAmount, actualUTR)

	if req.Status != "SUCCESS" && req.Status != "success" && req.Status != "COMPLETED" && req.Status != "Completed" {
		c.JSON(http.StatusOK, gin.H{"status": "received"})
		return
	}`;

const replWebhook = `// RechargeWebhook handles the callback from Mugavai payment gateway
func RechargeWebhook(c *gin.Context) {
	// Parse form data and query params
	_ = c.Request.ParseForm()
	
	// Fallback JSON binding if it's purely JSON
	var jsonBody map[string]interface{}
	c.ShouldBindJSON(&jsonBody)

	getParam := func(keys ...string) string {
		for _, k := range keys {
			if v := c.Query(k); v != "" {
				return v
			}
			if v := c.PostForm(k); v != "" {
				return v
			}
			if jsonBody != nil {
				if v, ok := jsonBody[k]; ok {
					return fmt.Sprintf("%v", v)
				}
			}
		}
		return ""
	}

	actualOrderID := getParam("order_id", "client_txn_id", "txn_id")
	actualUTR := getParam("utr", "upi_txn_id", "bank_txn_id")
	status := getParam("status")
	amountStr := getParam("amount")

	var parsedAmount float64
	fmt.Sscanf(amountStr, "%f", &parsedAmount)

	log.Printf("[Webhook] Parsed Form Data -> Order=%s Status=%s Amount=%.2f UTR=%s (RawAmount=%s)", actualOrderID, status, parsedAmount, actualUTR, amountStr)

	// Dump raw body for debugging
	log.Printf("[Webhook] Query: %v | Form: %v | JSON: %v", c.Request.URL.RawQuery, c.Request.PostForm, jsonBody)

	if status != "SUCCESS" && status != "success" && status != "COMPLETED" && status != "Completed" {
		c.JSON(http.StatusOK, gin.H{"status": "received", "message": "Not a success status"})
		return
	}`;

if (code.includes('func RechargeWebhook(c *gin.Context) {')) {
    code = code.split(targetWebhook).join(replWebhook);
}

fs.writeFileSync('backend/service/service_handlers.go', code);
console.log('Webhook fixed');
