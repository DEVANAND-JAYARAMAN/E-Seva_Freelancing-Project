package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"eservice-backend/db"
	"eservice-backend/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type CreateServiceReq struct {
	RetailerId  string  `json:"retailerId" binding:"required"`
	ServiceId   string  `json:"serviceId" binding:"required"`
	ServiceName      string  `json:"serviceName" binding:"required"`
	Cost             float64 `json:"cost" binding:"required"`
	CustomerWhatsApp string  `json:"customerWhatsApp"`
	WalletType       string  `json:"walletType"` // "Retailer" or "Distributor" (needed for history)
}

type UpdateServiceStatusReq struct {
	Status string `json:"status" binding:"required"`
}

// sendWhatsAppMessage automatically sends a text message via Mugavai API
func sendWhatsAppMessage(customerNumber string, serviceName string) {
	apiKey := os.Getenv("WHATSAPP_API_KEY")
	senderDevice := os.Getenv("WHATSAPP_SENDER_DEVICE")

	if apiKey == "" || senderDevice == "" {
		log.Println("Skipping WhatsApp API call: WHATSAPP_API_KEY or WHATSAPP_SENDER_DEVICE is missing in .env")
		return
	}

	url := "https://mugavaiwapp.in.net/send-message"

	message := fmt.Sprintf("Dear Customer,\nYour service request for '%s' has been successfully completed. Thank you for choosing E-Seva!", serviceName)

	payload := map[string]string{
		"api_key": apiKey,
		"sender":  senderDevice,
		"number":  customerNumber,
		"message": message,
	}

	jsonValue, _ := json.Marshal(payload)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		log.Printf("Error sending WhatsApp message: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		log.Printf("Successfully sent WhatsApp notification to %s\n", customerNumber)
	} else {
		log.Printf("Failed to send WhatsApp message. Status Code: %d\n", resp.StatusCode)
	}
}

func generateId(prefix string) string {
	return prefix + time.Now().Format("20060102150405")
}

func CreateServiceRequest(c *gin.Context) {
	var req CreateServiceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	walletPK := "WALLET#" + req.RetailerId
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: walletPK},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to access wallet"})
		return
	}

	balance := float64(0)
	if out.Item != nil {
		var wallet models.Wallet
		attributevalue.UnmarshalMap(out.Item, &wallet)
		balance = wallet.Balance
	} else {
		// Just for testing/mocking we could allow it, but let's strictly require a wallet
		// Create a wallet on the fly if not exists with 0 balance
		balance = 0
	}

	if balance < req.Cost {
		// Log failed transaction
		now := time.Now().UTC().Format(time.RFC3339)
		txId := generateId("TX")
		failedTx := models.WalletTransaction{
			PK:         walletPK,
			SK:         "TX#" + now + "#" + txId,
			Id:         txId,
			WalletType: req.WalletType,
			Amount:     req.Cost,
			Type:       "Debit",
			Status:     "Failure",
			Reference:  req.ServiceId,
			CreatedAt:  now,
		}
		failedTxItem, _ := attributevalue.MarshalMap(failedTx)
		db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("WalletTransactions"),
			Item:      failedTxItem,
		})

		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient wallet balance"})
		return
	}

	appId := generateId("SRVREQ")
	now := time.Now().UTC().Format(time.RFC3339)

	app := models.ServiceApplication{
		PK:               "SERVICEAPP#" + appId,
		SK:               "PROFILE",
		Id:               appId,
		RetailerId:       req.RetailerId,
		ServiceId:        req.ServiceId,
		ServiceName:      req.ServiceName,
		Cost:             req.Cost,
		CustomerWhatsApp: req.CustomerWhatsApp,
		Status:           "Pending",
		CreatedDate:      now,
		LastUpdated:      now,
	}

	notifId := generateId("NOTIF")
	notif := models.Notification{
		PK:        "USER#ADMIN",
		SK:        "NOTIF#" + now + "#" + notifId,
		Id:        notifId,
		UserId:    "ADMIN",
		Title:     "New Service Request",
		Message:   fmt.Sprintf("Retailer %s requested %s for Cost %v", req.RetailerId, req.ServiceName, req.Cost),
		Type:      "info",
		IsRead:    false,
		CreatedAt: now,
	}

	appItem, err := attributevalue.MarshalMap(app)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal request"})
		return
	}

	notifItem, err := attributevalue.MarshalMap(notif)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal notification"})
		return
	}

	_, err = db.DynamoClient.TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			{
				Put: &types.Put{
					TableName: aws.String("ServiceApplications"),
					Item:      appItem,
				},
			},
			{
				Put: &types.Put{
					TableName: aws.String("Notifications"),
					Item:      notifItem,
				},
			},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Service request created successfully",
		"id":      appId,
	})
}

func UpdateServiceRequestStatus(c *gin.Context) {
	appId := c.Param("id")
	var req UpdateServiceStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != "Approved" && req.Status != "Rejected" && req.Status != "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("ServiceApplications"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if err != nil || out.Item == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service request not found"})
		return
	}

	var app models.ServiceApplication
	attributevalue.UnmarshalMap(out.Item, &app)

	if app.Status == "Completed" || app.Status == "Rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is already in a final state"})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)

	if req.Status == "Approved" {
		walletPK := "WALLET#" + app.RetailerId
		outWallet, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("Wallets"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: walletPK},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
		})
		if err != nil || outWallet.Item == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Wallet not found"})
			return
		}

		var wallet models.Wallet
		attributevalue.UnmarshalMap(outWallet.Item, &wallet)

		if wallet.Balance < app.Cost {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient wallet balance to approve"})
			return
		}

		newBalance := wallet.Balance - app.Cost

		_, err = db.DynamoClient.TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
			TransactItems: []types.TransactWriteItem{
				{
					Update: &types.Update{
						TableName: aws.String("Wallets"),
						Key: map[string]types.AttributeValue{
							"PK": &types.AttributeValueMemberS{Value: walletPK},
							"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
						},
						UpdateExpression: aws.String("SET balance = :newBal, updatedAt = :time"),
						ConditionExpression: aws.String("balance >= :cost"),
						ExpressionAttributeValues: map[string]types.AttributeValue{
							":newBal": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", newBalance)},
							":time":   &types.AttributeValueMemberS{Value: now},
							":cost":   &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", app.Cost)},
						},
					},
				},
				{
					Update: &types.Update{
						TableName: aws.String("ServiceApplications"),
						Key: map[string]types.AttributeValue{
							"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
							"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
						},
						UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time"),
						ExpressionAttributeNames: map[string]string{
							"#s": "status",
						},
						ExpressionAttributeValues: map[string]types.AttributeValue{
							":status": &types.AttributeValueMemberS{Value: "Approved"},
							":time":   &types.AttributeValueMemberS{Value: now},
						},
					},
				},
			},
		})

		if err != nil {
			log.Printf("Transaction failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process approval"})
			return
		}

		// Also record the successful Wallet Transaction
		txId := generateId("TX")
		successTx := models.WalletTransaction{
			PK:         walletPK,
			SK:         "TX#" + now + "#" + txId,
			Id:         txId,
			WalletType: "General", // Ideally pass from frontend but we can default if not stored
			Amount:     app.Cost,
			Type:       "Debit",
			Status:     "Success",
			Reference:  app.ServiceId,
			CreatedAt:  now,
		}
		successTxItem, _ := attributevalue.MarshalMap(successTx)
		db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("WalletTransactions"),
			Item:      successTxItem,
		})

	} else if req.Status == "Completed" {
		_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":status": &types.AttributeValueMemberS{Value: "Completed"},
				":time":   &types.AttributeValueMemberS{Value: now},
			},
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete request"})
			return
		}

		// Send Automated WhatsApp Message via Mugavai API
		if app.CustomerWhatsApp != "" {
			go sendWhatsAppMessage(app.CustomerWhatsApp, app.ServiceName)
		}

		// Send Notification to Retailer/Distributor
		notifId := generateId("NOTIF")
		notif := models.Notification{
			PK:        "USER#" + app.RetailerId,
			SK:        "NOTIF#" + now + "#" + notifId,
			Id:        notifId,
			UserId:    app.RetailerId,
			Title:     "Service Request Completed",
			Message:   fmt.Sprintf("Your request for %s has been completed by Admin.", app.ServiceName),
			Type:      "success",
			IsRead:    false,
			CreatedAt: now,
		}
		notifItem, _ := attributevalue.MarshalMap(notif)
		db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("Notifications"),
			Item:      notifItem,
		})
	} else {
		_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":status": &types.AttributeValueMemberS{Value: "Rejected"},
				":time":   &types.AttributeValueMemberS{Value: now},
			},
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process rejection"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request " + req.Status + " successfully"})
}

func GetServiceRequests(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	var requests []models.ServiceApplication
	attributevalue.UnmarshalListOfMaps(out.Items, &requests)

	c.JSON(http.StatusOK, requests)
}

func GetWalletTransactions(c *gin.Context) {
	userId := c.Query("userId")
	if userId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName: aws.String("WalletTransactions"),
		KeyConditionExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	var transactions []models.WalletTransaction
	attributevalue.UnmarshalListOfMaps(out.Items, &transactions)

	c.JSON(http.StatusOK, transactions)
}

type RechargeGatewayReq struct {
	Amount         float64 `json:"amount"`
	CustomerMobile string  `json:"customer_mobile"`
	CustomerEmail  string  `json:"customer_email"`
	RedirectURL    string  `json:"redirect_url"`
	VPA            string  `json:"vpa"`
	UpiId          string  `json:"upi_id"`
}

type MugavaiCreateOrderReq struct {
	Amount         float64 `json:"amount"`
	CustomerMobile string  `json:"customer_mobile"`
	CustomerEmail  string  `json:"customer_email"`
	OrderID        string  `json:"order_id"`
	RedirectURL    string  `json:"redirect_url"`
}

type MugavaiCreateOrderRes struct {
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

// RechargeGateway creates a payment gateway session using Mugavai API
func RechargeGateway(c *gin.Context) {
	var req RechargeGatewayReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate an order ID
	orderId := generateId("ORD")

	// Prepare request body for Mugavai API
	mugavaiReqBody := MugavaiCreateOrderReq{
		Amount:         req.Amount,
		CustomerMobile: req.CustomerMobile,
		CustomerEmail:  req.CustomerEmail,
		OrderID:        orderId,
		RedirectURL:    req.RedirectURL,
	}

	jsonValue, err := json.Marshal(mugavaiReqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal request"})
		return
	}

	// Read credentials from env or fallback to provided ones
	username := os.Getenv("MUGAVAI_USERNAME")
	if username == "" {
		username = "6380616163"
	}
	apiKey := os.Getenv("MUGAVAI_API_KEY")
	if apiKey == "" {
		apiKey = "debd2880dc42f49b79248d72d90ca7d0262d4c125ed91a4d"
	}

	apiURL := "https://mugavaipaymentgetway.in/api/v1/create_order.php"
	
	httpReq, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonValue))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-client-username", username)
	httpReq.Header.Set("x-client-apikey", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment gateway timeout or unreachable"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Payment gateway error (%d): %s", resp.StatusCode, string(bodyBytes))})
		return
	}

	var mugavaiRes MugavaiCreateOrderRes
	if err := json.NewDecoder(resp.Body).Decode(&mugavaiRes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode payment gateway response"})
		return
	}

	if mugavaiRes.Status != "success" {
		c.JSON(http.StatusBadRequest, gin.H{"error": mugavaiRes.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment gateway initialized successfully",
		"data": map[string]interface{}{
			"payment_url": mugavaiRes.Data.PaymentURL,
			"order_id":    mugavaiRes.Data.OrderID,
		},
	})
}

type RechargeWebhookReq struct {
	OrderID string  `form:"order_id" json:"order_id"`
	Status  string  `form:"status" json:"status"`
	Amount  float64 `form:"amount" json:"amount"`
	UTR     string  `form:"utr" json:"utr"`
}

// RechargeWebhook handles the callback from Mugavai payment gateway
func RechargeWebhook(c *gin.Context) {
	var req RechargeWebhookReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For a real app, you'd look up the user/wallet associated with the order_id,
	// verify the amount, and then update their balance in the "Wallets" DynamoDB table.
	log.Printf("Received payment webhook: Order=%s Status=%s Amount=%.2f UTR=%s\n", req.OrderID, req.Status, req.Amount, req.UTR)

	if req.Status == "SUCCESS" {
		// Example: Mark wallet transaction as successful
		log.Println("Payment was successful. You should update the wallet balance here.")
	}

	// Just return success so the gateway knows we received it
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Webhook processed"})
}
