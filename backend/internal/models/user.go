package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Phone        string    `json:"phone"`
	Role         string    `json:"role"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	LastLogin    *time.Time `json:"last_login,omitempty"`
}

type UserRole string

const (
	RoleAdmin       UserRole = "admin"
	RoleDistributor UserRole = "distributor"
	RoleRetailer    UserRole = "retailer"
	RoleCustomer    UserRole = "customer"
)

type UserStatus string

const (
	StatusPending   UserStatus = "pending"
	StatusActive    UserStatus = "active"
	StatusSuspended UserStatus = "suspended"
	StatusInactive  UserStatus = "inactive"
)

type Wallet struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	MainBalance float64   `json:"main_balance"`
	APIBalance  float64   `json:"api_balance"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type WalletTransaction struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	TransactionType string    `json:"transaction_type"`
	WalletType      string    `json:"wallet_type"`
	Amount          float64   `json:"amount"`
	BalanceBefore   float64   `json:"balance_before"`
	BalanceAfter    float64   `json:"balance_after"`
	ReferenceID     string    `json:"reference_id,omitempty"`
	Description     string    `json:"description"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

type WalletRequest struct {
	ID               int        `json:"id"`
	UserID           int        `json:"user_id"`
	Amount           float64    `json:"amount"`
	PaymentReference string     `json:"payment_reference,omitempty"`
	PaymentProofURL  string     `json:"payment_proof_url,omitempty"`
	Status           string     `json:"status"`
	RequestedAt      time.Time  `json:"requested_at"`
	ProcessedAt      *time.Time `json:"processed_at,omitempty"`
	ProcessedBy      *int       `json:"processed_by,omitempty"`
	AdminNotes       string     `json:"admin_notes,omitempty"`
}
