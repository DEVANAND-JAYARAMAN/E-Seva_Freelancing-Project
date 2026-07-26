package admin

import (
	"context"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"eservice-backend/auth"
	"eservice-backend/db"
	"eservice-backend/models"
	"eservice-backend/timeutil"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type partnerServiceRow struct {
	ApplicationId    string  `json:"applicationId"`
	ServiceName      string  `json:"serviceName"`
	Status           string  `json:"status"`
	DebitAmount      float64 `json:"debitAmount"`
	CreditAmount     float64 `json:"creditAmount"`
	AvailableBalance float64 `json:"availableBalance"`
	CreatedDate      string  `json:"createdDate"`
	CreatedAtIST     string  `json:"createdAtIst"`
	DateTime         string  `json:"dateTime"`
}

type partnerOverviewRow struct {
	UserId         string              `json:"userId"`
	Name           string              `json:"name"`
	Role           string              `json:"role"`
	Mobile         string              `json:"mobile"`
	Email          string              `json:"email"`
	Status         string              `json:"status"`
	WalletBalance  float64             `json:"walletBalance"`
	ServiceCount   int                 `json:"serviceCount"`
	TotalDebited   float64             `json:"totalDebited"`
	ActiveServices []partnerServiceRow `json:"activeServices"`
	RecentServices []partnerServiceRow `json:"recentServices"`
	AmountDetails  []partnerServiceRow `json:"amountDetails"`
}

type rawWalletTx struct {
	id          string
	createdAt   string
	txType      string
	amount      float64
	status      string
	reference   string
	description string
	title       string
}

// GetPartnersOverview returns retailers + distributors with wallet balance
// and per-service amount details (Debit / Credit / Available Balance).
func GetPartnersOverview(c *gin.Context) {
	usersOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName:        aws.String("Users"),
		FilterExpression: aws.String("#r = :ret OR #r = :dis"),
		ExpressionAttributeNames: map[string]string{
			"#r": "role",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":ret": &types.AttributeValueMemberS{Value: "retailer"},
			":dis": &types.AttributeValueMemberS{Value: "distributor"},
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partners"})
		return
	}

	var users []models.User
	if err := attributevalue.UnmarshalListOfMaps(usersOut.Items, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode partners"})
		return
	}
	auth.HydrateWalletBalances(users)

	appsOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch services"})
		return
	}

	var apps []models.ServiceApplication
	_ = attributevalue.UnmarshalListOfMaps(appsOut.Items, &apps)

	// serviceId / appId → name + status (for enriching wallet txs)
	serviceMeta := map[string]models.ServiceApplication{}
	appsByPartner := map[string][]models.ServiceApplication{}
	for _, app := range apps {
		pid := strings.TrimSpace(app.RetailerId)
		if pid == "" {
			continue
		}
		appsByPartner[pid] = append(appsByPartner[pid], app)
		if app.ServiceId != "" {
			serviceMeta[app.ServiceId] = app
		}
		if app.Id != "" {
			serviceMeta[app.Id] = app
		}
	}

	txOut, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("WalletTransactions"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch wallet amounts"})
		return
	}

	txsByPartner := map[string][]rawWalletTx{}
	for _, item := range txOut.Items {
		pk := ""
		if v, ok := item["PK"].(*types.AttributeValueMemberS); ok {
			pk = v.Value
		}
		if !strings.HasPrefix(pk, "WALLET#") {
			continue
		}
		uid := strings.TrimPrefix(pk, "WALLET#")
		sk := ""
		if v, ok := item["SK"].(*types.AttributeValueMemberS); ok {
			sk = v.Value
		}
		if len(sk) < 3 || sk[:3] != "TX#" {
			continue
		}

		tx := rawWalletTx{status: "Success"}
		if v, ok := item["id"].(*types.AttributeValueMemberS); ok {
			tx.id = v.Value
		} else {
			tx.id = sk
		}
		if v, ok := item["createdAt"].(*types.AttributeValueMemberS); ok {
			tx.createdAt = v.Value
		}
		if v, ok := item["type"].(*types.AttributeValueMemberS); ok {
			tx.txType = strings.ToLower(v.Value)
		}
		if v, ok := item["status"].(*types.AttributeValueMemberS); ok && v.Value != "" {
			tx.status = v.Value
		}
		if v, ok := item["reference"].(*types.AttributeValueMemberS); ok {
			tx.reference = v.Value
		}
		if v, ok := item["description"].(*types.AttributeValueMemberS); ok {
			tx.description = v.Value
		}
		if v, ok := item["title"].(*types.AttributeValueMemberS); ok {
			tx.title = v.Value
		}
		if v, ok := item["amount"].(*types.AttributeValueMemberN); ok {
			tx.amount, _ = strconv.ParseFloat(v.Value, 64)
		} else if v, ok := item["amount"].(*types.AttributeValueMemberS); ok {
			tx.amount, _ = strconv.ParseFloat(v.Value, 64)
		}
		txsByPartner[uid] = append(txsByPartner[uid], tx)
	}

	partners := make([]partnerOverviewRow, 0, len(users))
	for _, u := range users {
		uid := u.UserId
		if uid == "" {
			uid = strings.TrimPrefix(u.PK, "USER#")
		}

		partnerApps := appsByPartner[uid]
		sort.Slice(partnerApps, func(i, j int) bool {
			return partnerApps[i].CreatedDate > partnerApps[j].CreatedDate
		})

		// Build full ledger (newest first) with running available balance
		allTx := append([]rawWalletTx{}, txsByPartner[uid]...)
		sort.Slice(allTx, func(i, j int) bool {
			return allTx[i].createdAt > allTx[j].createdAt
		})
		bal := u.WalletBalance
		type balTx struct {
			rawWalletTx
			available float64
			debit     float64
			credit    float64
		}
		ledger := make([]balTx, 0, len(allTx))
		for _, t := range allTx {
			row := balTx{rawWalletTx: t, available: bal}
			isCredit := strings.EqualFold(t.txType, "credit")
			if isCredit {
				row.credit = t.amount
				bal -= t.amount
			} else {
				row.debit = t.amount
				bal += t.amount
			}
			ledger = append(ledger, row)
		}

		// Per-service amount details: prefer wallet service debits/refunds with balance
		amountDetails := make([]partnerServiceRow, 0)
		totalDebited := 0.0
		for _, t := range ledger {
			if !isServiceWalletTx(t.rawWalletTx) {
				continue
			}
			name, status := resolveServiceMeta(t.rawWalletTx, serviceMeta)
			ist := timeutil.FormatRFC3339AsIST(t.createdAt)
			row := partnerServiceRow{
				ApplicationId:    t.id,
				ServiceName:      name,
				Status:           status,
				DebitAmount:      t.debit,
				CreditAmount:     t.credit,
				AvailableBalance: t.available,
				CreatedDate:      t.createdAt,
				CreatedAtIST:     ist,
				DateTime:         ist,
			}
			if t.status != "" && !strings.EqualFold(t.status, "Success") {
				row.Status = t.status
			}
			if row.Status == "" {
				row.Status = t.status
			}
			amountDetails = append(amountDetails, row)
			totalDebited += t.debit
		}

		// Fallback: if no wallet service txs yet, use applications with debit only
		if len(amountDetails) == 0 && len(partnerApps) > 0 {
			runBal := u.WalletBalance
			// Walk newest→oldest: after newest cut, balance ≈ current; then undo cuts going back
			for _, app := range partnerApps {
				ist := timeutil.FormatRFC3339AsIST(app.CreatedDate)
				name := app.ServiceName
				if name == "" {
					name = app.ServiceId
				}
				if name == "" {
					name = "Service"
				}
				amountDetails = append(amountDetails, partnerServiceRow{
					ApplicationId:    app.Id,
					ServiceName:      name,
					Status:           app.Status,
					DebitAmount:      app.Cost,
					CreditAmount:     0,
					AvailableBalance: runBal,
					CreatedDate:      app.CreatedDate,
					CreatedAtIST:     ist,
					DateTime:         ist,
				})
				totalDebited += app.Cost
				runBal += app.Cost // undo debit when going older
			}
		}

		active := make([]partnerServiceRow, 0)
		recent := make([]partnerServiceRow, 0)
		for _, app := range partnerApps {
			ist := timeutil.FormatRFC3339AsIST(app.CreatedDate)
			name := app.ServiceName
			if name == "" {
				name = app.ServiceId
			}
			if name == "" {
				name = "Service"
			}
			row := partnerServiceRow{
				ApplicationId: app.Id,
				ServiceName:   name,
				Status:        app.Status,
				DebitAmount:   app.Cost,
				CreatedDate:   app.CreatedDate,
				CreatedAtIST:  ist,
				DateTime:      ist,
			}
			// Attach matching available balance from amountDetails when possible
			for _, d := range amountDetails {
				if almostEqual(d.DebitAmount, app.Cost) &&
					(strings.Contains(strings.ToLower(d.ServiceName), strings.ToLower(name)) ||
						d.ServiceName == name ||
						strings.EqualFold(d.ApplicationId, app.Id)) {
					row.AvailableBalance = d.AvailableBalance
					row.CreditAmount = d.CreditAmount
					break
				}
			}
			st := strings.ToLower(app.Status)
			if st == "pending" || st == "process" || st == "inprocess" || st == "resubmit" {
				active = append(active, row)
			}
			recent = append(recent, row)
		}
		if len(recent) > 8 {
			recent = recent[:8]
		}
		if len(amountDetails) > 20 {
			amountDetails = amountDetails[:20]
		}

		partners = append(partners, partnerOverviewRow{
			UserId:         uid,
			Name:           u.FullName,
			Role:           strings.ToLower(u.Role),
			Mobile:         u.Mobile,
			Email:          u.Email,
			Status:         u.Status,
			WalletBalance:  u.WalletBalance,
			ServiceCount:   len(partnerApps),
			TotalDebited:   totalDebited,
			ActiveServices: active,
			RecentServices: recent,
			AmountDetails:  amountDetails,
		})
	}

	sort.Slice(partners, func(i, j int) bool {
		if partners[i].Role != partners[j].Role {
			return partners[i].Role < partners[j].Role
		}
		return partners[i].Name < partners[j].Name
	})

	c.JSON(http.StatusOK, gin.H{
		"partners":         partners,
		"retailerCount":    countRole(partners, "retailer"),
		"distributorCount": countRole(partners, "distributor"),
	})
}

func isServiceWalletTx(t rawWalletTx) bool {
	ref := strings.ToLower(t.reference)
	desc := strings.ToLower(t.description)
	title := strings.ToLower(t.title)
	if strings.Contains(desc, "service") || strings.Contains(title, "service") {
		return true
	}
	if strings.Contains(ref, "refund") {
		return true
	}
	// Catalog service ids / app refs (not recharge UTR / ADMIN)
	if ref == "" || ref == "admin" || ref == "admin_dummy" || ref == "admin_transfer" || ref == "partner_recharge" {
		return false
	}
	if strings.HasPrefix(strings.ToUpper(t.reference), "SRV") ||
		strings.Contains(ref, "service") {
		return true
	}
	// Heuristic: debit with non-UTR short/long catalog id used as serviceId
	if strings.EqualFold(t.txType, "debit") && !looksLikeUtr(t.reference) {
		return true
	}
	return false
}

func looksLikeUtr(s string) bool {
	if len(s) == 12 {
		for _, c := range s {
			if c < '0' || c > '9' {
				return false
			}
		}
		return true
	}
	return false
}

func resolveServiceMeta(t rawWalletTx, meta map[string]models.ServiceApplication) (name, status string) {
	ref := strings.TrimSuffix(t.reference, "-REFUND")
	if app, ok := meta[ref]; ok {
		name = app.ServiceName
		if name == "" {
			name = app.ServiceId
		}
		status = app.Status
	}
	if name == "" {
		name = t.title
	}
	if name == "" {
		name = t.description
	}
	if name == "" {
		name = "Service"
	}
	if status == "" {
		status = t.status
	}
	return name, status
}

func almostEqual(a, b float64) bool {
	d := a - b
	if d < 0 {
		d = -d
	}
	return d < 0.005
}

func countRole(partners []partnerOverviewRow, role string) int {
	n := 0
	for _, p := range partners {
		if p.Role == role {
			n++
		}
	}
	return n
}
