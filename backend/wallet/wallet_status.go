package wallet

import (
	"context"
	"net/http"
	"strings"

	"eservice-backend/auth"
	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

func CheckGatewayRechargeStatus(c *gin.Context) {
	orderID := strings.TrimSpace(c.Param("order_id"))
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Order ID is required"})
		return
	}

	resolve := func(id string) (map[string]types.AttributeValue, error) {
		out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
			TableName: aws.String("WalletTransactions"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "ORDER#" + id},
				"SK": &types.AttributeValueMemberS{Value: "META"},
			},
		})
		if err != nil {
			return nil, err
		}
		if out.Item == nil {
			return nil, nil
		}
		// Follow local alias → gateway order
		if alias, ok := out.Item["aliasOf"].(*types.AttributeValueMemberS); ok && alias.Value != "" {
			out2, err2 := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
				TableName: aws.String("WalletTransactions"),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: "ORDER#" + alias.Value},
					"SK": &types.AttributeValueMemberS{Value: "META"},
				},
			})
			if err2 == nil && out2.Item != nil {
				return out2.Item, nil
			}
		}
		return out.Item, nil
	}

	item, err := resolve(orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check status"})
		return
	}
	if item == nil {
		c.JSON(http.StatusOK, gin.H{"status": "Pending"})
		return
	}

	// Only the order owner (or admin) may poll
	if uid, ok := item["userId"].(*types.AttributeValueMemberS); ok {
		if !auth.IsAdmin(c) && uid.Value != auth.UserID(c) {
			c.JSON(http.StatusForbidden, gin.H{"message": "Not allowed"})
			return
		}
	}

	status := "Pending"
	if s, ok := item["status"].(*types.AttributeValueMemberS); ok && s.Value != "" {
		status = s.Value
	}
	c.JSON(http.StatusOK, gin.H{"status": status})
}
