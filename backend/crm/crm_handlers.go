package crm

import (
	"context"
	"net/http"
	"time"

	"eservice-backend/db"
	"eservice-backend/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/gin-gonic/gin"
)

func generateCustomerId() string {
	return "CUST" + time.Now().Format("20060102150405")
}

func CreateCustomer(c *gin.Context) {
	var req models.CRMCustomer
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.Id = generateCustomerId()
	req.PK = "CUSTOMER#" + req.Id
	req.SK = "METADATA"
	req.CreatedAt = now
	req.UpdatedAt = now
	
	if req.JoinedDate == "" {
		req.JoinedDate = time.Now().Format("2006-01-02")
	}

	item, err := attributevalue.MarshalMap(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal data"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("CRMCustomers"),
		Item:      item,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Add Notification for Admin
	notifId := "NOTIF" + time.Now().Format("20060102150405")
	notif := map[string]interface{}{
		"PK":        "USER#ADMIN",
		"SK":        "NOTIF#" + now + "#" + notifId,
		"id":        notifId,
		"userId":    "ADMIN",
		"title":     "New CRM Customer",
		"message":   fmt.Sprintf("New customer created: %s (%s)", req.Name, req.Mobile),
		"type":      "info",
		"isRead":    false,
		"createdAt": now,
		"link":      "/status",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	c.JSON(http.StatusCreated, req)
}

func GetCustomers(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("CRMCustomers"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customers"})
		return
	}

	var customers []models.CRMCustomer
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &customers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse data"})
		return
	}

	if customers == nil {
		customers = []models.CRMCustomer{}
	}

	c.JSON(http.StatusOK, customers)
}
