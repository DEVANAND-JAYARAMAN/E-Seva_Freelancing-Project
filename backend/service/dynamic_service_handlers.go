package service

import (
	"context"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"eservice-backend/db"
	"eservice-backend/models"
)

func CreateDynamicService(c *gin.Context) {
	var req struct {
		Name              string   `json:"name"`
		RetailerCharge    float64  `json:"retailerCharge"`
		DistributorCharge float64  `json:"distributorCharge"`
		OfficialCost      float64  `json:"officialCost"`
		FormFields        []string `json:"formFields"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name == "" || len(req.FormFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and FormFields are required"})
		return
	}

	newService := models.DynamicService{
		ID:                uuid.New().String(),
		Name:              req.Name,
		RetailerCharge:    req.RetailerCharge,
		DistributorCharge: req.DistributorCharge,
		OfficialCost:      req.OfficialCost,
		FormFields:        req.FormFields,
		CreatedDate:       time.Now().Format(time.RFC3339),
	}

	av, err := attributevalue.MarshalMap(newService)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal data"})
		return
	}

	av["PK"] = &types.AttributeValueMemberS{Value: "DYNAMIC_SERVICE#" + newService.ID}
	av["SK"] = &types.AttributeValueMemberS{Value: "META"}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("DynamicServices"),
		Item:      av,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save dynamic service", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newService)
}

func GetDynamicServices(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("DynamicServices"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dynamic services", "details": err.Error()})
		return
	}

	var services []models.DynamicService
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &services); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal data"})
		return
	}

	c.JSON(http.StatusOK, services)
}
