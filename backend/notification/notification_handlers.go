package notification

import (
	"context"
	"net/http"
	"time"

	"eservice-backend/db"
	"eservice-backend/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

func generateNotifId() string {
	return "NOTIF" + time.Now().Format("20060102150405")
}

func CreateNotification(c *gin.Context) {
	var req models.Notification
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.UserId == "" {
		req.UserId = "ALL" // Default broadcast
	}

	now := time.Now().UTC().Format(time.RFC3339)
	req.Id = generateNotifId()
	req.PK = "USER#" + req.UserId
	req.SK = "NOTIF#" + now + "#" + req.Id
	req.CreatedAt = now
	req.IsRead = false

	item, err := attributevalue.MarshalMap(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal data"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      item,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusCreated, req)
}

func GetNotifications(c *gin.Context) {
	userId := c.Query("userId")
	if userId == "" {
		userId = "ALL"
	}

	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName: aws.String("Notifications"),
		KeyConditionExpression: aws.String("PK = :pk AND begins_with(SK, :sk)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "USER#" + userId},
			":sk": &types.AttributeValueMemberS{Value: "NOTIF#"},
		},
		ScanIndexForward: aws.Bool(false), // Descending order
	})
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	var notifications []models.Notification
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &notifications); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse data"})
		return
	}
	
	if notifications == nil {
		notifications = []models.Notification{}
	}

	c.JSON(http.StatusOK, notifications)
}

func MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	userId := c.Query("userId")
	if userId == "" {
		userId = "ALL"
	}
	createdAt := c.Query("createdAt") // SK needs timestamp

	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("Notifications"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "NOTIF#" + createdAt + "#" + id},
		},
		UpdateExpression: aws.String("SET isRead = :r"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":r": &types.AttributeValueMemberBOOL{Value: true},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}
