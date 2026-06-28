package service

import (
	"context"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"

	"eservice-backend/db"
)

// The structure to store the pricing config map
type PricingConfigStore struct {
	PK     string      `dynamodbav:"PK"`
	SK     string      `dynamodbav:"SK"`
	Config interface{} `dynamodbav:"config"`
}

func GetPricingConfig(c *gin.Context) {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Settings"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SETTING#pricingConfig"},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pricing config", "details": err.Error()})
		return
	}

	if out.Item == nil {
		c.JSON(http.StatusOK, gin.H{}) // Empty object if not found
		return
	}

	var data PricingConfigStore
	err = attributevalue.UnmarshalMap(out.Item, &data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode config"})
		return
	}

	c.JSON(http.StatusOK, data.Config)
}

func UpdatePricingConfig(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	store := PricingConfigStore{
		PK:     "SETTING#pricingConfig",
		SK:     "META",
		Config: req,
	}

	av, err := attributevalue.MarshalMap(store)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal config data"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Settings"),
		Item:      av,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save config", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pricing configuration saved successfully"})
}
