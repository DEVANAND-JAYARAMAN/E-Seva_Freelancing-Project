package auth

import (
	"context"
	"log"
	"net/http"
	"time"

	"eservice-backend/db"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
)

type UpdateUserRequest struct {
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	Mobile      string `json:"mobile"`
	Status      string `json:"status"`
	RawPassword string `json:"rawPassword"`
	Role        string `json:"role"` // to determine which other table to update
}

func UpdateUser(c *gin.Context) {
	userId := c.Param("id")
	if userId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateExpr := "SET updatedAt = :ts"
	exprValues := map[string]types.AttributeValue{
		":ts": &types.AttributeValueMemberS{Value: time.Now().UTC().Format(time.RFC3339)},
	}

	if req.FullName != "" {
		updateExpr += ", fullName = :fn"
		exprValues[":fn"] = &types.AttributeValueMemberS{Value: req.FullName}
	}
	if req.Email != "" {
		updateExpr += ", email = :em"
		exprValues[":em"] = &types.AttributeValueMemberS{Value: req.Email}
	}
	if req.Mobile != "" {
		updateExpr += ", mobile = :mob"
		exprValues[":mob"] = &types.AttributeValueMemberS{Value: req.Mobile}
	}
	if req.Status != "" {
		updateExpr += ", #st = :st" // Status is a reserved word sometimes, better use alias
	}
	if req.RawPassword != "" {
		hashed, err := HashPassword(req.RawPassword)
		if err == nil {
			updateExpr += ", passwordHash = :ph, rawPassword = :rp"
			exprValues[":ph"] = &types.AttributeValueMemberS{Value: hashed}
			exprValues[":rp"] = &types.AttributeValueMemberS{Value: req.RawPassword}
		}
	}

	exprNames := map[string]string{}
	if req.Status != "" {
		exprNames["#st"] = "status"
		exprValues[":st"] = &types.AttributeValueMemberS{Value: req.Status}
	}

	// 1. Update Users Table
	updateInput := &dynamodb.UpdateItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		UpdateExpression:          aws.String(updateExpr),
		ExpressionAttributeValues: exprValues,
	}
	if len(exprNames) > 0 {
		updateInput.ExpressionAttributeNames = exprNames
	}

	_, err := db.DynamoClient.UpdateItem(context.TODO(), updateInput)
	if err != nil {
		log.Printf("Failed to update user profile %s: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// 2. Update Retailer / Distributor table if role is provided
	// Adjust attribute names since Retailers table uses "name" and "phone" instead of fullName and mobile.
	if req.Role == "retailer" || req.Role == "distributor" {
		tableName := "Retailers"
		if req.Role == "distributor" {
			tableName = "Distributors"
		}
		
		roleUpdateExpr := "SET updatedAt = :ts"
		roleExprValues := map[string]types.AttributeValue{
			":ts": &types.AttributeValueMemberS{Value: time.Now().UTC().Format(time.RFC3339)},
		}
		if req.FullName != "" {
			roleUpdateExpr += ", #nm = :nm"
			roleExprValues[":nm"] = &types.AttributeValueMemberS{Value: req.FullName}
		}
		if req.Email != "" {
			roleUpdateExpr += ", email = :em"
			roleExprValues[":em"] = &types.AttributeValueMemberS{Value: req.Email}
		}
		if req.Mobile != "" {
			roleUpdateExpr += ", phone = :ph"
			roleExprValues[":ph"] = &types.AttributeValueMemberS{Value: req.Mobile}
		}
		if req.Status != "" {
			roleUpdateExpr += ", #st = :st"
			roleExprValues[":st"] = &types.AttributeValueMemberS{Value: req.Status}
		}

		roleExprNames := map[string]string{}
		if req.Status != "" {
			roleExprNames["#st"] = "status"
		}
		if req.FullName != "" {
			roleExprNames["#nm"] = "name"
		}

		rolePK := aws.String(req.Role)
		if req.Role == "retailer" {
			rolePK = aws.String("RETAILER#" + userId)
		} else {
			rolePK = aws.String("DISTRIBUTOR#" + userId)
		}

		roleUpdateInput := &dynamodb.UpdateItemInput{
			TableName: aws.String(tableName),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: *rolePK},
				"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
			},
			UpdateExpression:          aws.String(roleUpdateExpr),
			ExpressionAttributeValues: roleExprValues,
		}
		if len(roleExprNames) > 0 {
			roleUpdateInput.ExpressionAttributeNames = roleExprNames
		}

		_, roleErr := db.DynamoClient.UpdateItem(context.TODO(), roleUpdateInput)
		if roleErr != nil {
			log.Printf("Failed to update role profile %s for %s: %v", req.Role, userId, roleErr)
			// Non-fatal, just log it.
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}
