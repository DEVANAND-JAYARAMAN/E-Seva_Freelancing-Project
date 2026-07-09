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
	"eservice-backend/service"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)


type GatewayRechargeRequest struct {
	Amount         float64 `json:"amount" binding:"required,gt=0"`
	CustomerMobile string  `json:"customer_mobile" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required"`
	RedirectURL    string  `json:"redirect_url"`
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
	success, msg := service.ProcessMugavaiPayment(c)
	if success {
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": msg})
	} else {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "message": msg})
	}
}

func InitiateGatewayRecharge(c *gin.Context) {
	var req GatewayRechargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	username := os.Getenv("MUGAVAI_USERNAME")
	if username == "" {
		username = "8526629676"
	}
	apiKey := os.Getenv("MUGAVAI_API_KEY")

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

type ManualRechargeRequest struct {
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	UtrNumber string  `json:"utrNumber" binding:"required"`
	Remarks   string  `json:"remarks"`
	UserId    string  `json:"userId" binding:"required"`
}

func ManualRecharge(c *gin.Context) {
	var req ManualRechargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	now := time.Now().UTC()
	ownerPK := "WALLET#" + req.UserId
	walletSK := "TYPE#Main"

	// Credit the wallet balance directly
	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: ownerPK},
			"SK": &types.AttributeValueMemberS{Value: walletSK},
		},
		UpdateExpression: aws.String("ADD balance :amt, totalCredits :amt SET updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt": &types.AttributeValueMemberN{Value: strconv.FormatFloat(req.Amount, 'f', 2, 64)},
			":ts":  &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("Failed to credit wallet for manual recharge %s: %v", req.UserId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Wallet credit failed"})
		return
	}

	// Credit Users.walletBalance
	_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + req.UserId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) + :amt, updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: strconv.FormatFloat(req.Amount, 'f', 2, 64)},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	// Write transaction record
	txId := "TX#" + now.Format("20060102150405") + "#" + req.UtrNumber
	txRecord := map[string]interface{}{
		"PK":          ownerPK,
		"SK":          txId,
		"id":          txId,
		"date":        now.Format("01/02/2006, 03:04 PM"),
		"type":        "credit",
		"description": fmt.Sprintf("Manual Recharge (UTR: %s)", req.UtrNumber),
		"amount":      req.Amount,
		"reference":   req.UtrNumber,
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
		log.Printf("Failed to write manual tx record: %v", err)
	}

	// Create Notification for ADMIN
	notifId := "NOTIF" + now.Format("20060102150405")
	notif := map[string]interface{}{
		"PK":        "USER#ADMIN",
		"SK":        "NOTIF#" + now.Format(time.RFC3339) + "#" + notifId,
		"id":        notifId,
		"userId":    "ADMIN",
		"title":     "Manual Wallet Recharge",
		"message":   fmt.Sprintf("User %s requested a manual wallet recharge of %v (UTR: %s)", req.UserId, req.Amount, req.UtrNumber),
		"type":      "info",
		"isRead":    false,
		"createdAt": now.Format(time.RFC3339),
		"link":      "/admin/wallet",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Recharge successful",
		"amount":  req.Amount,
	})
}

type AdminCreditRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
	UserId string  `json:"userId" binding:"required"`
}

func AdminCreditWallet(c *gin.Context) {
	var req AdminCreditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	now := time.Now().UTC()
	ownerPK := "WALLET#" + req.UserId
	walletSK := "TYPE#Main"

	// Credit the wallet balance directly
	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: ownerPK},
			"SK": &types.AttributeValueMemberS{Value: walletSK},
		},
		UpdateExpression: aws.String("ADD balance :amt, totalCredits :amt SET updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt": &types.AttributeValueMemberN{Value: strconv.FormatFloat(req.Amount, 'f', 2, 64)},
			":ts":  &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("Failed to credit wallet for admin credit %s: %v", req.UserId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Wallet credit failed"})
		return
	}

	// Credit Users.walletBalance
	_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + req.UserId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) + :amt, updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: strconv.FormatFloat(req.Amount, 'f', 2, 64)},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	// Write transaction record
	txId := "TX#" + now.Format("20060102150405") + "#ADMIN"
	txRecord := map[string]interface{}{
		"PK":          ownerPK,
		"SK":          txId,
		"id":          txId,
		"date":        now.Format("01/02/2006, 03:04 PM"),
		"type":        "credit",
		"description": "Admin credit",
		"amount":      req.Amount,
		"reference":   "ADMIN",
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
		log.Printf("Failed to write admin credit tx record: %v", err)
	}

	// Create Notification for the User
	notifId := "NOTIF" + now.Format("20060102150405")
	notif := map[string]interface{}{
		"PK":        "USER#" + req.UserId,
		"SK":        "NOTIF#" + now.Format(time.RFC3339) + "#" + notifId,
		"id":        notifId,
		"userId":    req.UserId,
		"title":     "Wallet Credited",
		"message":   fmt.Sprintf("Your wallet has been credited with ₹%v by Admin.", req.Amount),
		"type":      "success",
		"isRead":    false,
		"createdAt": now.Format(time.RFC3339),
		"link":      "/wallet",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Recharge successful",
		"amount":  req.Amount,
	})
}
