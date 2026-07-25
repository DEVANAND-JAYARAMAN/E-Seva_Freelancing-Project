package admin

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	adminIDOnce sync.Once
	cachedAdmin string
)

// ResolveAdminUserId finds the real admin userId (USR...).
// Prefers ADMIN_USER_ID env, else first Users row with role=admin.
func ResolveAdminUserId() string {
	adminIDOnce.Do(func() {
		if envID := os.Getenv("ADMIN_USER_ID"); envID != "" {
			cachedAdmin = envID
			return
		}
		out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
			TableName:        aws.String("Users"),
			FilterExpression: aws.String("#r = :role"),
			ExpressionAttributeNames: map[string]string{
				"#r": "role",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":role": &types.AttributeValueMemberS{Value: "admin"},
			},
		})
		if err != nil {
			log.Printf("ResolveAdminUserId scan failed: %v", err)
			return
		}
		for _, item := range out.Items {
			if v, ok := item["userId"].(*types.AttributeValueMemberS); ok && v.Value != "" {
				cachedAdmin = v.Value
				return
			}
			if v, ok := item["UserId"].(*types.AttributeValueMemberS); ok && v.Value != "" {
				cachedAdmin = v.Value
				return
			}
		}
	})
	return cachedAdmin
}

// CreditAdminFromPartnerRecharge mirrors retailer/distributor recharge into the admin wallet.
// Best-effort: partner credit should already have succeeded; errors are logged only.
func CreditAdminFromPartnerRecharge(amount float64, fromUserId, reference, description string) {
	if amount <= 0 {
		return
	}
	adminId := ResolveAdminUserId()
	if adminId == "" {
		log.Printf("CreditAdminFromPartnerRecharge: no admin userId found — skipped ₹%.2f from %s", amount, fromUserId)
		return
	}
	if fromUserId == adminId {
		return
	}

	now := time.Now().UTC()
	amt := strconv.FormatFloat(amount, 'f', 2, 64)
	ownerPK := "WALLET#" + adminId

	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: ownerPK},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
		UpdateExpression: aws.String("ADD balance :amt, totalCredits :amt SET updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt": &types.AttributeValueMemberN{Value: amt},
			":ts":  &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("CreditAdminFromPartnerRecharge wallet update failed: %v", err)
	}

	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + adminId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = if_not_exists(walletBalance, :zero) + :amt, updatedAt = :ts"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":amt":  &types.AttributeValueMemberN{Value: amt},
			":zero": &types.AttributeValueMemberN{Value: "0"},
			":ts":   &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})
	if err != nil {
		log.Printf("CreditAdminFromPartnerRecharge user balance failed: %v", err)
	}

	if description == "" {
		description = fmt.Sprintf("Partner wallet recharge from %s", fromUserId)
	}
	if reference == "" {
		reference = "PARTNER_RECHARGE"
	}

	txId := "TX#" + now.Format("20060102150405") + "#PR#" + fromUserId
			txRecord := map[string]interface{}{
		"PK":          ownerPK,
		"SK":          txId,
		"id":          txId,
		"date":        now.Format("01/02/2006, 03:04 PM"),
		"type":        "credit",
		"description": description,
		"amount":      amount,
		"reference":   "PARTNER_RECHARGE",
		"partnerRef":  reference,
		"status":      "Success",
		"walletType":  "Main",
		"fromUserId":  fromUserId,
		"createdAt":   now.Format(time.RFC3339),
	}
	item, _ := attributevalue.MarshalMap(txRecord)
	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("WalletTransactions"),
		Item:      item,
	})
	if err != nil {
		log.Printf("CreditAdminFromPartnerRecharge tx write failed: %v", err)
	}

	log.Printf("Credited admin %s with ₹%.2f from partner recharge %s", adminId, amount, fromUserId)
}

// GetAdminWalletBalance returns the admin Users.walletBalance (0 if unknown).
func GetAdminWalletBalance() float64 {
	adminId := ResolveAdminUserId()
	if adminId == "" {
		return 0
	}
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + adminId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if err != nil || out.Item == nil {
		return 0
	}
	if v, ok := out.Item["walletBalance"].(*types.AttributeValueMemberN); ok {
		bal, _ := strconv.ParseFloat(v.Value, 64)
		return bal
	}
	return 0
}
