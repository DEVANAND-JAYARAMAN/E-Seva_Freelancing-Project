package admin

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	TodayPayment float64 `json:"todayPayment"`
	Pending      int     `json:"pending"`
	InProcess    int     `json:"inProcess"`
	Approved     int     `json:"approved"`
	Resubmit     int     `json:"resubmit"`
	Customers    int     `json:"customers"`
	Retailers    int     `json:"retailers"`
	Distributors int     `json:"distributors"`
}

func GetDashboardStats(c *gin.Context) {
	// Simple broad scan for demo/prototype purposes.
	// In production, we'd use indexes or aggregated counters.
	outApps, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch apps"})
		return
	}

	stats := DashboardStats{}
	todayStr := time.Now().Format("2006-01-02")

	for _, item := range outApps.Items {
		status := ""
		if val, ok := item["status"].(*types.AttributeValueMemberS); ok {
			status = val.Value
		}
		
		createdDate := ""
		if val, ok := item["createdDate"].(*types.AttributeValueMemberS); ok {
			createdDate = val.Value
		}
		
		cost := 0.0
		if val, ok := item["cost"].(*types.AttributeValueMemberN); ok {
			importStr := val.Value
			if parsed, err := strconv.ParseFloat(importStr, 64); err == nil {
				cost = parsed
			}
		}

		if status == "Pending" {
			stats.Pending++
		} else if status == "Processing" || status == "Inprocess" || status == "In Process" {
			stats.InProcess++
		} else if status == "Approved" || status == "Completed" {
			stats.Approved++
			// if created/updated today, add to todayPayment
			if len(createdDate) >= 10 && createdDate[:10] == todayStr {
				stats.TodayPayment += cost
			}
		} else if status == "Resubmit" {
			stats.Resubmit++
		}
	}

	// Fetch users to count retailers, distributors, customers
	outUsers, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
	})
	if err == nil {
		for _, item := range outUsers.Items {
			role := ""
			if val, ok := item["role"].(*types.AttributeValueMemberS); ok {
				role = val.Value
			}
			if role == "retailer" {
				stats.Retailers++
			} else if role == "distributor" {
				stats.Distributors++
			} else if role == "customer" {
				stats.Customers++
			}
		}
	}

	c.JSON(http.StatusOK, stats)
}
