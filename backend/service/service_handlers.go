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
	"strings"
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
	RetailerId       string  `form:"retailerId" binding:"required"`
	RetailerName     string  `form:"retailerName"`
	RetailerMobile   string  `form:"retailerMobile"`
	ServiceId        string  `form:"serviceId" binding:"required"`
	ServiceName      string  `form:"serviceName" binding:"required"`
	Cost             float64 `form:"cost"`
	CustomerWhatsApp string  `form:"customerWhatsApp"`
	WalletType       string  `form:"walletType"` // "Retailer" or "Distributor" (needed for history)
	FormData         string  `form:"formData"`
}

type UpdateServiceStatusReq struct {
	Status       string `json:"status" binding:"required"`
	AdminRemarks string `json:"adminRemarks"`
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

	message := fmt.Sprintf("Your service '%s' is successfully completed.", serviceName)

		number := customerNumber
	if len(number) == 10 {
		number = "91" + number
	}
	payload := map[string]string{
		"api_key": apiKey,
		"sender":  senderDevice,
		"number":  number,
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
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	walletPK := "WALLET#" + req.RetailerId
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: walletPK},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
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

	var formData map[string]string
	formDataStr := req.FormData
	if formDataStr == "" {
		formDataStr = c.PostForm("formData")
	}

	if formDataStr != "" {
		_ = json.Unmarshal([]byte(formDataStr), &formData)
	}

	var documents []string
	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["documents"]
		for _, file := range files {
			filename := fmt.Sprintf("%s_%s", appId, file.Filename)
			filepath := "uploads/" + filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				documents = append(documents, "/uploads/"+filename)
			}
		}
	}

	app := models.ServiceApplication{
		PK:               "SERVICEAPP#" + appId,
		SK:               "PROFILE",
		Id:               appId,
		RetailerId:       req.RetailerId,
		RetailerName:     req.RetailerName,
		RetailerMobile:   req.RetailerMobile,
		ServiceId:        req.ServiceId,
		ServiceName:      req.ServiceName,
		Cost:             req.Cost,
		CustomerWhatsApp: req.CustomerWhatsApp,
		FormData:         formData,
		Documents:        documents,
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
		Link:      "/status",
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

	txId := generateId("TX")
	successTx := models.WalletTransaction{
		PK:         walletPK,
		SK:         "TX#" + now + "#" + txId,
		Id:         txId,
		WalletType: req.WalletType,
		Amount:     req.Cost,
		Type:       "Debit",
		Status:     "Success",
		Reference:  req.ServiceId,
		CreatedAt:  now,
	}
	successTxItem, _ := attributevalue.MarshalMap(successTx)

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
			{
				Put: &types.Put{
					TableName: aws.String("WalletTransactions"),
					Item:      successTxItem,
				},
			},
			{
				Update: &types.Update{
					TableName: aws.String("Wallets"),
					Key: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: walletPK},
						"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
					},
					UpdateExpression: aws.String("SET balance = balance - :cost"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.Cost)},
					},
				},
			},
			{
				Update: &types.Update{
					TableName: aws.String("Users"),
					Key: map[string]types.AttributeValue{
						"PK": &types.AttributeValueMemberS{Value: "USER#" + req.RetailerId},
						"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
					},
					UpdateExpression: aws.String("SET walletBalance = walletBalance - :cost"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.Cost)},
					},
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
	// Handle Form Data instead of JSON to support file uploads
	status := c.PostForm("status")
	adminRemarks := c.PostForm("adminRemarks")

	if status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status is required"})
		return
	}

	var ackFiles []string
	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["ackFiles"]
		for _, file := range files {
			filename := fmt.Sprintf("ack_%s_%s", appId, file.Filename)
			filepath := "uploads/" + filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				ackFiles = append(ackFiles, "/uploads/"+filename)
			}
		}
	}


	validStatuses := map[string]bool{
		"Approved": true, "Rejected": true,
	}
	if !validStatuses[status] {
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

	if app.Status == "Approved" || app.Status == "Completed" || app.Status == "Rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is already in a final state"})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)

	if status == "Approved" {
		crmId := generateId("CRM")
		invoiceId := generateId("INV")
			
			crmCust := models.CRMCustomer{
				PK:         "CUSTOMER#" + crmId,
				SK:         "PROFILE",
				Id:         crmId,
				Name:       app.CustomerWhatsApp, // Mocked to WhatsApp or retrieve from FormData
				ShopName:   "Unknown",
				Email:      "unknown@example.com",
				Phone:      app.CustomerWhatsApp,
				City:       "Unknown",
				Type:       "RetailerCustomer",
				Status:     "Active",
				JoinedDate: now,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			crmItem, _ := attributevalue.MarshalMap(crmCust)

			invoice := models.Invoice{
				PK:            "INVOICE#" + invoiceId,
				SK:            "PROFILE",
				Id:            invoiceId,
				InvoiceNumber: "INV-" + invoiceId,
				RetailerName:  app.RetailerId,
				Amount:        app.Cost,
				Date:          now,
				DueDate:       now,
				Status:        "Paid",
				UtrNumber:     app.ServiceId,
				Category:      app.ServiceName,
				CreatedAt:     now,
				UpdatedAt:     now,
			}
			invoiceItem, _ := attributevalue.MarshalMap(invoice)

			_, err = db.DynamoClient.TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
				TransactItems: []types.TransactWriteItem{
					{
						Update: &types.Update{
							TableName: aws.String("ServiceApplications"),
							Key: map[string]types.AttributeValue{
								"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
								"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
							},
							UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time, adminRemarks = :remarks"),
							ExpressionAttributeNames: map[string]string{
								"#s": "status",
							},
							ExpressionAttributeValues: map[string]types.AttributeValue{
								":status":  &types.AttributeValueMemberS{Value: status},
								":time":    &types.AttributeValueMemberS{Value: now},
								":remarks": &types.AttributeValueMemberS{Value: adminRemarks},
							},
						},
					},
					{
						Put: &types.Put{
							TableName: aws.String("CRMCustomers"),
							Item:      crmItem,
						},
					},
					{
						Put: &types.Put{
							TableName: aws.String("Invoices"),
							Item:      invoiceItem,
						},
					},
				},
			})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
			return
		}

		// WhatsApp message is handled at the end of the function

	} else if status == "Rejected" {
		walletPK := "WALLET#" + app.RetailerId
		txId := generateId("TX")
		refundTx := models.WalletTransaction{
			PK:         walletPK,
			SK:         "TX#" + now + "#" + txId,
			Id:         txId,
			WalletType: "Main",
			Amount:     app.Cost,
			Type:       "Credit",
			Status:     "Success",
			Reference:  app.ServiceId + "-REFUND",
			CreatedAt:  now,
		}
		refundTxItem, _ := attributevalue.MarshalMap(refundTx)

		_, err = db.DynamoClient.TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
			TransactItems: []types.TransactWriteItem{
				{
					Update: &types.Update{
						TableName: aws.String("ServiceApplications"),
						Key: map[string]types.AttributeValue{
							"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
							"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
						},
						UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time, adminRemarks = :remarks"),
						ExpressionAttributeNames: map[string]string{
							"#s": "status",
						},
						ExpressionAttributeValues: map[string]types.AttributeValue{
							":status":  &types.AttributeValueMemberS{Value: "Rejected"},
							":time":    &types.AttributeValueMemberS{Value: now},
							":remarks": &types.AttributeValueMemberS{Value: adminRemarks},
						},
					},
				},
				{
					Put: &types.Put{
						TableName: aws.String("WalletTransactions"),
						Item:      refundTxItem,
					},
				},
				{
					Update: &types.Update{
						TableName: aws.String("Wallets"),
						Key: map[string]types.AttributeValue{
							"PK": &types.AttributeValueMemberS{Value: walletPK},
							"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
						},
						UpdateExpression: aws.String("SET balance = balance + :cost"),
						ExpressionAttributeValues: map[string]types.AttributeValue{
							":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", app.Cost)},
						},
					},
				},
				{
					Update: &types.Update{
						TableName: aws.String("Users"),
						Key: map[string]types.AttributeValue{
							"PK": &types.AttributeValueMemberS{Value: "USER#" + app.RetailerId},
							"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
						},
						UpdateExpression: aws.String("SET walletBalance = walletBalance + :cost"),
						ExpressionAttributeValues: map[string]types.AttributeValue{
							":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", app.Cost)},
						},
					},
				},
			},
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process rejection and refund"})
			return
		}
	} else {
		// Processing, Resubmit — simple status update
		_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET #s = :status, lastUpdated = :time, adminRemarks = :remarks"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":status":  &types.AttributeValueMemberS{Value: status},
				":time":    &types.AttributeValueMemberS{Value: now},
				":remarks": &types.AttributeValueMemberS{Value: adminRemarks},
			},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
			return
		}
	}

	// Update ackFiles if any were uploaded
	if len(ackFiles) > 0 {
		ackFilesAttr, _ := attributevalue.MarshalList(ackFiles)
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET ackFiles = :ackFiles"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":ackFiles": &types.AttributeValueMemberL{Value: ackFilesAttr},
			},
		})
	}

	// Send Notification to Retailer/Distributor
	notifId := generateId("NOTIF")
	title := "Service Request " + status
	notifType := "info"
	if status == "Completed" || status == "Approved" {
		notifType = "success"
	} else if status == "Rejected" {
		notifType = "error"
	}

	notif := models.Notification{
		PK:        "USER#" + app.RetailerId,
		SK:        "NOTIF#" + now + "#" + notifId,
		Id:        notifId,
		UserId:    app.RetailerId,
		Title:     title,
		Message:   fmt.Sprintf("Your request for %s has been %s by Admin.", app.ServiceName, status),
		Type:      notifType,
		IsRead:    false,
		CreatedAt: now,
		Link:      "/status",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	// Try to find the customer name and WhatsApp number from the application
	var customerName string
	if app.FormData != nil {
		for key, val := range app.FormData {
			lowerKey := strings.ToLower(key)
			if strings.Contains(lowerKey, "name") && !strings.Contains(lowerKey, "father") && !strings.Contains(lowerKey, "mother") {
				customerName = val
				break
			}
		}
	}
	if customerName == "" {
		customerName = "Customer"
	}

	if (status == "Approved" || status == "Completed") && app.CustomerWhatsApp != "" {
		ackLinks := ""
		if len(ackFiles) > 0 {
			baseURL := os.Getenv("NEXT_PUBLIC_API_URL")
			if baseURL == "" {
				baseURL = "http://localhost:8080" // fallback
			}
			baseURL = strings.TrimSuffix(baseURL, "/api")
			
			ackLinks = "\n\nAcknowledgement Document(s):\n"
			for i, file := range ackFiles {
				ackLinks += fmt.Sprintf("%d. %s/api%s\n", i+1, baseURL, file)
			}
		}

		message := fmt.Sprintf("Your service '%s' is successfully %s.%s", app.ServiceName, strings.ToLower(status), ackLinks)
		
		apiKey := os.Getenv("WHATSAPP_API_KEY")
		senderDevice := os.Getenv("WHATSAPP_SENDER_DEVICE")

		if apiKey != "" && senderDevice != "" {
			url := "https://mugavaiwapp.in.net/send-message"
						number := strings.ReplaceAll(app.CustomerWhatsApp, "+", "")
			if len(number) == 10 {
				number = "91" + number
			}
			payload := map[string]string{
				"api_key": apiKey,
				"sender":  senderDevice,
				"number":  number,
				"message": message,
			}
			jsonValue, _ := json.Marshal(payload)
			go func() {
				resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
				if err != nil {
					log.Printf("WhatsApp API Error: %v", err)
					return
				}
				defer resp.Body.Close()
				bodyBytes, _ := io.ReadAll(resp.Body)
				log.Printf("WhatsApp API Response for %s: %s", number, string(bodyBytes))
			}()
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request " + status + " successfully"})
}

func GetServiceRequests(c *gin.Context) {
	userId := c.Query("userId")

	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	var requests []models.ServiceApplication
	attributevalue.UnmarshalListOfMaps(out.Items, &requests)

	// Fetch users to map missing names and mobiles
	userOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
	})
	if err == nil {
		var users []models.User
		attributevalue.UnmarshalListOfMaps(userOut.Items, &users)
		userMap := make(map[string]models.User)
		for _, u := range users {
			userMap[u.UserId] = u
		}

		for i, req := range requests {
			if req.RetailerName == "" {
				if u, ok := userMap[req.RetailerId]; ok {
					requests[i].RetailerName = u.FullName
					requests[i].RetailerMobile = u.Mobile
				} else {
					requests[i].RetailerName = req.RetailerId // fallback
				}
			}
		}
	}

	var filteredRequests []models.ServiceApplication
	if userId != "" {
		for _, req := range requests {
			if req.RetailerId == userId {
				filteredRequests = append(filteredRequests, req)
			}
		}
	} else {
		filteredRequests = requests
	}

	c.JSON(http.StatusOK, filteredRequests)
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
	UserID         string  `json:"user_id"`
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
	// Hardcoding API key because GitHub Secrets is overriding it with an old value
	apiKey := "de84d65d816961eef8662345e4147587c38f2963ca480dbd"

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

	// Store orderId → userId mapping in DynamoDB so webhook can credit the right wallet
	if req.UserID != "" {
		now := time.Now().UTC().Format(time.RFC3339)
		_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("WalletTransactions"),
			Item: map[string]types.AttributeValue{
				"PK":        &types.AttributeValueMemberS{Value: "ORDER#" + orderId},
				"SK":        &types.AttributeValueMemberS{Value: "META"},
				"userId":    &types.AttributeValueMemberS{Value: req.UserID},
				"amount":    &types.AttributeValueMemberN{Value: fmt.Sprintf("%.2f", req.Amount)},
				"status":    &types.AttributeValueMemberS{Value: "Pending"},
				"createdAt": &types.AttributeValueMemberS{Value: now},
			},
		})
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
	OrderID      string      `form:"order_id" json:"order_id"`
	ClientTxnID  string      `form:"client_txn_id" json:"client_txn_id"`
	TxnID        string      `form:"txn_id" json:"txn_id"`
	Status       string      `form:"status" json:"status"`
	Amount       interface{} `form:"amount" json:"amount"`
	UTR          string      `form:"utr" json:"utr"`
	UpiTxnID     string      `form:"upi_txn_id" json:"upi_txn_id"`
}

// RechargeWebhook handles the callback from Mugavai payment gateway
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

	if status != "SUCCESS" && status != "success" && status != "COMPLETED" && status != "Completed" {
		c.JSON(http.StatusOK, gin.H{"status": "received", "message": "Not a success status"})
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
	amountStr = fmt.Sprintf("%.2f", parsedAmount)

	// Credit Wallets table
	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
		UpdateExpression: aws.String("ADD balance :amt SET updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt": &types.AttributeValueMemberN{Value: amountStr},
			":ts":  &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("[Webhook] Failed to credit Wallets for user %s: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "wallet credit failed"})
		return
	}

	// Credit Users.walletBalance
	_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) + :amt, updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: amountStr},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	// Write transaction record
	txId := "TX#" + now.Format("20060102150405") + "#" + actualOrderID
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item: map[string]types.AttributeValue{
			"PK":          &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK":          &types.AttributeValueMemberS{Value: txId},
			"id":          &types.AttributeValueMemberS{Value: actualOrderID},
			"type":        &types.AttributeValueMemberS{Value: "credit"},
			"amount":      &types.AttributeValueMemberN{Value: amountStr},
			"reference":   &types.AttributeValueMemberS{Value: actualUTR},
			"description": &types.AttributeValueMemberS{Value: fmt.Sprintf("Wallet Recharge via Gateway (UTR: %s)", actualUTR)},
			"status":      &types.AttributeValueMemberS{Value: "Success"},
			"walletType":  &types.AttributeValueMemberS{Value: "Main"},
			"createdAt":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	log.Printf("[Webhook] Successfully credited ₹%.2f to user %s", parsedAmount, userId)
	// Add Notification for Admin
	notifId := generateId("NOTIF")
	notif := models.Notification{
		PK:        "USER#ADMIN",
		SK:        "NOTIF#" + now.Format(time.RFC3339) + "#" + notifId,
		Id:        notifId,
		UserId:    "ADMIN",
		Title:     "Wallet Recharged",
		Message:   fmt.Sprintf("User %s recharged wallet with %.2f (UTR: %s)", userId, parsedAmount, actualUTR),
		Type:      "success",
		IsRead:    false,
		CreatedAt: now.Format(time.RFC3339),
		Link:      "/status", 
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Wallet credited"})
}


func UpdateDynamicService(c *gin.Context) {
	id := c.Param("id")
	var req models.DynamicService
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = id
	req.CreatedDate = time.Now().UTC().Format(time.RFC3339)

	item, err := attributevalue.MarshalMap(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal item"})
		return
	}

	item["PK"] = &types.AttributeValueMemberS{Value: "DYNAMIC_SERVICE#" + req.ID}
	item["SK"] = &types.AttributeValueMemberS{Value: "META"}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("DynamicServices"),
		Item:      item,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update dynamic service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service updated successfully"})
}

func DeleteDynamicService(c *gin.Context) {
	id := c.Param("id")

	_, err := db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("DynamicServices"),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		// Fallback to PK and SK in case the table schema uses them instead of 'id'
		_, err = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
			TableName: aws.String("DynamicServices"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "DYNAMIC_SERVICE#" + id},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
		})
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dynamic service"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}

// RechargeReturn handles the redirect from Mugavai payment gateway
func RechargeReturn(c *gin.Context) {
	// Redirect back to the wallet page
	redirectUrl := c.Query("redirect_url")
	if redirectUrl == "" {
		redirectUrl = "https://thuruvancommunications.com/dashboard/wallet?payment_status=success"
	}
	c.Redirect(http.StatusFound, redirectUrl)
}
