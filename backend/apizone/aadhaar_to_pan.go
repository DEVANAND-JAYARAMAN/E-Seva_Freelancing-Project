package apizone

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"eservice-backend/auth"
	"eservice-backend/db"
	"eservice-backend/service"
	"eservice-backend/timeutil"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type aadhaarToPanReq struct {
	Aadhaar     string  `json:"aadhaar" binding:"required"`
	ServiceID   string  `json:"serviceId"`
	ServiceName string  `json:"serviceName"`
	Cost        float64 `json:"cost"`
}

func baseURL() string {
	b := strings.TrimSpace(os.Getenv("APIZONE_BASE_URL"))
	if b == "" {
		b = "https://kycapizone.in/api/"
	}
	if !strings.HasSuffix(b, "/") {
		b += "/"
	}
	return b
}

func apiKey() string {
	return strings.TrimSpace(os.Getenv("APIZONE_API_KEY"))
}

func apiWalletBalance(userId string) float64 {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#API"},
		},
	})
	if err != nil || out.Item == nil {
		return 0
	}
	if v, ok := out.Item["balance"].(*types.AttributeValueMemberN); ok {
		f, _ := strconv.ParseFloat(v.Value, 64)
		return f
	}
	return 0
}

func debitAPIWallet(userId string, amount float64, reference, description string) (float64, error) {
	amountStr := fmt.Sprintf("%.2f", amount)
	now := time.Now().UTC()
	out, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#API"},
		},
		UpdateExpression: aws.String(
			"SET balance = if_not_exists(balance, :zero) - :amt, totalDebits = if_not_exists(totalDebits, :zero) + :amt, updatedAt = :ts, userId = if_not_exists(userId, :uid)",
		),
		ConditionExpression: aws.String("attribute_exists(balance) AND balance >= :amt"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: amountStr},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			":uid":  &types.AttributeValueMemberS{Value: userId},
		},
		ReturnValues: types.ReturnValueUpdatedNew,
	})
	if err != nil {
		return 0, err
	}
	newBal := 0.0
	if out.Attributes != nil {
		if v, ok := out.Attributes["balance"].(*types.AttributeValueMemberN); ok {
			newBal, _ = strconv.ParseFloat(v.Value, 64)
		}
	}
	txId := "TX#" + now.Format("20060102150405") + "#API#" + reference
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item: map[string]types.AttributeValue{
			"PK":          &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK":          &types.AttributeValueMemberS{Value: txId},
			"id":          &types.AttributeValueMemberS{Value: reference},
			"type":        &types.AttributeValueMemberS{Value: "debit"},
			"amount":      &types.AttributeValueMemberN{Value: amountStr},
			"reference":   &types.AttributeValueMemberS{Value: reference},
			"description": &types.AttributeValueMemberS{Value: description},
			"status":      &types.AttributeValueMemberS{Value: "Success"},
			"walletType":  &types.AttributeValueMemberS{Value: "API"},
			"createdAt":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
			"date":        &types.AttributeValueMemberS{Value: timeutil.FormatIST(now)},
		},
	})
	return newBal, nil
}

// AadhaarToPan POST /api/v1/external-api/aadhaar-to-pan
// Calls APIZONE, returns PAN, debits Api Wallet on success.
func AadhaarToPan(c *gin.Context) {
	userId := auth.UserID(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req aadhaarToPanReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	aadhaar := strings.TrimSpace(req.Aadhaar)
	if len(aadhaar) != 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Aadhaar must be 12 digits"})
		return
	}
	for _, ch := range aadhaar {
		if ch < '0' || ch > '9' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Aadhaar must be 12 digits"})
			return
		}
	}

	serviceID := strings.TrimSpace(req.ServiceID)
	if serviceID == "" {
		serviceID = "adhaar-to-pan"
	}
	serviceName := strings.TrimSpace(req.ServiceName)
	if serviceName == "" {
		serviceName = "Adhaar to Pan Number"
	}

	charge := req.Cost
	if resolved, ok := service.ResolveServiceChargeFromPdfPricing(userId, serviceID, serviceName); ok && resolved > 0 {
		charge = resolved
	}
	if charge <= 0 {
		charge = 12
	}

	bal := apiWalletBalance(userId)
	if bal < charge {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":      fmt.Sprintf("Insufficient Api Wallet balance. Need ₹%.2f, have ₹%.2f", charge, bal),
			"apiBalance": bal,
			"charge":     charge,
		})
		return
	}

	key := apiKey()
	if key == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "APIZONE_API_KEY is not configured on server. Ask admin to set it.",
		})
		return
	}

	endpoint := baseURL() + "panno/instant/aadhaar_to_pan.php"
	q := url.Values{}
	q.Set("api_key", key)
	q.Set("aadhaar_no", aadhaar)
	fullURL := endpoint + "?" + q.Encode()

	client := &http.Client{Timeout: 45 * time.Second}
	httpReq, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build upstream request"})
		return
	}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Printf("[APIZONE] aadhaar-to-pan request failed: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Could not reach APIZONE: " + err.Error()})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var upstream map[string]interface{}
	_ = json.Unmarshal(body, &upstream)

	success := false
	if v, ok := upstream["success"].(bool); ok {
		success = v
	}
	statusCode := 0
	switch v := upstream["status_code"].(type) {
	case float64:
		statusCode = int(v)
	case string:
		fmt.Sscanf(v, "%d", &statusCode)
	}
	if !success && statusCode != 100 {
		msg := strings.TrimSpace(fmt.Sprintf("%v", upstream["message"]))
		if msg == "" || msg == "<nil>" {
			msg = "APIZONE lookup failed"
		}
		c.JSON(http.StatusOK, gin.H{
			"success":  false,
			"message":  msg,
			"upstream": upstream,
			"charged":  false,
		})
		return
	}

	pan := ""
	if data, ok := upstream["data"].(map[string]interface{}); ok {
		pan = strings.TrimSpace(fmt.Sprintf("%v", data["pan_number"]))
		if pan == "<nil>" {
			pan = ""
		}
	}
	if pan == "" {
		c.JSON(http.StatusOK, gin.H{
			"success":  false,
			"message":  "PAN not found in upstream response",
			"upstream": upstream,
			"charged":  false,
		})
		return
	}

	ref := fmt.Sprintf("A2P-%d", time.Now().Unix())
	newBal, err := debitAPIWallet(
		userId,
		charge,
		ref,
		fmt.Sprintf("Aadhaar to PAN (%s)", serviceName),
	)
	if err != nil {
		log.Printf("[APIZONE] debit API wallet failed for %s: %v", userId, err)
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":   "Api Wallet debit failed — please top up Api Wallet and retry",
			"success": false,
			"charged": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Aadhaar to PAN fetched successfully",
		"pan":        pan,
		"aadhaar":    aadhaar[:4] + "XXXXXXXX" + aadhaar[len(aadhaar)-4:],
		"charge":     charge,
		"apiBalance": newBal,
		"reference":  ref,
		"upstream":   upstream,
		"charged":    true,
	})
}
