package service

import (
	"context"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"

	"eservice-backend/db"
)

type GenericSettingStore struct {
	PK     string      `dynamodbav:"PK"`
	SK     string      `dynamodbav:"SK"`
	Config interface{} `dynamodbav:"config"`
}

func GetSetting(c *gin.Context) {
	key := c.Param("key")
	if strings.TrimSpace(key) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Setting key is required"})
		return
	}

	pk := "SETTING#" + key

	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Settings"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch setting", "details": err.Error()})
		return
	}

	if out.Item == nil || len(out.Item) == 0 {
		c.JSON(http.StatusOK, gin.H{}) // Empty object if not found
		return
	}

	var data GenericSettingStore
	err = attributevalue.UnmarshalMap(out.Item, &data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode config"})
		return
	}

	c.JSON(http.StatusOK, data.Config)
}

func UpdateSetting(c *gin.Context) {
	key := c.Param("key")
	if strings.TrimSpace(key) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Setting key is required"})
		return
	}

	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pk := "SETTING#" + key

	store := GenericSettingStore{
		PK:     pk,
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save setting", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Setting saved successfully", "key": key})
}
