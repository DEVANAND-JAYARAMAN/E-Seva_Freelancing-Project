package billing

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

func generateInvoiceId() string {
	return "INV" + time.Now().Format("20060102150405")
}

func CreateInvoice(c *gin.Context) {
	var req models.Invoice
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.Id = generateInvoiceId()
	req.PK = "INV#" + req.Id
	req.SK = "METADATA"
	req.CreatedAt = now
	req.UpdatedAt = now
	if req.InvoiceNumber == "" {
		req.InvoiceNumber = "INV-" + time.Now().Format("20060102") + "-" + req.Id[len(req.Id)-4:]
	}

	item, err := attributevalue.MarshalMap(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal data"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Invoices"),
		Item:      item,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusCreated, req)
}

func GetInvoices(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Invoices"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch invoices"})
		return
	}

	var invoices []models.Invoice
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &invoices); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse data"})
		return
	}

	if invoices == nil {
		invoices = []models.Invoice{}
	}

	c.JSON(http.StatusOK, invoices)
}
