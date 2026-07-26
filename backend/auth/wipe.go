package auth

import (
	"context"
	"log"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// WipePartnerRelatedData removes service apps, wallet txs, and wallet row for a user.
func WipePartnerRelatedData(userId string) {
	if userId == "" {
		return
	}

	appsOut, scanErr := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName:        aws.String("ServiceApplications"),
		FilterExpression: aws.String("retailerId = :rid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":rid": &types.AttributeValueMemberS{Value: userId},
		},
	})
	if scanErr != nil {
		log.Printf("WipePartnerRelatedData scan apps failed for %s: %v", userId, scanErr)
	} else {
		for _, item := range appsOut.Items {
			pk, okPK := item["PK"].(*types.AttributeValueMemberS)
			sk, okSK := item["SK"].(*types.AttributeValueMemberS)
			if !okPK || !okSK {
				continue
			}
			_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
				TableName: aws.String("ServiceApplications"),
				Key: map[string]types.AttributeValue{
					"PK": pk,
					"SK": sk,
				},
			})
		}
	}

	txOut, txErr := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("WalletTransactions"),
		KeyConditionExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
		},
	})
	if txErr != nil {
		log.Printf("WipePartnerRelatedData query txs failed for %s: %v", userId, txErr)
	} else {
		for _, item := range txOut.Items {
			sk, ok := item["SK"].(*types.AttributeValueMemberS)
			if !ok {
				continue
			}
			_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
				TableName: aws.String("WalletTransactions"),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
					"SK": sk,
				},
			})
		}
	}

	_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
	})
}

// DeletePartnerAccount removes Users + role profile + related data.
func DeletePartnerAccount(userId, role string) {
	if userId == "" {
		return
	}
	WipePartnerRelatedData(userId)

	_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if role == "retailer" || role == "" {
		_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
			TableName: aws.String("Retailers"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "RETAILER#" + userId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
		})
	}
	if role == "distributor" || role == "" {
		_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
			TableName: aws.String("Distributors"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "DISTRIBUTOR#" + userId},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
		})
	}
}

// ZeroUserWallet sets wallet balance to 0 and clears wallet transactions.
func ZeroUserWallet(userId string) {
	if userId == "" {
		return
	}

	txOut, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("WalletTransactions"),
		KeyConditionExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
		},
	})
	if err == nil {
		for _, item := range txOut.Items {
			sk, ok := item["SK"].(*types.AttributeValueMemberS)
			if !ok {
				continue
			}
			_, _ = db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
				TableName: aws.String("WalletTransactions"),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: "WALLET#" + userId},
					"SK": sk,
				},
			})
		}
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Wallets"),
		Item: map[string]types.AttributeValue{
			"PK":           &types.AttributeValueMemberS{Value: "WALLET#" + userId},
			"SK":           &types.AttributeValueMemberS{Value: "TYPE#Main"},
			"userId":       &types.AttributeValueMemberS{Value: userId},
			"balance":      &types.AttributeValueMemberN{Value: "0"},
			"totalCredits": &types.AttributeValueMemberN{Value: "0"},
			"totalDebits":  &types.AttributeValueMemberN{Value: "0"},
		},
	})
	if err != nil {
		log.Printf("ZeroUserWallet wallets put %s: %v", userId, err)
	}

	_, err = db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression: aws.String("SET walletBalance = :z"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":z": &types.AttributeValueMemberN{Value: "0"},
		},
	})
	if err != nil {
		log.Printf("ZeroUserWallet users update %s: %v", userId, err)
	}
}
