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
	TodayPayment       float64            `json:"todayPayment"`
	TodayTopups        float64            `json:"todayTopups"`
	AdminWalletBalance float64            `json:"adminWalletBalance"`
	Pending            int                `json:"pending"`
	Approved           int                `json:"approved"`
	Projected          float64            `json:"projected"`
	Resubmit           int                `json:"resubmit"`
	InProcess          int                `json:"inProcess"`
	Rejected           int                `json:"rejected"`
	Customers          int                `json:"customers"`
	Retailers          int                `json:"retailers"`
	Distributors       int                `json:"distributors"`
	TotalProfit        float64            `json:"totalProfit"`
	ProfitByDate       map[string]float64 `json:"profitByDate"`
	ProfitByService    map[string]float64 `json:"profitByService"`
}

func istToday() (loc *time.Location, todayStr string) {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		loc = time.FixedZone("IST", 5*3600+30*60)
	}
	return loc, time.Now().In(loc).Format("2006-01-02")
}

func dateKeyInLoc(raw string, loc *time.Location) string {
	if raw == "" {
		return ""
	}
	if t, err := time.Parse(time.RFC3339, raw); err == nil {
		return t.In(loc).Format("2006-01-02")
	}
	if len(raw) >= 10 {
		return raw[:10]
	}
	return ""
}

func GetDashboardStats(c *gin.Context) {
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
	loc, todayStr := istToday()

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
			if parsed, err := strconv.ParseFloat(val.Value, 64); err == nil {
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
			// NOTE: Today Payment is NOT service cost — see partner recharges below.

			officialCost := dsMap[serviceId]
			if officialCost == 0 {
				officialCost = dsMap[serviceName]
			}
			profit := cost - officialCost
			stats.TotalProfit += profit

			dateKey := "Unknown"
			if dk := dateKeyInLoc(createdDate, loc); dk != "" {
				dateKey = dk
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

	// Today Payment = today's partner (retailer/distributor) recharges credited to admin wallet.
	// Does NOT include admin→partner transfers or service application amounts.
	outTx, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("WalletTransactions"),
	})
	if err == nil {
		for _, item := range outTx.Items {
			txType := ""
			if val, ok := item["type"].(*types.AttributeValueMemberS); ok {
				txType = val.Value
			}
			if txType != "credit" {
				continue
			}

			ref := ""
			if val, ok := item["reference"].(*types.AttributeValueMemberS); ok {
				ref = val.Value
			}
			if ref != "PARTNER_RECHARGE" {
				continue
			}

			status := ""
			if val, ok := item["status"].(*types.AttributeValueMemberS); ok {
				status = val.Value
			}
			if status != "" && status != "Success" {
				continue
			}

			createdAt := ""
			if val, ok := item["createdAt"].(*types.AttributeValueMemberS); ok {
				createdAt = val.Value
			}
			if dateKeyInLoc(createdAt, loc) != todayStr {
				continue
			}

			amount := 0.0
			if val, ok := item["amount"].(*types.AttributeValueMemberN); ok {
				amount, _ = strconv.ParseFloat(val.Value, 64)
			} else if val, ok := item["amount"].(*types.AttributeValueMemberS); ok {
				amount, _ = strconv.ParseFloat(val.Value, 64)
			}
			if amount <= 0 {
				continue
			}

			stats.TodayPayment += amount
			stats.TodayTopups += amount
		}
	}

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

	stats.AdminWalletBalance = GetAdminWalletBalance()

	c.JSON(http.StatusOK, stats)
}
