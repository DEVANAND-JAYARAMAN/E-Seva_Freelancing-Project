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

func candidateBaseURLs() []string {
	primary := baseURL()
	fallbacks := []string{
		"https://kycapizone.in/api/",
		"https://live.kycapizone.in/api/",
	}
	seen := map[string]bool{}
	out := make([]string, 0, 1+len(fallbacks))
	for _, b := range append([]string{primary}, fallbacks...) {
		b = strings.TrimSpace(b)
		if b == "" {
			continue
		}
		if !strings.HasSuffix(b, "/") {
			b += "/"
		}
		if seen[b] {
			continue
		}
		seen[b] = true
		out = append(out, b)
	}
	return out
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

	mobile := ResolveMobile(userId)
	bal, balErr := FetchLiveBalance(mobile)
	if balErr != nil {
		// Fallback to local Api Wallet only if live sync unavailable
		bal = apiWalletBalance(userId)
		LogBalanceSyncError(balErr)
	}
	if bal < charge {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": fmt.Sprintf(
				"Insufficient Api Wallet (APIZONE) balance. Need ₹%.2f, have ₹%.2f. Recharge on APIZONE portal.",
				charge, bal,
			),
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
	keyHint := map[string]interface{}{
		"keyLen":    len(key),
		"keySuffix": keySuffix(key),
	}

	client := &http.Client{Timeout: 45 * time.Second}
	var (
		upstream    map[string]interface{}
		rawBody     string
		usedURL     string
		lastErr     string
		bestJSONErr string
	)

	for _, base := range candidateBaseURLs() {
		endpoint := base + "panno/instant/aadhaar_to_pan.php"
		q := url.Values{}
		q.Set("api_key", key)
		q.Set("aadhaar_no", aadhaar)
		fullURL := endpoint + "?" + q.Encode()
		usedURL = endpoint

		httpReq, err := http.NewRequest("GET", fullURL, nil)
		if err != nil {
			lastErr = "Failed to build upstream request"
			continue
		}
		httpReq.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ThuruvanESeva/1.0)")
		httpReq.Header.Set("Accept", "application/json, text/plain, */*")
		httpReq.Header.Set("Referer", "https://dashboard.apizone.info/")
		resp, err := client.Do(httpReq)
		if err != nil {
			log.Printf("[APIZONE] aadhaar-to-pan request failed (%s): %v", endpoint, err)
			lastErr = err.Error()
			continue
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		rawBody = string(body)

		var parsed map[string]interface{}
		if err := json.Unmarshal(body, &parsed); err != nil || parsed == nil {
			lastErr = "Non-JSON response from " + endpoint
			log.Printf("[APIZONE] non-json from %s status=%d body=%q", endpoint, resp.StatusCode, truncate(rawBody, 300))
			continue
		}
		upstream = parsed

		success := false
		switch v := upstream["success"].(type) {
		case bool:
			success = v
		case string:
			success = strings.EqualFold(v, "true") || v == "1"
		}
		statusCode := 0
		switch v := upstream["status_code"].(type) {
		case float64:
			statusCode = int(v)
		case string:
			fmt.Sscanf(v, "%d", &statusCode)
		}
		if success || statusCode == 100 {
			break
		}
		msg := strings.TrimSpace(fmt.Sprintf("%v", upstream["message"]))
		if msg == "<nil>" {
			msg = ""
		}
		lastErr = msg
		if lastErr == "" {
			lastErr = fmt.Sprintf("APIZONE rejected request (status_code=%d)", statusCode)
		}
		if bestJSONErr == "" || statusCode == 401 || statusCode == 403 {
			bestJSONErr = lastErr
		}
		log.Printf("[APIZONE] upstream fail host=%s status_code=%d msg=%s", endpoint, statusCode, lastErr)
		upstream = nil
	}

	if upstream == nil {
		msg := strings.TrimSpace(bestJSONErr)
		if msg == "" {
			msg = strings.TrimSpace(lastErr)
		}
		if msg == "" {
			msg = "APIZONE lookup failed"
		}
		c.JSON(http.StatusOK, gin.H{
			"success":   false,
			"message":   msg,
			"endpoint":  usedURL,
			"charged":   false,
			"keyLen":    keyHint["keyLen"],
			"keySuffix": keyHint["keySuffix"],
		})
		return
	}

	success := false
	switch v := upstream["success"].(type) {
	case bool:
		success = v
	case string:
		success = strings.EqualFold(v, "true") || v == "1"
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
			"success":   false,
			"message":   msg,
			"upstream":  upstream,
			"endpoint":  usedURL,
			"charged":   false,
			"keyLen":    keyHint["keyLen"],
			"keySuffix": keyHint["keySuffix"],
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
			"endpoint": usedURL,
			"charged":  false,
		})
		return
	}

	ref := fmt.Sprintf("A2P-%d", time.Now().Unix())
	// APIZONE deducts from their merchant wallet on success — refresh live balance (no local debit)
	newBal, balErr := FetchLiveBalance(mobile)
	if balErr != nil {
		LogBalanceSyncError(balErr)
		newBal = bal // last known
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
		"endpoint":   usedURL,
		"charged":    true,
		"apiSource":  "apizone",
	})
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

func keySuffix(key string) string {
	key = strings.TrimSpace(key)
	if len(key) <= 4 {
		return key
	}
	return key[len(key)-4:]
}
