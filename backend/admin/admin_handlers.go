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

// GetAdminWalletTransactions returns ledger rows for the resolved admin Main Wallet.
func GetAdminWalletTransactions(c *gin.Context) {
	adminId := ResolveAdminUserId()
	if adminId == "" {
		c.JSON(http.StatusOK, []any{})
		return
	}

	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("WalletTransactions"),
		KeyConditionExpression: aws.String("PK = :pk"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk": &types.AttributeValueMemberS{Value: "WALLET#" + adminId},
		},
		ScanIndexForward: aws.Bool(false),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admin transactions"})
		return
	}

	type txOut struct {
		Id          string  `json:"id"`
		Date        string  `json:"date"`
		Type        string  `json:"type"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
		Reference   string  `json:"reference"`
		Status      string  `json:"status"`
		WalletType  string  `json:"walletType"`
		CreatedAt   string  `json:"createdAt"`
	}

	list := make([]txOut, 0, len(out.Items))
	for _, item := range out.Items {
		sk := ""
		if v, ok := item["SK"].(*types.AttributeValueMemberS); ok {
			sk = v.Value
		}
		// Skip non-ledger rows
		if len(sk) < 3 || sk[:3] != "TX#" {
			continue
		}

		row := txOut{WalletType: "Main", Status: "Success"}
		if v, ok := item["id"].(*types.AttributeValueMemberS); ok {
			row.Id = v.Value
		} else {
			row.Id = sk
		}
		if v, ok := item["date"].(*types.AttributeValueMemberS); ok {
			row.Date = v.Value
		}
		if v, ok := item["type"].(*types.AttributeValueMemberS); ok {
			row.Type = v.Value
		}
		if v, ok := item["description"].(*types.AttributeValueMemberS); ok {
			row.Description = v.Value
		}
		if v, ok := item["reference"].(*types.AttributeValueMemberS); ok {
			row.Reference = v.Value
		}
		if v, ok := item["status"].(*types.AttributeValueMemberS); ok {
			row.Status = v.Value
		}
		if v, ok := item["walletType"].(*types.AttributeValueMemberS); ok && v.Value != "" {
			row.WalletType = v.Value
		}
		if v, ok := item["createdAt"].(*types.AttributeValueMemberS); ok {
			row.CreatedAt = v.Value
			if row.Date == "" {
				row.Date = v.Value
			}
		}
		if v, ok := item["amount"].(*types.AttributeValueMemberN); ok {
			row.Amount, _ = strconv.ParseFloat(v.Value, 64)
		} else if v, ok := item["amount"].(*types.AttributeValueMemberS); ok {
			row.Amount, _ = strconv.ParseFloat(v.Value, 64)
		}
		list = append(list, row)
	}

	c.JSON(http.StatusOK, list)
}

// GetDailyPayments aggregates successful partner recharges by IST calendar day.
// Modelled after reference Daily Payments (onlinepayment) page.
func GetDailyPayments(c *gin.Context) {
	loc, todayStr := istToday()

	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("WalletTransactions"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}

	type dayAgg struct {
		Date         string  `json:"date"`         // YYYY-MM-DD
		DateLabel    string  `json:"dateLabel"`    // e.g. 25 Jul 2026
		NoOfPayments int     `json:"noOfPayments"`
		Amount       float64 `json:"amount"`
	}

	byDay := map[string]*dayAgg{}
	totalSuccess := 0
	totalAmount := 0.0
	todayAmount := 0.0

	for _, item := range out.Items {
		txType := ""
		if v, ok := item["type"].(*types.AttributeValueMemberS); ok {
			txType = v.Value
		}
		if txType != "credit" {
			continue
		}

		ref := ""
		if v, ok := item["reference"].(*types.AttributeValueMemberS); ok {
			ref = v.Value
		}
		// Partner recharges into admin wallet (success payments)
		if ref != "PARTNER_RECHARGE" {
			continue
		}

		status := ""
		if v, ok := item["status"].(*types.AttributeValueMemberS); ok {
			status = v.Value
		}
		if status != "" && status != "Success" {
			continue
		}

		createdAt := ""
		if v, ok := item["createdAt"].(*types.AttributeValueMemberS); ok {
			createdAt = v.Value
		}
		dayKey := dateKeyInLoc(createdAt, loc)
		if dayKey == "" {
			continue
		}

		amount := 0.0
		if v, ok := item["amount"].(*types.AttributeValueMemberN); ok {
			amount, _ = strconv.ParseFloat(v.Value, 64)
		} else if v, ok := item["amount"].(*types.AttributeValueMemberS); ok {
			amount, _ = strconv.ParseFloat(v.Value, 64)
		}
		if amount <= 0 {
			continue
		}

		agg, ok := byDay[dayKey]
		if !ok {
			label := dayKey
			if t, err := time.ParseInLocation("2006-01-02", dayKey, loc); err == nil {
				label = t.Format("02 Jan 2006")
			}
			agg = &dayAgg{Date: dayKey, DateLabel: label}
			byDay[dayKey] = agg
		}
		agg.NoOfPayments++
		agg.Amount += amount

		totalSuccess++
		totalAmount += amount
		if dayKey == todayStr {
			todayAmount += amount
		}
	}

	days := make([]dayAgg, 0, len(byDay))
	for _, v := range byDay {
		days = append(days, *v)
	}
	// Newest date first
	for i := 0; i < len(days); i++ {
		for j := i + 1; j < len(days); j++ {
			if days[j].Date > days[i].Date {
				days[i], days[j] = days[j], days[i]
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalSuccessPayments": totalSuccess,
		"totalAmount":          totalAmount,
		"todayAmount":          todayAmount,
		"days":                 days,
	})
}
