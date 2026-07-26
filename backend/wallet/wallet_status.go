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

	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("WalletTransactions"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "ORDER#" + orderID},
			"SK": &types.AttributeValueMemberS{Value: "META"},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check status"})
		return
	}
	if out.Item == nil {
		c.JSON(http.StatusOK, gin.H{"status": "Pending"})
		return
	}

	// Only the order owner (or admin) may poll
	if uid, ok := out.Item["userId"].(*types.AttributeValueMemberS); ok {
		if !auth.IsAdmin(c) && uid.Value != auth.UserID(c) {
			c.JSON(http.StatusForbidden, gin.H{"message": "Not allowed"})
			return
		}
	}

	status := "Pending"
	if s, ok := out.Item["status"].(*types.AttributeValueMemberS); ok && s.Value != "" {
		status = s.Value
	}
	c.JSON(http.StatusOK, gin.H{"status": status})
}
