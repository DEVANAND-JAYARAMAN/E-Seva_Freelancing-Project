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
	"strconv"
	"strings"
	"time"

	"eservice-backend/admin"
	"eservice-backend/auth"
	"eservice-backend/db"
	"eservice-backend/models"
	"eservice-backend/timeutil"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type CreateServiceReq struct {
	RetailerId        string   `form:"retailerId" json:"retailerId"`
	RetailerName      string   `form:"retailerName" json:"retailerName"`
	RetailerMobile    string   `form:"retailerMobile" json:"retailerMobile"`
	ServiceId         string   `form:"serviceId" json:"serviceId" binding:"required"`
	ServiceName       string   `form:"serviceName" json:"serviceName" binding:"required"`
	PricingCategoryId string   `form:"pricingCategoryId" json:"pricingCategoryId"`
	Cost              float64  `form:"cost" json:"cost"`
	CustomerWhatsApp  string   `form:"customerWhatsApp" json:"customerWhatsApp"`
	WalletType        string   `form:"walletType" json:"walletType"`
	FormData          string   `form:"formData" json:"formData"`
	Documents         []string `json:"documents"`
}

// UploadFile saves a single multipart file and returns its public API path.
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create uploads directory"})
		return
	}

	safeName := strings.ReplaceAll(file.Filename, "..", "")
	safeName = strings.ReplaceAll(safeName, "/", "_")
	safeName = strings.ReplaceAll(safeName, "\\", "_")
	filename := fmt.Sprintf("%s_%s", generateId("UP"), safeName)
	filepath := "uploads/" + filename
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	path := "/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{
		"path": path,
		"url":  "/api" + path,
		"name": file.Filename,
	})
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
	ct := c.ContentType()
	var bindErr error
	if strings.Contains(ct, "application/json") {
		bindErr = c.ShouldBindJSON(&req)
	} else {
		bindErr = c.ShouldBind(&req)
	}
	if bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": bindErr.Error()})
		return
	}

	// Bind identity from JWT — never trust client retailerId for non-admins
	authUser := auth.UserID(c)
	if authUser == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
		return
	}
	if !auth.IsAdmin(c) || strings.TrimSpace(req.RetailerId) == "" {
		req.RetailerId = authUser
	}

	// Fill retailer name/mobile from profile when client didn't send them
	if strings.TrimSpace(req.RetailerName) == "" || strings.TrimSpace(req.RetailerMobile) == "" {
		uOut, uErr := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("Users"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "USER#" + req.RetailerId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
		})
		if uErr == nil && uOut.Item != nil {
			var profile models.User
			_ = attributevalue.UnmarshalMap(uOut.Item, &profile)
			if strings.TrimSpace(req.RetailerName) == "" {
				req.RetailerName = profile.FullName
			}
			if strings.TrimSpace(req.RetailerMobile) == "" {
				req.RetailerMobile = profile.Mobile
			}
		}
	}

	// Prefer Service Payment matrix price (by role) over client-submitted cost when found
	if resolved, ok := ResolveServiceChargeFromPricing(req.RetailerId, req.PricingCategoryId, req.ServiceId, req.ServiceName); ok && resolved > 0 {
		req.Cost = resolved
	} else if resolved, ok := ResolveServiceChargeFromPdfPricing(req.RetailerId, req.ServiceId, req.ServiceName); ok && resolved > 0 {
		req.Cost = resolved
	}

	if req.Cost <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Service charge not configured"})
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
	}
	// Sync from Users.walletBalance when Wallets row missing/zero so debit matches UI
	if balance <= 0 {
		uOut, uErr := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("Users"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "USER#" + req.RetailerId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
		})
		if uErr == nil && uOut.Item != nil {
			if v, ok := uOut.Item["walletBalance"].(*types.AttributeValueMemberN); ok {
				if parsed, perr := strconv.ParseFloat(v.Value, 64); perr == nil && parsed > 0 {
					balance = parsed
					nowSync := time.Now().UTC().Format(time.RFC3339)
					_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
						TableName: aws.String("Wallets"),
						Item: map[string]types.AttributeValue{
							"PK":        &types.AttributeValueMemberS{Value: walletPK},
							"SK":        &types.AttributeValueMemberS{Value: "TYPE#Main"},
							"userId":    &types.AttributeValueMemberS{Value: req.RetailerId},
							"balance":   &types.AttributeValueMemberN{Value: fmt.Sprintf("%.2f", balance)},
							"updatedAt": &types.AttributeValueMemberS{Value: nowSync},
						},
					})
				}
			}
		}
	}

	if balance < req.Cost {
		// Log failed transaction
		now := time.Now().UTC().Format(time.RFC3339)
		txId := generateId("TX")
		failedTx := models.WalletTransaction{
			PK:          walletPK,
			SK:          "TX#" + now + "#" + txId,
			Id:          txId,
			WalletType:  req.WalletType,
			Amount:      req.Cost,
			Type:        "Debit",
			Status:      "Failure",
			Reference:   req.ServiceId,
			CreatedAt:   now,
			Date:        timeutil.FormatRFC3339AsIST(now),
			Description: "Service payment (failed)",
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
		if err := json.Unmarshal([]byte(formDataStr), &formData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid formData"})
			return
		}
	}
	if formData == nil {
		formData = map[string]string{}
	}

	var documents []string
	seenDocs := map[string]bool{}
	addDoc := func(path string) {
		path = strings.TrimSpace(path)
		if path == "" || seenDocs[path] {
			return
		}
		seenDocs[path] = true
		documents = append(documents, path)
	}
	for _, p := range req.Documents {
		addDoc(p)
	}
	// Multipart clients may send documents as a JSON string field
	if docsJSON := strings.TrimSpace(c.PostForm("documents")); docsJSON != "" {
		var fromForm []string
		if json.Unmarshal([]byte(docsJSON), &fromForm) == nil {
			for _, p := range fromForm {
				addDoc(p)
			}
		}
	}
	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["documents"]
		for _, file := range files {
			filename := fmt.Sprintf("%s_%s", appId, file.Filename)
			filepath := "uploads/" + filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				addDoc("/uploads/" + filename)
			}
		}
	}
	// Also pick up any /uploads paths already written into form fields (photo, signature, etc.)
	for _, v := range formData {
		if strings.HasPrefix(v, "/uploads/") {
			addDoc(v)
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
		PK:          walletPK,
		SK:          "TX#" + now + "#" + txId,
		Id:          txId,
		WalletType:  req.WalletType,
		Amount:      req.Cost,
		Type:        "Debit",
		Status:      "Success",
		Reference:   req.ServiceId,
		CreatedAt:   now,
		Date:        timeutil.FormatRFC3339AsIST(now),
		Description: "Service payment",
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
					UpdateExpression:    aws.String("SET balance = if_not_exists(balance, :zero) - :cost, updatedAt = :ts"),
					ConditionExpression: aws.String("attribute_exists(balance) AND balance >= :cost"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.Cost)},
						":zero": &types.AttributeValueMemberN{Value: "0"},
						":ts":   &types.AttributeValueMemberS{Value: now},
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
					UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) - :cost, updatedAt = :ts"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":cost": &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", req.Cost)},
						":zero": &types.AttributeValueMemberN{Value: "0"},
						":ts":   &types.AttributeValueMemberS{Value: now},
					},
				},
			},
		},
	})

	if err != nil {
		log.Printf("CreateServiceRequest transact failed for %s: %v", req.RetailerId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save request", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Service request created successfully",
		"id":      appId,
	})
}

type ResubmitServiceReq struct {
	FormData  map[string]string `json:"formData"`
	Documents []string          `json:"documents"`
}

// ResubmitServiceRequest lets a retailer/distributor correct a Resubmit application
// and move it back to Pending (no extra wallet debit).
func ResubmitServiceRequest(c *gin.Context) {
	appId := strings.TrimSpace(c.Param("id"))
	appId = strings.TrimSuffix(appId, "/")
	if appId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Application id required"})
		return
	}

	userId := auth.UserID(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
		return
	}

	var req ResubmitServiceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body: " + err.Error()})
		return
	}
	if req.FormData == nil {
		req.FormData = map[string]string{}
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
	_ = attributevalue.UnmarshalMap(out.Item, &app)

	if app.Status != "Resubmit" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only Resubmit requests can be reapplied"})
		return
	}
	if !auth.IsAdmin(c) && strings.TrimSpace(app.RetailerId) != userId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed to resubmit this request"})
		return
	}

	docs := req.Documents
	if docs == nil {
		docs = []string{}
	}
	seen := map[string]bool{}
	var mergedDocs []string
	add := func(p string) {
		p = strings.TrimSpace(p)
		if p == "" || seen[p] {
			return
		}
		seen[p] = true
		mergedDocs = append(mergedDocs, p)
	}
	for _, p := range docs {
		add(p)
	}
	for _, v := range req.FormData {
		if strings.HasPrefix(v, "/uploads/") {
			add(v)
		}
	}

	now := time.Now().UTC().Format(time.RFC3339)
	formAV, err := attributevalue.Marshal(req.FormData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid formData"})
		return
	}
	docsAV, err := attributevalue.Marshal(mergedDocs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid documents"})
		return
	}

	prevRemarks := strings.TrimSpace(app.AdminRemarks)
	newRemarks := prevRemarks
	if prevRemarks != "" && !strings.Contains(strings.ToLower(prevRemarks), "resubmitted by partner") {
		newRemarks = prevRemarks + " | Resubmitted by partner"
	} else if prevRemarks == "" {
		newRemarks = "Resubmitted by partner"
	}

	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("ServiceApplications"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression:    aws.String("SET #s = :pending, formData = :fd, documents = :docs, lastUpdated = :ts, adminRemarks = :remarks"),
		ConditionExpression: aws.String("#s = :resubmit"),
		ExpressionAttributeNames: map[string]string{
			"#s": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pending":  &types.AttributeValueMemberS{Value: "Pending"},
			":resubmit": &types.AttributeValueMemberS{Value: "Resubmit"},
			":fd":       formAV,
			":docs":     docsAV,
			":ts":       &types.AttributeValueMemberS{Value: now},
			":remarks":  &types.AttributeValueMemberS{Value: newRemarks},
		},
	})
	if err != nil {
		log.Printf("ResubmitServiceRequest failed for %s: %v", appId, err)
		c.JSON(http.StatusConflict, gin.H{"error": "Could not resubmit — status may have changed"})
		return
	}

	notifId := generateId("NOTIF")
	notif := models.Notification{
		PK:        "USER#ADMIN",
		SK:        "NOTIF#" + now + "#" + notifId,
		Id:        notifId,
		UserId:    "ADMIN",
		Title:     "Application Resubmitted",
		Message:   fmt.Sprintf("%s resubmitted %s (%s)", app.RetailerName, app.ServiceName, appId),
		Type:      "info",
		IsRead:    false,
		CreatedAt: now,
		Link:      "/status",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Application resubmitted successfully",
		"id":      appId,
		"status":  "Pending",
	})
}

func UpdateServiceRequestStatus(c *gin.Context) {
	appId := strings.TrimSpace(c.Param("id"))
	appId = strings.TrimSuffix(appId, "/")

	// Prefer multipart/form; also accept JSON body as fallback.
	status := c.PostForm("status")
	adminRemarks := c.PostForm("adminRemarks")
	ackText := c.PostForm("ackText")
	if status == "" {
		var body struct {
			Status       string `json:"status"`
			AdminRemarks string `json:"adminRemarks"`
			AckText      string `json:"ackText"`
		}
		_ = c.ShouldBindJSON(&body)
		status = body.Status
		if adminRemarks == "" {
			adminRemarks = body.AdminRemarks
		}
		if ackText == "" {
			ackText = body.AckText
		}
	}

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
		"Approved": true, "Rejected": true, "Process": true, "Resubmit": true, "Pending": true, "Completed": true,
	}
	if !validStatuses[status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status: " + status})
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

	// Harden cost / retailerId from raw attributes if unmarshal missed them
	if app.Cost <= 0 {
		if n, ok := out.Item["cost"].(*types.AttributeValueMemberN); ok {
			fmt.Sscanf(n.Value, "%f", &app.Cost)
		}
	}
	if strings.TrimSpace(app.RetailerId) == "" {
		if s, ok := out.Item["retailerId"].(*types.AttributeValueMemberS); ok {
			app.RetailerId = s.Value
		}
	}
	if strings.TrimSpace(app.RefundedAt) == "" {
		if s, ok := out.Item["refundedAt"].(*types.AttributeValueMemberS); ok {
			app.RefundedAt = s.Value
		}
	}

	var isAlreadyApproved bool
	if app.Status == "Approved" || app.Status == "Completed" {
		if status == "Approved" || status == "Completed" {
			isAlreadyApproved = true
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Request is already in a final state"})
			return
		}
	} else if app.Status == "Rejected" && status != "Pending" && status != "Rejected" {
		// Allow reopen to Pending; allow re-post Rejected only for missing-refund repair below
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is already in a final state"})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)

	// 1) Always persist status first so UI never stays stuck on Pending
	if !isAlreadyApproved {
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
			log.Printf("UpdateServiceRequestStatus status write failed for %s: %v", appId, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
			return
		}
	} else {
		_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET lastUpdated = :time, adminRemarks = :remarks"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":time":    &types.AttributeValueMemberS{Value: now},
				":remarks": &types.AttributeValueMemberS{Value: adminRemarks},
			},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request remarks"})
			return
		}
	}

	// 2) Side effects (best-effort after status is saved)
	if status == "Approved" && !isAlreadyApproved {
		crmId := generateId("CRM")
		invoiceId := generateId("INV")

		crmCust := models.CRMCustomer{
			PK:         "CUSTOMER#" + crmId,
			SK:         "PROFILE",
			Id:         crmId,
			Name:       app.CustomerWhatsApp,
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

		if _, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("CRMCustomers"),
			Item:      crmItem,
		}); err != nil {
			log.Printf("Approved CRM put failed for %s: %v", appId, err)
		}
		if _, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("Invoices"),
			Item:      invoiceItem,
		}); err != nil {
			log.Printf("Approved invoice put failed for %s: %v", appId, err)
		}
	}

	refundedAmount := 0.0
	refundMsg := ""
	if status == "Rejected" {
		refundedAmount, refundMsg = processRejectRefund(appId, &app, now)
		if refundedAmount > 0 {
			log.Printf("Reject refund OK for %s: ₹%.2f → %s (%s)", appId, refundedAmount, app.RetailerId, refundMsg)
		} else if refundMsg != "" {
			log.Printf("Reject refund skipped for %s: %s", appId, refundMsg)
		}
	}

	// Update ackFiles or ackText if any were uploaded/entered
	if len(ackFiles) > 0 {
		ackFilesAttr, _ := attributevalue.MarshalList(ackFiles)
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET ackFiles = :ackFiles, ackText = :ackText"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":ackFiles": &types.AttributeValueMemberL{Value: ackFilesAttr},
				":ackText":  &types.AttributeValueMemberS{Value: ""},
			},
		})
	} else if ackText != "" {
		emptyFilesAttr, _ := attributevalue.MarshalList([]string{})
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("SET ackText = :ackText, ackFiles = :ackFiles"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":ackText":  &types.AttributeValueMemberS{Value: ackText},
				":ackFiles": &types.AttributeValueMemberL{Value: emptyFilesAttr},
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
		effectiveAckFiles := ackFiles
		effectiveAckText := ackText

		if len(effectiveAckFiles) == 0 && effectiveAckText == "" {
			effectiveAckFiles = app.AckFiles
			effectiveAckText = app.AckText
		}

		if len(effectiveAckFiles) > 0 {
			baseURL := os.Getenv("NEXT_PUBLIC_API_URL")
			if baseURL == "" {
				baseURL = "http://localhost:8080" // fallback
			}
			baseURL = strings.TrimSuffix(baseURL, "/api")
			
			ackLinks = "\n\nAcknowledgement Document(s):\n"
			for i, file := range effectiveAckFiles {
				ackLinks += fmt.Sprintf("%d. %s/api%s\n", i+1, baseURL, file)
			}
		} else if effectiveAckText != "" {
			ackLinks = fmt.Sprintf("\n\nAcknowledgement Details:\n%s\n", effectiveAckText)
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

	c.JSON(http.StatusOK, gin.H{
		"message":       "Request " + status + " successfully",
		"refundAmount":  refundedAmount,
		"refundMessage": refundMsg,
	})
}

// processRejectRefund credits the retailer wallet once per application.
// Safe to call again: refundedAt claim prevents double credit.
func processRejectRefund(appId string, app *models.ServiceApplication, now string) (float64, string) {
	retailerId := strings.TrimSpace(app.RetailerId)
	if retailerId == "" {
		return 0, "missing retailerId"
	}
	amount := app.Cost
	if amount <= 0 {
		return 0, "cost is zero — nothing to refund"
	}
	if strings.TrimSpace(app.RefundedAt) != "" {
		return 0, "already refunded at " + app.RefundedAt
	}

	costStr := fmt.Sprintf("%.2f", amount)
	walletPK := "WALLET#" + retailerId

	// Claim once
	_, claimErr := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("ServiceApplications"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression:    aws.String("SET refundedAt = :ts"),
		ConditionExpression: aws.String("attribute_not_exists(refundedAt)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":ts": &types.AttributeValueMemberS{Value: now},
		},
	})
	if claimErr != nil {
		// Recover stuck claims: refundedAt set but no refund ledger row
		qOut, qErr := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
			TableName:              aws.String("WalletTransactions"),
			KeyConditionExpression: aws.String("PK = :pk AND begins_with(SK, :sk)"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":pk": &types.AttributeValueMemberS{Value: walletPK},
				":sk": &types.AttributeValueMemberS{Value: "TX#"},
			},
		})
		hasRefundTx := false
		if qErr == nil {
			refWanted := appId + "-REFUND"
			for _, item := range qOut.Items {
				if r, ok := item["reference"].(*types.AttributeValueMemberS); ok && r.Value == refWanted {
					hasRefundTx = true
					break
				}
			}
		}
		if hasRefundTx {
			return 0, "already refunded"
		}
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("REMOVE refundedAt"),
		})
		_, claimErr = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression:    aws.String("SET refundedAt = :ts"),
			ConditionExpression: aws.String("attribute_not_exists(refundedAt)"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":ts": &types.AttributeValueMemberS{Value: now},
			},
		})
		if claimErr != nil {
			return 0, "refund already claimed"
		}
	}

	clearClaim := func() {
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("ServiceApplications"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "SERVICEAPP#" + appId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression: aws.String("REMOVE refundedAt"),
		})
	}

	txId := generateId("TX")
	refundTx := models.WalletTransaction{
		PK:          walletPK,
		SK:          "TX#" + now + "#" + txId,
		Id:          txId,
		WalletType:  "Main",
		Amount:      amount,
		Type:        "Credit",
		Status:      "Success",
		Reference:   appId + "-REFUND",
		CreatedAt:   now,
		Date:        timeutil.FormatRFC3339AsIST(now),
		Description: fmt.Sprintf("REFUND — Rejected: %s", app.ServiceName),
	}
	refundTxItem, _ := attributevalue.MarshalMap(refundTx)
	if _, err := db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item:      refundTxItem,
	}); err != nil {
		log.Printf("Reject refund tx failed for %s: %v", appId, err)
		clearClaim()
		return 0, "failed to write refund transaction"
	}

	// Credit Wallets (create row if missing)
	_, wErr := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: walletPK},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
		UpdateExpression: aws.String("SET balance = if_not_exists(balance, :zero) + :cost, updatedAt = :ts, userId = if_not_exists(userId, :uid)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":cost": &types.AttributeValueMemberN{Value: costStr},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now},
			":uid":  &types.AttributeValueMemberS{Value: retailerId},
		},
	})
	if wErr != nil {
		// Wallet row may not exist — PutItem with starting balance
		_, putErr := db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("Wallets"),
			Item: map[string]types.AttributeValue{
				"PK":        &types.AttributeValueMemberS{Value: walletPK},
				"SK":        &types.AttributeValueMemberS{Value: "TYPE#Main"},
				"userId":    &types.AttributeValueMemberS{Value: retailerId},
				"balance":   &types.AttributeValueMemberN{Value: costStr},
				"updatedAt": &types.AttributeValueMemberS{Value: now},
			},
			ConditionExpression: aws.String("attribute_not_exists(PK)"),
		})
		if putErr != nil {
			// Race: row appeared — retry ADD
			_, retryErr := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
				TableName: aws.String("Wallets"),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: walletPK},
					"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
				},
				UpdateExpression: aws.String("ADD balance :cost SET updatedAt = :ts"),
				ExpressionAttributeValues: map[string]types.AttributeValue{
					":cost": &types.AttributeValueMemberN{Value: costStr},
					":ts":   &types.AttributeValueMemberS{Value: now},
				},
			})
			if retryErr != nil {
				log.Printf("Reject wallet credit failed for %s: update=%v put=%v retry=%v", appId, wErr, putErr, retryErr)
				clearClaim()
				return 0, "failed to credit wallet"
			}
		}
	}

	_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + retailerId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) + :cost, updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":cost": &types.AttributeValueMemberN{Value: costStr},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now},
		},
	})

	app.RefundedAt = now
	return amount, "refunded"
}

func GetServiceRequests(c *gin.Context) {
	userId := c.Query("userId")
	if !auth.IsAdmin(c) {
		userId = auth.UserID(c)
	} else if userId == "" {
		// admin with no filter → all
	}

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
			id := strings.TrimSpace(u.UserId)
			if id == "" {
				id = strings.TrimPrefix(u.PK, "USER#")
			}
			if id != "" {
				userMap[id] = u
			}
		}

		for i, req := range requests {
			rid := strings.TrimSpace(req.RetailerId)
			u, ok := userMap[rid]
			if !ok {
				u, ok = userMap[strings.TrimPrefix(rid, "USER#")]
			}
			if !ok {
				if req.RetailerName == "" {
					requests[i].RetailerName = req.RetailerId
				}
				continue
			}
			if strings.TrimSpace(requests[i].RetailerName) == "" {
				requests[i].RetailerName = u.FullName
			}
			if strings.TrimSpace(requests[i].RetailerMobile) == "" {
				requests[i].RetailerMobile = u.Mobile
			}
		}
	}

	// Fetch dynamic services to calculate dynamic Profit
	dsOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("DynamicServices"),
	})
	dsMap := make(map[string]float64)
	if err == nil {
		var dServices []models.DynamicService
		attributevalue.UnmarshalListOfMaps(dsOut.Items, &dServices)
		for _, ds := range dServices {
			dsMap[ds.ID] = ds.OfficialCost
			// Also support mapping by name just in case
			dsMap[ds.Name] = ds.OfficialCost
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

	// Calculate Profit dynamically
	for i, req := range filteredRequests {
		officialCost := dsMap[req.ServiceId]
		if officialCost == 0 {
			officialCost = dsMap[req.ServiceName]
		}
		filteredRequests[i].OfficialCost = officialCost
		if req.Status == "Approved" || req.Status == "Completed" {
			filteredRequests[i].Profit = req.Cost - officialCost
		} else {
			filteredRequests[i].Profit = 0
		}
	}

	c.JSON(http.StatusOK, filteredRequests)
}

func GetWalletTransactions(c *gin.Context) {
	userId := c.Query("userId")
	if !auth.IsAdmin(c) || userId == "" {
		userId = auth.UserID(c)
	}
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
		ScanIndexForward: aws.Bool(false),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	var transactions []models.WalletTransaction
	attributevalue.UnmarshalListOfMaps(out.Items, &transactions)

	for i := range transactions {
		ist := timeutil.FormatRFC3339AsIST(transactions[i].CreatedAt)
		if ist != "" {
			transactions[i].Date = ist
			transactions[i].DateTime = ist
		} else if transactions[i].Date != "" {
			transactions[i].DateTime = transactions[i].Date
		}
	}

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
	// Optional notify fields (gateways vary on naming)
	CallbackURL string `json:"callback_url,omitempty"`
	WebhookURL  string `json:"webhook_url,omitempty"`
	NotifyURL   string `json:"notify_url,omitempty"`
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

	webhookURL := "https://api.thuruvancommunications.com/api/v1/wallet/recharge/webhook"
	// Browser must NEVER land on api.* (Edge returns HTTP 403 for some users).
	// Always use query ?paid=1 — gateways strip #hash fragments, so never trust client redirect_url.
	siteReturn := "https://thuruvancommunications.com/wallets/?paid=1"

	// Prepare request body for Mugavai API
	mugavaiReqBody := MugavaiCreateOrderReq{
		Amount:         req.Amount,
		CustomerMobile: req.CustomerMobile,
		CustomerEmail:  req.CustomerEmail,
		OrderID:        orderId,
		RedirectURL:    siteReturn,
		CallbackURL:    webhookURL,
		WebhookURL:     webhookURL,
		NotifyURL:      webhookURL,
	}

	jsonValue, err := json.Marshal(mugavaiReqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal request"})
		return
	}

	// Read credentials from env or fallback to provided ones
	username := os.Getenv("MUGAVAI_USERNAME")
	if username == "" {
		username = "6380616163" // Default fallback if not in .env
	}
	apiKey := os.Getenv("MUGAVAI_API_KEY")

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

	// Store order mapping under the gateway order id (webhook uses this id)
	authUser := auth.UserID(c)
	if authUser == "" {
		authUser = req.UserID
	}
	gatewayOrderID := strings.TrimSpace(mugavaiRes.Data.OrderID)
	if gatewayOrderID == "" {
		gatewayOrderID = orderId
	}
	if authUser != "" {
		now := time.Now().UTC().Format(time.RFC3339)
		metaItem := map[string]types.AttributeValue{
			"PK":        &types.AttributeValueMemberS{Value: "ORDER#" + gatewayOrderID},
			"SK":        &types.AttributeValueMemberS{Value: "META"},
			"userId":    &types.AttributeValueMemberS{Value: authUser},
			"amount":    &types.AttributeValueMemberN{Value: fmt.Sprintf("%.2f", req.Amount)},
			"status":    &types.AttributeValueMemberS{Value: "Pending"},
			"createdAt": &types.AttributeValueMemberS{Value: now},
			"localOrderId": &types.AttributeValueMemberS{Value: orderId},
		}
		_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
			TableName: aws.String("WalletTransactions"),
			Item:      metaItem,
		})
		// Also map local order id if gateway returned a different one
		if gatewayOrderID != orderId {
			alias := map[string]types.AttributeValue{
				"PK":        &types.AttributeValueMemberS{Value: "ORDER#" + orderId},
				"SK":        &types.AttributeValueMemberS{Value: "META"},
				"userId":    &types.AttributeValueMemberS{Value: authUser},
				"amount":    &types.AttributeValueMemberN{Value: fmt.Sprintf("%.2f", req.Amount)},
				"status":    &types.AttributeValueMemberS{Value: "Pending"},
				"createdAt": &types.AttributeValueMemberS{Value: now},
				"aliasOf":   &types.AttributeValueMemberS{Value: gatewayOrderID},
			}
			_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
				TableName: aws.String("WalletTransactions"),
				Item:      alias,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment gateway initialized successfully",
		"data": map[string]interface{}{
			"payment_url": mugavaiRes.Data.PaymentURL,
			"order_id":    gatewayOrderID,
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

// ProcessMugavaiPayment extracts parameters from the request, verifies idempotency, and credits the wallet
func ProcessMugavaiPayment(c *gin.Context) (bool, string) {
	bodyBytes, _ := io.ReadAll(c.Request.Body)
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	_ = c.Request.ParseForm()
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var jsonBody map[string]interface{}
	if len(bodyBytes) > 0 {
		_ = json.Unmarshal(bodyBytes, &jsonBody)
	}

	getParam := func(keys ...string) string {
		for _, k := range keys {
			if v := c.Query(k); v != "" {
				return v
			}
			if v := c.PostForm(k); v != "" {
				return v
			}
			if jsonBody != nil {
				if v, ok := jsonBody[k]; ok && v != nil {
					s := strings.TrimSpace(fmt.Sprintf("%v", v))
					if s != "" && s != "<nil>" {
						return s
					}
				}
			}
		}
		return ""
	}

	actualOrderID := getParam("order_id", "client_txn_id", "txn_id", "OrderId", "orderId")
	actualUTR := getParam("utr", "upi_txn_id", "bank_txn_id", "transaction_id", "UTR")
	status := getParam("status", "Status", "payment_status")
	return creditGatewayOrder(actualOrderID, status, actualUTR)
}

func walletLedgerHasOrder(userId, orderID string) bool {
	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("WalletTransactions"),
		KeyConditionExpression: aws.String("PK = :pk AND begins_with(SK, :sk)"),
		FilterExpression:       aws.String("id = :oid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk":  &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			":sk":  &types.AttributeValueMemberS{Value: "TX#"},
			":oid": &types.AttributeValueMemberS{Value: orderID},
		},
		Limit: aws.Int32(200),
	})
	if err != nil || out == nil {
		return false
	}
	for _, it := range out.Items {
		if id, ok := it["id"].(*types.AttributeValueMemberS); ok && id.Value == orderID {
			return true
		}
	}
	// Also match SK suffix (TX#timestamp#orderId)
	for _, it := range out.Items {
		if sk, ok := it["SK"].(*types.AttributeValueMemberS); ok && strings.HasSuffix(sk.Value, "#"+orderID) {
			return true
		}
	}
	return false
}

func creditGatewayOrder(actualOrderID, status, actualUTR string) (bool, string) {
	actualOrderID = strings.TrimSpace(actualOrderID)
	status = strings.TrimSpace(status)
	actualUTR = strings.TrimSpace(actualUTR)

	if actualOrderID == "" {
		return false, "missing order_id"
	}

	log.Printf("[Payment Processing] Order=%s Status=%s UTR=%s", actualOrderID, status, actualUTR)

	if status == "" && actualUTR != "" {
		status = "SUCCESS"
	}
	if status != "SUCCESS" && status != "success" && status != "COMPLETED" && status != "Completed" && status != "Success" && status != "PAID" && status != "Paid" {
		return false, "not a success status"
	}

	meta, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("WalletTransactions"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "ORDER#" + actualOrderID},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil || meta.Item == nil {
		log.Printf("[Payment Processing] Order meta not found for %s", actualOrderID)
		return false, "order_not_found"
	}

	canonicalID := actualOrderID
	if alias, ok := meta.Item["aliasOf"].(*types.AttributeValueMemberS); ok && strings.TrimSpace(alias.Value) != "" {
		canonicalID = strings.TrimSpace(alias.Value)
		meta2, err2 := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("WalletTransactions"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "ORDER#" + canonicalID},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
		})
		if err2 == nil && meta2.Item != nil {
			meta = meta2
		}
	}

	userIdAttr, ok := meta.Item["userId"].(*types.AttributeValueMemberS)
	if !ok || userIdAttr.Value == "" {
		return false, "user_not_found"
	}
	userId := userIdAttr.Value

	creditAmount := 0.0
	switch amt := meta.Item["amount"].(type) {
	case *types.AttributeValueMemberN:
		fmt.Sscanf(amt.Value, "%f", &creditAmount)
	case *types.AttributeValueMemberS:
		fmt.Sscanf(amt.Value, "%f", &creditAmount)
	}
	if creditAmount <= 0 {
		return false, "invalid_order_amount"
	}
	amountStr := fmt.Sprintf("%.2f", creditAmount)
	now := time.Now().UTC()
	if actualUTR == "" {
		if u, ok := meta.Item["utr"].(*types.AttributeValueMemberS); ok && strings.TrimSpace(u.Value) != "" {
			actualUTR = strings.TrimSpace(u.Value)
		} else {
			actualUTR = "GW-" + canonicalID
		}
	}

	// If META says Success but ledger row is missing, repair (credit again).
	orderAlreadySuccess := false
	if s, ok := meta.Item["status"].(*types.AttributeValueMemberS); ok {
		sv := strings.TrimSpace(s.Value)
		orderAlreadySuccess = sv == "Success" || sv == "SUCCESS" || sv == "success"
	}
	if orderAlreadySuccess {
		if walletLedgerHasOrder(userId, canonicalID) {
			log.Printf("[Payment Processing] Order %s already credited", canonicalID)
			return true, "already processed"
		}
		log.Printf("[Payment Processing] Order %s Success but no ledger — repairing credit", canonicalID)
	} else {
		_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("WalletTransactions"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "ORDER#" + canonicalID},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
			UpdateExpression:    aws.String("SET #s = :success, utr = :utr, processedAt = :ts"),
			ConditionExpression: aws.String("attribute_not_exists(#s) OR #s = :pending OR #s = :Pending OR #s = :pendingLower"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":success":       &types.AttributeValueMemberS{Value: "Success"},
				":pending":       &types.AttributeValueMemberS{Value: "Pending"},
				":Pending":       &types.AttributeValueMemberS{Value: "Pending"},
				":pendingLower":  &types.AttributeValueMemberS{Value: "pending"},
				":utr":           &types.AttributeValueMemberS{Value: actualUTR},
				":ts":            &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			},
		})
		if err != nil {
			// Race: another worker claimed it — re-check ledger
			if walletLedgerHasOrder(userId, canonicalID) {
				return true, "already processed"
			}
			log.Printf("[Payment Processing] Idempotent claim failed for %s: %v", canonicalID, err)
			return false, "claim_failed"
		}
	}

	if canonicalID != actualOrderID {
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("WalletTransactions"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "ORDER#" + actualOrderID},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
			UpdateExpression: aws.String("SET #s = :success, processedAt = :ts"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":success": &types.AttributeValueMemberS{Value: "Success"},
				":ts":      &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			},
		})
	}

	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
		UpdateExpression: aws.String("SET balance = if_not_exists(balance, :zero) + :amt, totalCredits = if_not_exists(totalCredits, :zero) + :amt, updatedAt = :ts, userId = if_not_exists(userId, :uid)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: amountStr},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			":uid":  &types.AttributeValueMemberS{Value: userId},
		},
	})
	if err != nil {
		log.Printf("[Payment Processing] Failed to credit Wallets for user %s: %v", userId, err)
		_, _ = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
			TableName: aws.String("WalletTransactions"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "ORDER#" + canonicalID},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
			UpdateExpression: aws.String("SET #s = :pending"),
			ExpressionAttributeNames: map[string]string{
				"#s": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":pending": &types.AttributeValueMemberS{Value: "Pending"},
			},
		})
		return false, "wallet credit failed"
	}

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

	txId := "TX#" + now.Format("20060102150405") + "#" + canonicalID
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item: map[string]types.AttributeValue{
			"PK":          &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK":          &types.AttributeValueMemberS{Value: txId},
			"id":          &types.AttributeValueMemberS{Value: canonicalID},
			"type":        &types.AttributeValueMemberS{Value: "credit"},
			"amount":      &types.AttributeValueMemberN{Value: amountStr},
			"reference":   &types.AttributeValueMemberS{Value: actualUTR},
			"description": &types.AttributeValueMemberS{Value: fmt.Sprintf("Wallet Recharge via Gateway (UTR: %s)", actualUTR)},
			"status":      &types.AttributeValueMemberS{Value: "Success"},
			"walletType":  &types.AttributeValueMemberS{Value: "Main"},
			"createdAt":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			"date":        &types.AttributeValueMemberS{Value: timeutil.FormatIST(now)},
		},
	})

	log.Printf("[Payment Processing] Successfully credited ₹%.2f to user %s", creditAmount, userId)

	admin.CreditAdminFromPartnerRecharge(
		creditAmount,
		userId,
		actualUTR,
		fmt.Sprintf("Partner gateway recharge (UTR: %s) from %s", actualUTR, userId),
	)

	notifId := generateId("NOTIF")
	notif := models.Notification{
		PK:        "USER#ADMIN",
		SK:        "NOTIF#" + now.Format(time.RFC3339) + "#" + notifId,
		Id:        notifId,
		UserId:    "ADMIN",
		Title:     "Wallet Recharged",
		Message:   fmt.Sprintf("User %s recharged wallet with %.2f (UTR: %s) — credited to admin wallet", userId, creditAmount, actualUTR),
		Type:      "success",
		IsRead:    false,
		CreatedAt: now.Format(time.RFC3339),
		Link:      "/wallets",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	return true, "success"
}

// RechargeWebhook handles the callback from Mugavai payment gateway
func RechargeWebhook(c *gin.Context) {
	success, msg := ProcessMugavaiPayment(c)
	if success {
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": msg})
	} else {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "message": msg}) // 200 OK so gateway doesn't retry infinitely on some errors
	}
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

func UpdateOfficialCost(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name         string  `json:"name"`
		OfficialCost float64 `json:"officialCost"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only OfficialCost (and Name if it's newly created)
	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("DynamicServices"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "DYNAMIC_SERVICE#" + id},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
		UpdateExpression: aws.String("SET #n = :n, officialCost = :c, id = :id"),
		ExpressionAttributeNames: map[string]string{
			"#n": "name",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":n":  &types.AttributeValueMemberS{Value: req.Name},
			":c":  &types.AttributeValueMemberN{Value: strconv.FormatFloat(req.OfficialCost, 'f', -1, 64)},
			":id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update official cost", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Official cost updated successfully"})
}

func DeleteDynamicService(c *gin.Context) {
	id := c.Param("id")

	_, err := db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("DynamicServices"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "DYNAMIC_SERVICE#" + id},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})

	if err != nil {
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

// RechargeReturn is kept for older gateway configs that still point here.
// Always bounce to the site — do not keep the browser on api.* (Edge 403).
func RechargeReturn(c *gin.Context) {
	ProcessMugavaiPayment(c)
	c.Header("Content-Type", "text/html; charset=utf-8")
	// Use meta-refresh + JS so even if 302 is blocked, the page still leaves api.*
	c.String(http.StatusOK, `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=https://thuruvancommunications.com/wallets/?paid=1">
<title>Redirecting…</title></head>
<body style="font-family:system-ui;text-align:center;padding:3rem;background:#f0fdfa;color:#064e3b">
<p>Payment received. Returning to wallet…</p>
<p><a href="https://thuruvancommunications.com/wallets/?paid=1">Continue to Wallet</a></p>
<script>location.replace("https://thuruvancommunications.com/wallets/?paid=1");</script>
</body></html>`)
}

// ConfirmGatewayRecharge lets the logged-in retailer confirm a gateway redirect
// that landed on the site with order_id/status/utr query params (no api.* visit).
func ConfirmGatewayRecharge(c *gin.Context) {
	var body struct {
		OrderID string `json:"order_id"`
		Status  string `json:"status"`
		UTR     string `json:"utr"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	orderID := strings.TrimSpace(body.OrderID)
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order_id required"})
		return
	}

	meta, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("WalletTransactions"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "ORDER#" + orderID},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil || meta.Item == nil {
		// try as local alias
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	uidAttr, _ := meta.Item["userId"].(*types.AttributeValueMemberS)
	if uidAttr == nil || (!auth.IsAdmin(c) && uidAttr.Value != auth.UserID(c)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed"})
		return
	}

	// User returned from gateway after paying; webhook may lag — credit now.
	status := strings.TrimSpace(body.Status)
	utr := strings.TrimSpace(body.UTR)
	if status == "" {
		status = "SUCCESS"
	}

	ok, msg := creditGatewayOrder(orderID, status, utr)
	bal := 0.0
	if uidAttr != nil {
		// Live balance after credit attempt
		wOut, wErr := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("Wallets"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "WALLET#" + uidAttr.Value},
				"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
			},
		})
		if wErr == nil && wOut.Item != nil {
			if v, ok := wOut.Item["balance"].(*types.AttributeValueMemberN); ok {
				fmt.Sscanf(v.Value, "%f", &bal)
			}
		}
	}
	if ok {
		c.JSON(http.StatusOK, gin.H{"status": "Success", "message": msg, "balance": bal})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Pending", "message": msg, "balance": bal})
}
