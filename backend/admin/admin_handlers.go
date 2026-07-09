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
	Approved     int     `json:"approved"`
	Projected    float64 `json:"projected"`
	Resubmit     int     `json:"resubmit"`
	InProcess    int     `json:"inProcess"`
	Rejected     int     `json:"rejected"`
	Customers    int     `json:"customers"`
	Retailers    int     `json:"retailers"`
	Distributors int     `json:"distributors"`
	TotalProfit  float64 `json:"totalProfit"`
	ProfitByDate map[string]float64 `json:"profitByDate"`
	ProfitByService map[string]float64 `json:"profitByService"`
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

	stats := DashboardStats{
		ProfitByDate:    make(map[string]float64),
		ProfitByService: make(map[string]float64),
	}
	todayStr := time.Now().Format("2006-01-02")

	// Fetch dynamic services for profit calculation
	dsOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("DynamicServices"),
	})
	dsMap := make(map[string]float64)
	if err == nil {
		for _, item := range dsOut.Items {
			idVal, okID := item["id"].(*types.AttributeValueMemberS)
			nameVal, okName := item["name"].(*types.AttributeValueMemberS)
			costVal, okCost := item["officialCost"].(*types.AttributeValueMemberN)
			if okCost {
				cost, _ := strconv.ParseFloat(costVal.Value, 64)
				if okID {
					dsMap[idVal.Value] = cost
				}
				if okName {
					dsMap[nameVal.Value] = cost
				}
			}
		}
	}

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

		serviceId := ""
		if val, ok := item["serviceId"].(*types.AttributeValueMemberS); ok {
			serviceId = val.Value
		}
		serviceName := ""
		if val, ok := item["serviceName"].(*types.AttributeValueMemberS); ok {
			serviceName = val.Value
		}

		if status == "Pending" {
			stats.Pending++
			stats.Projected += cost
		} else if status == "Approved" || status == "Completed" {
			stats.Approved++
			// if created/updated today, add to todayPayment
			if len(createdDate) >= 10 && createdDate[:10] == todayStr {
				stats.TodayPayment += cost
			}
			
			// Calculate profit
			officialCost := dsMap[serviceId]
			if officialCost == 0 {
				officialCost = dsMap[serviceName]
			}
			profit := cost - officialCost
			stats.TotalProfit += profit
			
			dateKey := "Unknown"
			if len(createdDate) >= 10 {
				dateKey = createdDate[:10]
			}
			stats.ProfitByDate[dateKey] += profit
			
			svcKey := serviceName
			if svcKey == "" {
				svcKey = "Unknown"
			}
			stats.ProfitByService[svcKey] += profit
			
		} else if status == "Resubmit" {
			stats.Resubmit++
		} else if status == "In Process" || status == "InProcess" || status == "Processing" || status == "Process" {
			stats.InProcess++
		} else if status == "Rejected" {
			stats.Rejected++
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
