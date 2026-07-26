package auth

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"strings"
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

// JWT signing uses jwtSecretBytes() from middleware.go (JWT_SECRET env or legacy default).

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

// generateUserId creates a short simple ID:
// Retailer → R48219, Distributor → D39120, Admin → A10234
func generateUserId(role string) string {
	prefix := "U"
	switch strings.ToLower(strings.TrimSpace(role)) {
	case "retailer":
		prefix = "R"
	case "distributor":
		prefix = "D"
	case "admin":
		prefix = "A"
	}
	n, err := rand.Int(rand.Reader, big.NewInt(90000))
	if err != nil {
		return fmt.Sprintf("%s%05d", prefix, time.Now().Unix()%100000)
	}
	return fmt.Sprintf("%s%05d", prefix, n.Int64()+10000)
}

func userIdExists(userId string) bool {
	out, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + userId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
		ProjectionExpression: aws.String("PK"),
	})
	return err == nil && out.Item != nil
}

func nextUniqueUserId(role string) (string, error) {
	for i := 0; i < 12; i++ {
		id := generateUserId(role)
		if !userIdExists(id) {
			return id, nil
		}
	}
	return "", errors.New("failed to allocate a unique user id")
}

func sendSignupWhatsAppMessage(mobile, role, userId, rawPassword string) {
	apiKey := os.Getenv("WHATSAPP_API_KEY")
	senderDevice := os.Getenv("WHATSAPP_SENDER_DEVICE")

	if apiKey == "" || senderDevice == "" {
		log.Println("Skipping WhatsApp API call: WHATSAPP_API_KEY or WHATSAPP_SENDER_DEVICE is missing in .env")
		return
	}

	url := "https://mugavaiwapp.in.net/send-message"
	message := fmt.Sprintf("Welcome to Thuruvancommunications, you are successfully signed up as %s.\nYour ID: %s\nPassword: %s", role, userId, rawPassword)

	number := strings.ReplaceAll(mobile, "+", "")
	if len(number) == 10 {
		number = "91" + number
	}
	payload := map[string]string{
		"api_key": apiKey,
		"sender":  senderDevice,
		"number":  number,
		"message": message,
	}
	jsonValue, _ := json.Marshal(payload)
	go func() {
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
		if err != nil {
			log.Printf("WhatsApp API Error on signup: %v", err)
			return
		}
		defer resp.Body.Close()
		log.Printf("WhatsApp signup message sent to %s, status: %s", number, resp.Status)
	}()
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
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
	return token.SignedString(jwtSecretBytes())
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

	userId, err := nextUniqueUserId(req.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user id"})
		return
	}
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
		RawPassword:  req.Password,
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

	// Add Notification for Admin
	notifId := "NOTIF" + time.Now().Format("20060102150405")
	notif := map[string]interface{}{
		"PK":        "USER#ADMIN",
		"SK":        "NOTIF#" + now + "#" + notifId,
		"id":        notifId,
		"userId":    "ADMIN",
		"title":     "New User Registration",
		"message":   fmt.Sprintf("New %s registered: %s (%s)", req.Role, req.FullName, req.Email),
		"type":      "info",
		"isRead":    false,
		"createdAt": now,
		"link":      "/status",
	}
	notifItem, _ := attributevalue.MarshalMap(notif)
	_, _ = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Notifications"),
		Item:      notifItem,
	})

	sendSignupWhatsAppMessage(req.Mobile, req.Role, userId, req.Password)

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

	if user.Status == "Suspended" || user.Status == "Inactive" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Your account has been suspended. Please contact the administrator."})
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

	// Prefer spendable Wallets.balance over Users.walletBalance
	walletBalance := user.WalletBalance
	walletOut, wErr := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Wallets"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "WALLET#" + user.UserId},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		},
	})
	if wErr == nil && walletOut.Item != nil {
		if balAttr, ok := walletOut.Item["balance"].(*types.AttributeValueMemberN); ok {
			if bal, err := strconv.ParseFloat(balAttr.Value, 64); err == nil {
				walletBalance = bal
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Login successful",
		"token":       token,
		"role":        user.Role,
		"redirectUrl": redirectUrl,
		"user": gin.H{
			"id":            user.UserId,
			"fullName":      user.FullName,
			"email":         user.Email,
			"walletBalance": walletBalance,
		},
	})
}

// GetRetailers fetches all retailers from Users table
func GetRetailers(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch retailers"})
		return
	}

	var all []models.User
	err = attributevalue.UnmarshalListOfMaps(out.Items, &all)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode retailers"})
		return
	}

	users := make([]models.User, 0, len(all))
	for _, u := range all {
		if strings.EqualFold(strings.TrimSpace(u.Role), "retailer") {
			users = append(users, u)
		}
	}

	hydrateWalletBalances(users)
	c.JSON(http.StatusOK, users)
}

// GetDistributors fetches all distributors from Users table
func GetDistributors(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("Users"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch distributors"})
		return
	}

	var all []models.User
	err = attributevalue.UnmarshalListOfMaps(out.Items, &all)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode distributors"})
		return
	}

	users := make([]models.User, 0, len(all))
	for _, u := range all {
		if strings.EqualFold(strings.TrimSpace(u.Role), "distributor") {
			users = append(users, u)
		}
	}

	hydrateWalletBalances(users)
	c.JSON(http.StatusOK, users)
}

// HydrateWalletBalances sets spendable Wallets.balance onto each user (exported for admin).
func HydrateWalletBalances(users []models.User) {
	hydrateWalletBalances(users)
}

// hydrateWalletBalances overwrites Users.walletBalance with Wallets.balance (spendable truth).
func hydrateWalletBalances(users []models.User) {
	if len(users) == 0 {
		return
	}

	keys := make([]map[string]types.AttributeValue, 0, len(users))
	idByPK := make(map[string]int, len(users))
	for i, u := range users {
		id := u.UserId
		if id == "" {
			id = strings.TrimPrefix(u.PK, "USER#")
		}
		if id == "" {
			continue
		}
		pk := "WALLET#" + id
		keys = append(keys, map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: "TYPE#Main"},
		})
		idByPK[pk] = i
	}

	for start := 0; start < len(keys); start += 100 {
		end := start + 100
		if end > len(keys) {
			end = len(keys)
		}
		batch := keys[start:end]
		out, err := db.DynamoClient.BatchGetItem(context.TODO(), &dynamodb.BatchGetItemInput{
			RequestItems: map[string]types.KeysAndAttributes{
				"Wallets": {Keys: batch},
			},
		})
		if err != nil {
			log.Printf("hydrateWalletBalances BatchGet failed: %v", err)
			return
		}
		for _, item := range out.Responses["Wallets"] {
			pkAttr, ok := item["PK"].(*types.AttributeValueMemberS)
			if !ok {
				continue
			}
			idx, ok := idByPK[pkAttr.Value]
			if !ok {
				continue
			}
			if balAttr, ok := item["balance"].(*types.AttributeValueMemberN); ok {
				if bal, err := strconv.ParseFloat(balAttr.Value, 64); err == nil {
					users[idx].WalletBalance = bal
				}
			}
		}
	}
}
