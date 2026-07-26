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
		return 0, false
	}

	if categoryId != "" {
		if list := asRows(matrix[categoryId]); len(list) > 0 {
			if p, ok := searchList(list); ok {
				return p, true
			}
		}
		return 0, false
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

func parseMoneyValue(v interface{}) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case int:
		return float64(t)
	case int64:
		return float64(t)
	case string:
		f, _ := strconv.ParseFloat(strings.TrimSpace(t), 64)
		return f
	default:
		return 0
	}
}

func normPriceKey(s string) string {
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

// ResolveServiceChargeFromPdfPricing reads SETTING#pdfPricingConfig commission rows
// and returns the role-based amount (retailer / distributor / admin).
func ResolveServiceChargeFromPdfPricing(userId, serviceId, serviceName string) (float64, bool) {
	cfg, err := loadSettingsConfig("SETTING#pdfPricingConfig")
	if err != nil || cfg == nil {
		return 0, false
	}
	rows := asConfigMaps(cfg)
	if len(rows) == 0 || !isPdfCommissionPricingRow(rows[0]) {
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

	pick := func(row map[string]interface{}) float64 {
		key := "retailer"
		if role == "distributor" {
			key = "distributor"
		} else if role == "admin" {
			key = "admin"
		}
		if p := parseMoneyValue(row[key]); p > 0 {
			return p
		}
		if p := parseMoneyValue(row["retailer"]); p > 0 {
			return p
		}
		return 0
	}

	sid := normPriceKey(serviceId)
	sname := normPriceKey(serviceName)

	for _, row := range rows {
		name, _ := row["serviceName"].(string)
		n := normPriceKey(name)
		if sname != "" && n == sname {
			if p := pick(row); p > 0 {
				return p, true
			}
		}
	}
	for _, row := range rows {
		name, _ := row["serviceName"].(string)
		n := normPriceKey(name)
		if sid != "" && (n == sid || strings.Contains(n, sid) || strings.Contains(sid, n)) {
			if p := pick(row); p > 0 {
				return p, true
			}
		}
		if sname != "" && n != "" && (strings.Contains(n, sname) || strings.Contains(sname, n)) {
			if p := pick(row); p > 0 {
				return p, true
			}
		}
	}
	return 0, false
}

// isPdfCommissionPricingRow detects admin commission-matrix rows
// (PdfServicePage) vs retailer catalog cards (PdfPage: id/name/amount).
func isPdfCommissionPricingRow(m map[string]interface{}) bool {
	if _, ok := m["serviceName"]; ok {
		return true
	}
	if _, ok := m["admin"]; ok {
		return true
	}
	if _, ok := m["retailer"]; ok {
		return true
	}
	return false
}

func isPdfCatalogRow(m map[string]interface{}) bool {
	if isPdfCommissionPricingRow(m) {
		return false
	}
	_, hasName := m["name"]
	_, hasAmount := m["amount"]
	_, hasID := m["id"]
	return hasName || hasAmount || hasID
}

func asConfigMaps(cfg interface{}) []map[string]interface{} {
	arr, ok := cfg.([]interface{})
	if !ok {
		raw, err := json.Marshal(cfg)
		if err != nil {
			return nil
		}
		var decoded []interface{}
		if json.Unmarshal(raw, &decoded) != nil {
			return nil
		}
		arr = decoded
	}
	out := make([]map[string]interface{}, 0, len(arr))
	for _, item := range arr {
		if m, ok := item.(map[string]interface{}); ok {
			out = append(out, m)
		}
	}
	return out
}

func loadSettingsConfig(pk string) (interface{}, error) {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Settings"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil {
		return nil, err
	}
	if out.Item == nil {
		return nil, nil
	}
	var data PricingConfigStore
	if err := attributevalue.UnmarshalMap(out.Item, &data); err != nil {
		return nil, err
	}
	return data.Config, nil
}

func saveSettingsConfig(pk string, cfg interface{}) error {
	store := PricingConfigStore{
		PK:     pk,
		SK:     "META",
		Config: cfg,
	}
	av, err := attributevalue.MarshalMap(store)
	if err != nil {
		return err
	}
	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Settings"),
		Item:      av,
	})
	return err
}

func GetPdfPricingConfig(c *gin.Context) {
	cfg, err := loadSettingsConfig("SETTING#pdfPricingConfig")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pdf pricing config", "details": err.Error()})
		return
	}
	if cfg == nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	rows := asConfigMaps(cfg)
	if len(rows) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	// Legacy: PdfPage catalog was saved into the same key — do not return it
	// as commission pricing (blank serviceName/admin columns on /pdf-service).
	if isPdfCatalogRow(rows[0]) && !isPdfCommissionPricingRow(rows[0]) {
		_ = saveSettingsConfig("SETTING#pdfServicesCatalog", cfg)
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	c.JSON(http.StatusOK, cfg)
}

func UpdatePdfPricingConfig(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := saveSettingsConfig("SETTING#pdfPricingConfig", req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save config", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "PDF Pricing configuration saved successfully"})
}

// GetPdfServicesCatalog returns retailer PDF service cards (id/name/amount).
func GetPdfServicesCatalog(c *gin.Context) {
	cfg, err := loadSettingsConfig("SETTING#pdfServicesCatalog")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pdf services catalog", "details": err.Error()})
		return
	}
	if cfg != nil {
		c.JSON(http.StatusOK, cfg)
		return
	}

	// Migrate catalog data that was previously stored under pdfPricingConfig.
	legacy, lerr := loadSettingsConfig("SETTING#pdfPricingConfig")
	if lerr == nil && legacy != nil {
		rows := asConfigMaps(legacy)
		if len(rows) > 0 && isPdfCatalogRow(rows[0]) && !isPdfCommissionPricingRow(rows[0]) {
			_ = saveSettingsConfig("SETTING#pdfServicesCatalog", legacy)
			c.JSON(http.StatusOK, legacy)
			return
		}
	}

	c.JSON(http.StatusOK, []interface{}{})
}

func UpdatePdfServicesCatalog(c *gin.Context) {
	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := saveSettingsConfig("SETTING#pdfServicesCatalog", req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save catalog", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "PDF services catalog saved successfully"})
}
