package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"eservice-backend/db"
	"eservice-backend/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// In production, load this from .env
var jwtSecret = []byte("your-super-secret-jwt-key-change-this-in-production")

type SignupRequest struct {
	FullName string `json:"fullName" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Mobile   string `json:"mobile" binding:"required"`
	Role     string `json:"role" binding:"required"` // 'retailer' or 'distributor'
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func generateUserId() string {
	return "USR" + time.Now().Format("20060102150405")
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func generateToken(userId string, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userId,
		"role":   role,
		"exp":    time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString(jwtSecret)
}

func GetUserByEmail(email string) (*models.User, error) {
	// Query GSI-Email on Users table
	out, err := db.DynamoClient.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:              aws.String("Users"),
		IndexName:              aws.String("GSI-Email"),
		KeyConditionExpression: aws.String("email = :email"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":email": &types.AttributeValueMemberS{Value: email},
		},
	})
	if err != nil {
		return nil, err
	}
	if len(out.Items) == 0 {
		return nil, errors.New("user not found")
	}

	var user models.User
	err = attributevalue.UnmarshalMap(out.Items[0], &user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func Signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	existingUser, _ := GetUserByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	userId := generateUserId()
	now := time.Now().UTC().Format(time.RFC3339)

	user := models.User{
		PK:           "USER#" + userId,
		SK:           "PROFILE",
		UserId:       userId,
		FullName:     req.FullName,
		Email:        req.Email,
		Mobile:       req.Mobile,
		Role:         req.Role,
		PasswordHash: hashedPassword,
		Status:       "Active",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	userItem, err := attributevalue.MarshalMap(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal user"})
		return
	}

	// Transaction to insert User and Role specific record
	transactItems := []types.TransactWriteItem{
		{
			Put: &types.Put{
				TableName: aws.String("Users"),
				Item:      userItem,
				ConditionExpression: aws.String("attribute_not_exists(PK)"),
			},
		},
	}

	if req.Role == "retailer" {
		retailer := models.Retailer{
			PK:          "RETAILER#" + userId,
			SK:          "PROFILE",
			Id:          userId,
			Name:        req.FullName,
			Email:       req.Email,
			Phone:       req.Mobile,
			Status:      "Active",
			CreatedDate: now,
			UpdatedAt:   now,
		}
		retailerItem, _ := attributevalue.MarshalMap(retailer)
		transactItems = append(transactItems, types.TransactWriteItem{
			Put: &types.Put{
				TableName: aws.String("Retailers"),
				Item:      retailerItem,
			},
		})
	} else if req.Role == "distributor" {
		distributor := models.Distributor{
			PK:          "DISTRIBUTOR#" + userId,
			SK:          "PROFILE",
			Id:          userId,
			Name:        req.FullName,
			Email:       req.Email,
			Phone:       req.Mobile,
			Status:      "Active",
			CreatedDate: now,
			UpdatedAt:   now,
		}
		distributorItem, _ := attributevalue.MarshalMap(distributor)
		transactItems = append(transactItems, types.TransactWriteItem{
			Put: &types.Put{
				TableName: aws.String("Distributors"),
				Item:      distributorItem,
			},
		})
	}

	_, err = db.DynamoClient.TransactWriteItems(context.TODO(), &dynamodb.TransactWriteItemsInput{
		TransactItems: transactItems,
	})

	if err != nil {
		log.Printf("DynamoDB TransactWriteItems failed: %T %v", err, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"userId":  userId,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := generateToken(user.UserId, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// The frontend expects some redirect URL based on role
	redirectUrl := "/dashboard"
	if user.Role == "retailer" {
		redirectUrl = "/retailer-dashboard"
	} else if user.Role == "distributor" {
		redirectUrl = "/distributor-dashboard"
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Login successful",
		"token":       token,
		"role":        user.Role,
		"redirectUrl": redirectUrl,
		"user": gin.H{
			"id":       user.UserId,
			"fullName": user.FullName,
			"email":         user.Email,
			"walletBalance": user.WalletBalance,
		},
	})
}

// GetRetailers fetches all retailers from Users table
func GetRetailers(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
		FilterExpression: aws.String("#r = :role"),
		ExpressionAttributeNames: map[string]string{
			"#r": "role",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":role": &types.AttributeValueMemberS{Value: "retailer"},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch retailers"})
		return
	}

	var users []models.User
	err = attributevalue.UnmarshalListOfMaps(out.Items, &users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode retailers"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetDistributors fetches all distributors from Users table
func GetDistributors(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
		FilterExpression: aws.String("#r = :role"),
		ExpressionAttributeNames: map[string]string{
			"#r": "role",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":role": &types.AttributeValueMemberS{Value: "distributor"},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch distributors"})
		return
	}

	var users []models.User
	err = attributevalue.UnmarshalListOfMaps(out.Items, &users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode distributors"})
		return
	}

	c.JSON(http.StatusOK, users)
}
