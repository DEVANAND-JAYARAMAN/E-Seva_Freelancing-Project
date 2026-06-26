const fs = require('fs');

let code = fs.readFileSync('backend/service/service_handlers.go', 'utf8');

const targetWebhook = `type RechargeWebhookReq struct {
	OrderID string  \`form:"order_id" json:"order_id"\`
	Status  string  \`form:"status" json:"status"\`
	Amount  float64 \`form:"amount" json:"amount"\`
	UTR     string  \`form:"utr" json:"utr"\`
}

// RechargeWebhook handles the callback from Mugavai payment gateway
func RechargeWebhook(c *gin.Context) {
	var req RechargeWebhookReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[Webhook] Order=%s Status=%s Amount=%.2f UTR=%s", req.OrderID, req.Status, req.Amount, req.UTR)

	if req.Status != "SUCCESS" && req.Status != "success" {
		c.JSON(http.StatusOK, gin.H{"status": "received"})
		return
	}

	// Look up orderId → userId mapping`;

const replWebhook = `type RechargeWebhookReq struct {
	OrderID      string      \`form:"order_id" json:"order_id"\`
	ClientTxnID  string      \`form:"client_txn_id" json:"client_txn_id"\`
	TxnID        string      \`form:"txn_id" json:"txn_id"\`
	Status       string      \`form:"status" json:"status"\`
	Amount       interface{} \`form:"amount" json:"amount"\`
	UTR          string      \`form:"utr" json:"utr"\`
	UpiTxnID     string      \`form:"upi_txn_id" json:"upi_txn_id"\`
}

// RechargeWebhook handles the callback from Mugavai payment gateway
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
	}

	// Look up orderId → userId mapping
	meta, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("WalletTransactions"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "ORDER#" + actualOrderID},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil || meta.Item == nil {
		log.Printf("[Webhook] Order meta not found for %s", actualOrderID)
		c.JSON(http.StatusOK, gin.H{"status": "order_not_found"})
		return
	}

	userIdAttr, ok := meta.Item["userId"].(*types.AttributeValueMemberS)
	if !ok || userIdAttr.Value == "" {
		c.JSON(http.StatusOK, gin.H{"status": "user_not_found"})
		return
	}
	userId := userIdAttr.Value

	now := time.Now().UTC()
	amountStr := fmt.Sprintf("%.2f", parsedAmount)

	// Credit Wallets table`;

if (code.includes('type RechargeWebhookReq struct')) {
    code = code.split(targetWebhook).join(replWebhook);
}

fs.writeFileSync('backend/service/service_handlers.go', code);
console.log('Webhook fixed');
