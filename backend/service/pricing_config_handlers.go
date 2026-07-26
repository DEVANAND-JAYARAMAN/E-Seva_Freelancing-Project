package service

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

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

// ResolveServiceChargeFromPricing loads SETTING#pricingConfig and returns role-based charge.
func ResolveServiceChargeFromPricing(userId, categoryId, serviceId, serviceName string) (float64, bool) {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Settings"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SETTING#pricingConfig"},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil || out.Item == nil {
		return 0, false
	}

	var data PricingConfigStore
	if err := attributevalue.UnmarshalMap(out.Item, &data); err != nil || data.Config == nil {
		return 0, false
	}

	role := "retailer"
	uOut, uErr := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if uErr == nil && uOut.Item != nil {
		if v, ok := uOut.Item["role"].(*types.AttributeValueMemberS); ok && v.Value != "" {
			role = strings.ToLower(v.Value)
		}
	}

	matrix, ok := data.Config.(map[string]interface{})
	if !ok {
		raw, mErr := json.Marshal(data.Config)
		if mErr != nil {
			return 0, false
		}
		if jErr := json.Unmarshal(raw, &matrix); jErr != nil {
			return 0, false
		}
	}

	norm := func(s string) string {
		s = strings.ToLower(strings.TrimSpace(s))
		var b strings.Builder
		prevSpace := false
		for _, r := range s {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
				b.WriteRune(r)
				prevSpace = false
			} else if !prevSpace {
				b.WriteByte(' ')
				prevSpace = true
			}
		}
		return strings.TrimSpace(b.String())
	}

	sid := norm(serviceId)
	sname := norm(serviceName)

	pickPrice := func(row map[string]interface{}) float64 {
		key := "retailerPrice"
		if role == "distributor" {
			key = "distributorPrice"
		} else if role == "admin" {
			key = "adminPrice"
		}
		if v, ok := row[key]; ok {
			switch t := v.(type) {
			case float64:
				return t
			case int:
				return float64(t)
			case string:
				f, _ := strconv.ParseFloat(t, 64)
				return f
			}
		}
		if v, ok := row["retailerPrice"]; ok {
			switch t := v.(type) {
			case float64:
				return t
			case int:
				return float64(t)
			case string:
				f, _ := strconv.ParseFloat(t, 64)
				return f
			}
		}
		return 0
	}

	asRows := func(v interface{}) []map[string]interface{} {
		arr, ok := v.([]interface{})
		if !ok {
			return nil
		}
		out := make([]map[string]interface{}, 0, len(arr))
		for _, item := range arr {
			if m, ok := item.(map[string]interface{}); ok {
				out = append(out, m)
			}
		}
		return out
	}

	searchList := func(list []map[string]interface{}) (float64, bool) {
		for _, row := range list {
			id, _ := row["id"].(string)
			name, _ := row["name"].(string)
			if sid != "" && norm(id) == sid {
				p := pickPrice(row)
				if p > 0 {
					return p, true
				}
			}
			if sname != "" && norm(name) == sname {
				p := pickPrice(row)
				if p > 0 {
					return p, true
				}
			}
		}
		for _, row := range list {
			name, _ := row["name"].(string)
			nn := norm(name)
			if sname != "" && (strings.Contains(nn, sname) || strings.Contains(sname, nn)) {
				p := pickPrice(row)
				if p > 0 {
					return p, true
				}
			}
		}
		if len(list) > 0 {
			for _, row := range list {
				id, _ := row["id"].(string)
				if strings.HasSuffix(strings.ToLower(id), "main") {
					p := pickPrice(row)
					if p > 0 {
						return p, true
					}
				}
			}
			p := pickPrice(list[0])
			if p > 0 {
				return p, true
			}
		}
		return 0, false
	}

	if categoryId != "" {
		if list := asRows(matrix[categoryId]); len(list) > 0 {
			if p, ok := searchList(list); ok {
				return p, true
			}
		}
	}
	for _, v := range matrix {
		if list := asRows(v); len(list) > 0 {
			if p, ok := searchList(list); ok {
				return p, true
			}
		}
	}
	return 0, false
}

func GetPdfPricingConfig(c *gin.Context) {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Settings"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "SETTING#pdfPricingConfig"},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pdf pricing config", "details": err.Error()})
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

func UpdatePdfPricingConfig(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	store := PricingConfigStore{
		PK:     "SETTING#pdfPricingConfig",
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

	c.JSON(http.StatusOK, gin.H{"message": "PDF Pricing configuration saved successfully"})
}
