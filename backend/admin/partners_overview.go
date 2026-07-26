package admin

import (
	"context"
	"net/http"
	"sort"
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
	ApplicationId string  `json:"applicationId"`
	ServiceName   string  `json:"serviceName"`
	Status        string  `json:"status"`
	DebitAmount   float64 `json:"debitAmount"`
	CreatedDate   string  `json:"createdDate"`
	CreatedAtIST  string  `json:"createdAtIst"`
}

type partnerOverviewRow struct {
	UserId          string              `json:"userId"`
	Name            string              `json:"name"`
	Role            string              `json:"role"`
	Mobile          string              `json:"mobile"`
	Email           string              `json:"email"`
	Status          string              `json:"status"`
	WalletBalance   float64             `json:"walletBalance"`
	ServiceCount    int                 `json:"serviceCount"`
	TotalDebited    float64             `json:"totalDebited"`
	ActiveServices  []partnerServiceRow `json:"activeServices"`
	RecentServices  []partnerServiceRow `json:"recentServices"`
}

// GetPartnersOverview returns retailers + distributors with wallet balance
// and the services they ran (wallet cut per service).
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

	byPartner := make(map[string][]partnerServiceRow)
	totals := make(map[string]float64)
	for _, app := range apps {
		pid := strings.TrimSpace(app.RetailerId)
		if pid == "" {
			continue
		}
		row := partnerServiceRow{
			ApplicationId: app.Id,
			ServiceName:   app.ServiceName,
			Status:        app.Status,
			DebitAmount:   app.Cost,
			CreatedDate:   app.CreatedDate,
			CreatedAtIST:  timeutil.FormatRFC3339AsIST(app.CreatedDate),
		}
		if row.ServiceName == "" {
			row.ServiceName = app.ServiceId
		}
		if row.ServiceName == "" {
			row.ServiceName = "Service"
		}
		byPartner[pid] = append(byPartner[pid], row)
		// Wallet is cut when the service request is created.
		totals[pid] += app.Cost
	}

	// Newest first within each partner
	for pid, list := range byPartner {
		sort.Slice(list, func(i, j int) bool {
			return list[i].CreatedDate > list[j].CreatedDate
		})
		byPartner[pid] = list
	}

	partners := make([]partnerOverviewRow, 0, len(users))
	for _, u := range users {
		uid := u.UserId
		if uid == "" {
			uid = strings.TrimPrefix(u.PK, "USER#")
		}
		services := byPartner[uid]
		if services == nil {
			services = []partnerServiceRow{}
		}

		active := make([]partnerServiceRow, 0)
		for _, s := range services {
			st := strings.ToLower(s.Status)
			if st == "pending" || st == "process" || st == "inprocess" || st == "resubmit" {
				active = append(active, s)
			}
		}

		recent := services
		if len(recent) > 8 {
			recent = recent[:8]
		}

		partners = append(partners, partnerOverviewRow{
			UserId:         uid,
			Name:           u.FullName,
			Role:           strings.ToLower(u.Role),
			Mobile:         u.Mobile,
			Email:          u.Email,
			Status:         u.Status,
			WalletBalance:  u.WalletBalance,
			ServiceCount:   len(services),
			TotalDebited:   totals[uid],
			ActiveServices: active,
			RecentServices: recent,
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

func countRole(partners []partnerOverviewRow, role string) int {
	n := 0
	for _, p := range partners {
		if p.Role == role {
			n++
		}
	}
	return n
}
