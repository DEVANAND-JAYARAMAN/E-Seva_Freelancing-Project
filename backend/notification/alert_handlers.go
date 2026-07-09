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

// Global Alerts

func GetGlobalAlerts(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("GlobalAlerts"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alerts"})
		return
	}

	var alerts []models.GlobalAlert
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &alerts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse alerts"})
		return
	}

	if alerts == nil {
		alerts = []models.GlobalAlert{}
	}

	c.JSON(http.StatusOK, alerts)
}

func CreateGlobalAlert(c *gin.Context) {
	var alert models.GlobalAlert
	if err := c.ShouldBindJSON(&alert); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	alert.ID = "ALERT" + time.Now().Format("20060102150405")
	alert.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	if alert.Status == "" {
		alert.Status = "Inactive"
	}

	item, err := attributevalue.MarshalMap(alert)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal alert"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("GlobalAlerts"),
		Item:      item,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save alert"})
		return
	}

	c.JSON(http.StatusCreated, alert)
}

func ToggleGlobalAlert(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("GlobalAlerts"),
		Key: map[string]types.AttributeValue{
			"ID": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET #status = :s"),
		ExpressionAttributeNames: map[string]string{
			"#status": "Status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":s": &types.AttributeValueMemberS{Value: req.Status},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update alert status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Alert status updated"})
}

func DeleteGlobalAlert(c *gin.Context) {
	id := c.Param("id")

	_, err := db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("GlobalAlerts"),
		Key: map[string]types.AttributeValue{
			"ID": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete alert"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Alert deleted"})
}

// Service Messages

func GetServiceMessages(c *gin.Context) {
	serviceId := c.Param("serviceId")

	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("ServiceMessages"),
		IndexName:              aws.String("GSI-ServiceID"),
		KeyConditionExpression: aws.String("ServiceID = :sid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":sid": &types.AttributeValueMemberS{Value: serviceId},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch service messages"})
		return
	}

	var messages []models.ServiceMessage
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &messages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse messages"})
		return
	}

	if messages == nil {
		messages = []models.ServiceMessage{}
	}

	c.JSON(http.StatusOK, messages)
}

func CreateServiceMessage(c *gin.Context) {
	var msg models.ServiceMessage
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg.ID = "MSG" + time.Now().Format("20060102150405")
	msg.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	if msg.Status == "" {
		msg.Status = "Inactive"
	}

	item, err := attributevalue.MarshalMap(msg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal message"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("ServiceMessages"),
		Item:      item,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
		return
	}

	c.JSON(http.StatusCreated, msg)
}

func ToggleServiceMessage(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DynamoClient.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("ServiceMessages"),
		Key: map[string]types.AttributeValue{
			"ID": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET #status = :s"),
		ExpressionAttributeNames: map[string]string{
			"#status": "Status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":s": &types.AttributeValueMemberS{Value: req.Status},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update message status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message status updated"})
}

func DeleteServiceMessage(c *gin.Context) {
	id := c.Param("id")

	_, err := db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("ServiceMessages"),
		Key: map[string]types.AttributeValue{
			"ID": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted"})
}
