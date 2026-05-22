package auth

import (
	"eservice-backend/internal/models"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo                *Repository
	jwtSecret           string
	jwtExpiryHours      int
	refreshExpiryHours  int
}

func NewService(repo *Repository, jwtSecret string, jwtExpiryHours, refreshExpiryHours int) *Service {
	return &Service{
		repo:               repo,
		jwtSecret:          jwtSecret,
		jwtExpiryHours:     jwtExpiryHours,
		refreshExpiryHours: refreshExpiryHours,
	}
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func (s *Service) Register(email, password, fullName, phone, role string) (*models.User, error) {
	// Check if user already exists
	existingUser, _ := s.repo.GetUserByEmail(email)
	if existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("error hashing password: %w", err)
	}

	// Set default role if not provided
	if role == "" {
		role = string(models.RoleRetailer)
	}

	// Validate role
	validRoles := map[string]bool{
		string(models.RoleAdmin):       true,
		string(models.RoleDistributor): true,
		string(models.RoleRetailer):    true,
		string(models.RoleCustomer):    true,
	}
	if !validRoles[role] {
		return nil, fmt.Errorf("invalid role")
	}

	user := &models.User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		FullName:     fullName,
		Phone:        phone,
		Role:         role,
		Status:       string(models.StatusPending), // New users start as pending
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) Login(email, password string) (string, string, *models.User, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return "", "", nil, fmt.Errorf("invalid credentials")
	}

	// Check if user is active
	if user.Status != string(models.StatusActive) {
		return "", "", nil, fmt.Errorf("account is not active. Status: %s", user.Status)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", "", nil, fmt.Errorf("invalid credentials")
	}

	// Generate access token
	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return "", "", nil, err
	}

	// Generate refresh token
	refreshToken, err := s.GenerateRefreshToken(user)
	if err != nil {
		return "", "", nil, err
	}

	// Update last login
	s.repo.UpdateLastLogin(user.ID)

	return accessToken, refreshToken, user, nil
}

func (s *Service) GenerateAccessToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(time.Duration(s.jwtExpiryHours) * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", fmt.Errorf("error generating token: %w", err)
	}

	return tokenString, nil
}

func (s *Service) GenerateRefreshToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(time.Duration(s.refreshExpiryHours) * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", fmt.Errorf("error generating refresh token: %w", err)
	}

	// Save refresh token to database
	if err := s.repo.SaveRefreshToken(user.ID, tokenString, expirationTime); err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func (s *Service) RefreshAccessToken(refreshToken string) (string, error) {
	// Validate refresh token from database
	userID, err := s.repo.GetRefreshToken(refreshToken)
	if err != nil {
		return "", err
	}

	// Get user
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return "", err
	}

	// Check if user is still active
	if user.Status != string(models.StatusActive) {
		return "", fmt.Errorf("account is not active")
	}

	// Generate new access token
	return s.GenerateAccessToken(user)
}

func (s *Service) Logout(refreshToken string) error {
	return s.repo.RevokeRefreshToken(refreshToken)
}

func (s *Service) GetUserByID(id int) (*models.User, error) {
	return s.repo.GetUserByID(id)
}
