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

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// ResolveMobile picks APIZONE account mobile: env first, then user profile.
func ResolveMobile(userId string) string {
	if m := strings.TrimSpace(os.Getenv("APIZONE_MOBILE")); m != "" {
		return digitsOnly(m)
	}
	userId = strings.TrimSpace(userId)
	if userId == "" {
		return ""
	}
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if err != nil || out.Item == nil {
		return ""
	}
	for _, field := range []string{"mobile", "phone", "Mobile", "Phone"} {
		if v, ok := out.Item[field].(*types.AttributeValueMemberS); ok {
			d := digitsOnly(v.Value)
			if len(d) >= 10 {
				return d
			}
		}
	}
	return ""
}

// FetchLiveBalance returns merchant wallet balance from APIZONE.
func FetchLiveBalance(mobile string) (float64, error) {
	key := apiKey()
	if key == "" {
		return 0, fmt.Errorf("APIZONE_API_KEY not configured")
	}
	mobile = digitsOnly(strings.TrimSpace(mobile))
	if mobile == "" {
		mobile = digitsOnly(strings.TrimSpace(os.Getenv("APIZONE_MOBILE")))
	}
	if len(mobile) < 10 {
		return 0, fmt.Errorf("APIZONE mobile missing (set APIZONE_MOBILE)")
	}
	if len(mobile) > 10 {
		mobile = mobile[len(mobile)-10:]
	}

	bases := []string{
		"https://live.kycapizone.in/api/",
		"https://kycapizone.in/api/",
	}
	client := &http.Client{Timeout: 25 * time.Second}
	var lastErr error
	for _, base := range bases {
		endpoint := base + "v2/balance/fetch.php"
		q := url.Values{}
		q.Set("api_key", key)
		q.Set("mobile", mobile)
		req, err := http.NewRequest("GET", endpoint+"?"+q.Encode(), nil)
		if err != nil {
			lastErr = err
			continue
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ThuruvanESeva/1.0)")
		req.Header.Set("Accept", "application/json")
		resp, err := client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var parsed map[string]interface{}
		if err := json.Unmarshal(body, &parsed); err != nil {
			lastErr = fmt.Errorf("non-json balance response")
			continue
		}

		ok := false
		switch v := parsed["status"].(type) {
		case bool:
			ok = v
		case string:
			ok = strings.EqualFold(strings.TrimSuffix(v, ","), "true") || v == "1"
		}
		code := fmt.Sprintf("%v", parsed["response_code"])
		if code == "100" || code == "100.0" {
			ok = true
		}
		if !ok {
			msg := strings.TrimSpace(fmt.Sprintf("%v", parsed["message"]))
			if msg == "" || msg == "<nil>" {
				msg = "APIZONE balance fetch failed"
			}
			lastErr = fmt.Errorf("%s", msg)
			continue
		}

		bal := extractBalance(parsed)
		if bal < 0 {
			lastErr = fmt.Errorf("balance not found in APIZONE response")
			continue
		}
		return bal, nil
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("APIZONE balance unreachable")
	}
	return 0, lastErr
}

func extractBalance(parsed map[string]interface{}) float64 {
	candidates := []interface{}{}
	if result, ok := parsed["result"].(map[string]interface{}); ok {
		candidates = append(candidates, result["balance"], result["wallet_balance"], result["api_balance"])
	}
	candidates = append(candidates, parsed["balance"], parsed["wallet_balance"])
	for _, c := range candidates {
		switch v := c.(type) {
		case float64:
			return v
		case string:
			f, err := strconv.ParseFloat(strings.TrimSpace(v), 64)
			if err == nil {
				return f
			}
		case json.Number:
			f, err := v.Float64()
			if err == nil {
				return f
			}
		}
	}
	return -1
}

func digitsOnly(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func LogBalanceSyncError(err error) {
	if err == nil {
		return
	}
	log.Printf("[APIZONE] balance sync: %v", err)
}
