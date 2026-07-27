package developers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"eservice-backend/auth"
	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

const maxWhitelistIPs = 5

func generateAPIKey() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func userProfileKey(userId string) map[string]types.AttributeValue {
	return map[string]types.AttributeValue{
		"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
		"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
	}
}

// GetAPIKey GET /api/developers/api-key
func GetAPIKey(c *gin.Context) {
	userId := auth.UserID(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key:       userProfileKey(userId),
	})
	if err != nil || out.Item == nil {
		c.JSON(http.StatusOK, gin.H{
			"apiKey":    "",
			"whitelist": []string{},
			"baseUrl":   "https://apizone.info/api/",
		})
		return
	}
	apiKey := ""
	if v, ok := out.Item["apiKey"].(*types.AttributeValueMemberS); ok {
		apiKey = v.Value
	}
	whitelist := []string{}
	if v, ok := out.Item["apiWhitelist"].(*types.AttributeValueMemberL); ok {
		for _, item := range v.Value {
			if s, ok := item.(*types.AttributeValueMemberS); ok && strings.TrimSpace(s.Value) != "" {
				whitelist = append(whitelist, strings.TrimSpace(s.Value))
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"apiKey":    apiKey,
		"whitelist": whitelist,
		"baseUrl":   "https://apizone.info/api/",
	})
}

// GenerateAPIKey POST /api/developers/api-key/generate
func GenerateAPIKey(c *gin.Context) {
	userId := auth.UserID(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	key, err := generateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate key"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key:       userProfileKey(userId),
		UpdateExpression: aws.String(
			"SET apiKey = :k, apiKeyUpdatedAt = :ts",
		),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":k":  &types.AttributeValueMemberS{Value: key},
			":ts": &types.AttributeValueMemberS{Value: now},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save API key"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"apiKey":  key,
		"baseUrl": "https://apizone.info/api/",
		"message": "API key generated",
	})
}

type whitelistReq struct {
	Whitelist []string `json:"whitelist"`
}

// SaveWhitelist PUT /api/developers/api-key/whitelist
func SaveWhitelist(c *gin.Context) {
	userId := auth.UserID(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req whitelistReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cleaned := make([]types.AttributeValue, 0, maxWhitelistIPs)
	for _, ip := range req.Whitelist {
		ip = strings.TrimSpace(ip)
		if ip == "" {
			continue
		}
		cleaned = append(cleaned, &types.AttributeValueMemberS{Value: ip})
		if len(cleaned) >= maxWhitelistIPs {
			break
		}
	}
	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key:       userProfileKey(userId),
		UpdateExpression: aws.String(
			"SET apiWhitelist = :w",
		),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":w": &types.AttributeValueMemberL{Value: cleaned},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save whitelist"})
		return
	}
	out := make([]string, 0, len(cleaned))
	for _, v := range cleaned {
		if s, ok := v.(*types.AttributeValueMemberS); ok {
			out = append(out, s.Value)
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"whitelist": out,
		"message":   "Whitelist saved",
	})
}
