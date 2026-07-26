package admin

import (
	"context"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

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

	appsByPartner := map[string][]models.ServiceApplication{}
	for _, app := range apps {
		pid := strings.TrimSpace(app.RetailerId)
		if pid == "" {
			continue
		}
		appsByPartner[pid] = append(appsByPartner[pid], app)
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
		// Amount details = THIS partner's service applications (correct status),
		// with Debit/Credit/Available Balance from their wallet ledger.
		type balTx struct {
			rawWalletTx
			available float64
			debit     float64
			credit    float64
		}
		ledger := make([]balTx, 0, len(allTx))
		bal := u.WalletBalance
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

		usedTx := map[string]bool{}
		matchLedger := func(app models.ServiceApplication, wantDebit bool) (balTx, bool) {
			bestIdx := -1
			bestScore := int64(1 << 62)
			appT := parseFlexibleTime(app.CreatedDate)
			for i, t := range ledger {
				key := t.id + "|" + t.createdAt
				if usedTx[key] {
					continue
				}
				ref := strings.TrimSuffix(t.reference, "-REFUND")
				exact := ref == app.ServiceId || ref == app.Id
				if wantDebit {
					if t.debit <= 0 || !almostEqual(t.debit, app.Cost) {
						continue
					}
					soft := strings.Contains(strings.ToLower(t.description), "service")
					if !exact && !soft {
						continue
					}
				} else {
					if t.credit <= 0 || !almostEqual(t.credit, app.Cost) {
						continue
					}
					if !strings.Contains(strings.ToLower(t.reference), "refund") && !exact {
						continue
					}
				}
				txT := parseFlexibleTime(t.createdAt)
				diff := absInt64(appT.Unix() - txT.Unix())
				score := diff
				if !exact {
					score += 1_000_000 // prefer exact serviceId match
				}
				if bestIdx < 0 || score < bestScore {
					bestIdx = i
					bestScore = score
				}
			}
			if bestIdx < 0 {
				return balTx{}, false
			}
			picked := ledger[bestIdx]
			usedTx[picked.id+"|"+picked.createdAt] = true
			return picked, true
		}

		amountDetails := make([]partnerServiceRow, 0, len(partnerApps))
		totalDebited := 0.0
		runBal := u.WalletBalance
		for _, app := range partnerApps {
			name := app.ServiceName
			if name == "" {
				name = app.ServiceId
			}
			if name == "" {
				name = "Service"
			}
			ist := timeutil.FormatRFC3339AsIST(app.CreatedDate)

			debitAmt := app.Cost
			creditAmt := 0.0
			avail := runBal

			if deb, ok := matchLedger(app, true); ok {
				debitAmt = deb.debit
				avail = deb.available
			}
			if cred, ok := matchLedger(app, false); ok {
				creditAmt = cred.credit
			}

			amountDetails = append(amountDetails, partnerServiceRow{
				ApplicationId:    app.Id,
				ServiceName:      name,
				Status:           app.Status, // always this partner's request status
				DebitAmount:      debitAmt,
				CreditAmount:     creditAmt,
				AvailableBalance: avail,
				CreatedDate:      app.CreatedDate,
				CreatedAtIST:     ist,
				DateTime:         ist,
			})
			totalDebited += debitAmt
			runBal += debitAmt // walking older: undo debit for fallback chain
			if creditAmt > 0 {
				runBal -= creditAmt
			}
		}

		active := make([]partnerServiceRow, 0)
		recent := make([]partnerServiceRow, 0)
		for _, row := range amountDetails {
			st := strings.ToLower(row.Status)
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

func parseFlexibleTime(s string) time.Time {
	if s == "" {
		return time.Time{}
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t
	}
	if t, err := time.Parse(time.RFC3339Nano, s); err == nil {
		return t
	}
	if t, err := time.Parse("2006-01-02 15:04:05", s); err == nil {
		return t
	}
	return time.Time{}
}

func absInt64(n int64) int64 {
	if n < 0 {
		return -n
	}
	return n
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
