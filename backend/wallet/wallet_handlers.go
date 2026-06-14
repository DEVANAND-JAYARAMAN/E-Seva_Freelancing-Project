package wallet

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

const mugavaiBaseURL = "https://mugavaipaymentgetway.in/api/v1"

type GatewayRechargeRequest struct {
	Amount         float64 `json:"amount" binding:"required,gt=0"`
	CustomerMobile string  `json:"customer_mobile" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required"`
	RedirectURL    string  `json:"redirect_url"`
	VPA            string  `json:"vpa"`
	UpiId          string  `json:"upi_id"`
}

type mugavaiOrderRequest struct {
	Amount         float64 `json:"amount"`
	CustomerMobile string  `json:"customer_mobile"`
	CustomerEmail  string  `json:"customer_email"`
	RedirectURL    string  `json:"redirect_url"`
	OrderID        string  `json:"order_id"`
}

type mugavaiOrderResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Amount         interface{} `json:"amount"`
		CustomerMobile string      `json:"customer_mobile"`
		CustomerEmail  string      `json:"customer_email"`
		OrderID        string      `json:"order_id"`
		PaymentURL     string      `json:"payment_url"`
		QRImage        string      `json:"qr_image"`
	} `json:"data"`
}

type MugavaiCallbackPayload struct {
	OrderID       string `json:"order_id"`
	TransactionID string `json:"transaction_id"`
	Amount        string `json:"amount"`
	Status        string `json:"status"` // "success" | "failed" | "pending"
	Mobile        string `json:"mobile"`
}

// HandlePaymentCallback receives POST from Mugavai after payment completes
// and credits the Wallets table + writes a WalletTransactions record.
func HandlePaymentCallback(c *gin.Context) {
	var payload MugavaiCallbackPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	log.Printf("[Mugavai Callback] OrderID=%s TxID=%s Status=%s Amount=%s Mobile=%s",
		payload.OrderID, payload.TransactionID, payload.Status, payload.Amount, payload.Mobile)

	if payload.Status != "success" && payload.Status != "SUCCESS" {
		// Not a success — just acknowledge, no credit
		c.JSON(http.StatusOK, gin.H{"status": "received"})
		return
	}

	amount, err := strconv.ParseFloat(payload.Amount, 64)
	if err != nil || amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid amount"})
		return
	}

	now := time.Now().UTC()
	ownerPK := "WALLET#" + payload.Mobile
	walletSK := "TYPE#Main"

	// 1. Credit balance in Wallets table using atomic ADD
	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: ownerPK},
			"SK": &types.AttributeValueMemberS{Value: walletSK},
		},
		UpdateExpression: aws.String("ADD balance :amt, totalCredits :amt SET updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt": &types.AttributeValueMemberN{Value: payload.Amount},
			":ts":  &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("[Mugavai Callback] Failed to credit wallet for %s: %v", payload.Mobile, err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Wallet credit failed"})
		return
	}

	// 2. Write transaction record to WalletTransactions table
	txId := "TX#" + now.Format("20060102150405") + "#" + payload.OrderID
	txRecord := map[string]interface{}{
		"PK":          ownerPK,
		"SK":          txId,
		"id":          payload.OrderID,
		"date":        now.Format("01/02/2006, 03:04 PM"),
		"type":        "credit",
		"description": fmt.Sprintf("Wallet Recharge via Mugavai Gateway (TxID: %s)", payload.TransactionID),
		"amount":      amount,
		"reference":   payload.TransactionID,
		"status":      "Success",
		"walletType":  "Main",
		"createdAt":   now.Format(time.RFC3339),
	}

	item, _ := attributevalue.MarshalMap(txRecord)
	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item:      item,
	})
	if err != nil {
		log.Printf("[Mugavai Callback] Failed to write transaction record: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"status": "credited"})
}

func InitiateGatewayRecharge(c *gin.Context) {
	var req GatewayRechargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	username := os.Getenv("MUGAVAI_USERNAME")
	if username == "" {
		username = "6380616163"
	}
	apiKey := os.Getenv("MUGAVAI_API_KEY")
	if apiKey == "" {
		apiKey = "debd2880dc42f49b79248d72d90ca7d0262d4c125ed91a4d"
	}

	orderID := fmt.Sprintf("ORD-%d", time.Now().UnixMilli())

	payload := mugavaiOrderRequest{
		Amount:         req.Amount,
		CustomerMobile: req.CustomerMobile,
		CustomerEmail:  req.CustomerEmail,
		RedirectURL:    req.RedirectURL,
		OrderID:        orderID,
	}

	body, _ := json.Marshal(payload)

	apiURL := "https://mugavaipaymentgetway.in/api/v1/create_order.php"
	httpReq, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to build payment request"})
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-client-username", username)
	httpReq.Header.Set("x-client-apikey", apiKey)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"message": "Could not reach payment gateway: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusBadGateway, gin.H{"message": fmt.Sprintf("Payment gateway error (%d): %s", resp.StatusCode, string(bodyBytes))})
		return
	}

	var pgResp mugavaiOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&pgResp); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"message": "Invalid response from payment gateway"})
		return
	}

	if pgResp.Status != "success" {
		c.JSON(http.StatusBadGateway, gin.H{"message": pgResp.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"order_id":    pgResp.Data.OrderID,
			"payment_url": pgResp.Data.PaymentURL,
		},
	})
}
