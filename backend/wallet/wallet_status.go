package wallet

import (
	"context"
	"net/http"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

func CheckGatewayRechargeStatus(c *gin.Context) {
	orderID := c.Param("order_id")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Order ID is required"})
		return
	}

	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName:        aws.String("WalletTransactions"),
		FilterExpression: aws.String("id = :oid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":oid": &types.AttributeValueMemberS{Value: orderID},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check status"})
		return
	}

	if len(out.Items) > 0 {
		statusAttr := out.Items[0]["status"]
		if s, ok := statusAttr.(*types.AttributeValueMemberS); ok {
			c.JSON(http.StatusOK, gin.H{"status": s.Value})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "Pending"})
}
