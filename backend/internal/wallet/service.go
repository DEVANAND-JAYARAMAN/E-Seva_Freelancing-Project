package wallet

import (
	"eservice-backend/internal/models"
	"fmt"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GetWalletBalance retrieves wallet balance for a user
func (s *Service) GetWalletBalance(userID int) (*models.Wallet, error) {
	return s.repo.GetWalletByUserID(userID)
}

// CreateWallet creates a new wallet for a user
func (s *Service) CreateWallet(userID int) (*models.Wallet, error) {
	// Check if wallet already exists
	existing, _ := s.repo.GetWalletByUserID(userID)
	if existing != nil {
		return existing, nil
	}

	return s.repo.CreateWallet(userID)
}

// CreditWallet adds money to wallet
func (s *Service) CreditWallet(userID int, amount float64, walletType, description string) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	if walletType != "main" && walletType != "api" {
		return fmt.Errorf("invalid wallet type: %s", walletType)
	}

	return s.repo.UpdateBalance(userID, walletType, amount, "credit")
}

// DebitWallet deducts money from wallet
func (s *Service) DebitWallet(userID int, amount float64, walletType, description string) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	if walletType != "main" && walletType != "api" {
		return fmt.Errorf("invalid wallet type: %s", walletType)
	}

	// Check balance before debit
	wallet, err := s.repo.GetWalletByUserID(userID)
	if err != nil {
		return err
	}

	var currentBalance float64
	if walletType == "main" {
		currentBalance = wallet.MainBalance
	} else {
		currentBalance = wallet.APIBalance
	}

	if currentBalance < amount {
		return fmt.Errorf("insufficient balance: current %.2f, required %.2f", currentBalance, amount)
	}

	return s.repo.UpdateBalance(userID, walletType, amount, "debit")
}

// DeductServiceCharge deducts e-service charge from retailer wallet
func (s *Service) DeductServiceCharge(userID int, serviceType string, serviceCharge float64, applicationID string) error {
	if serviceCharge <= 0 {
		return fmt.Errorf("service charge must be greater than zero")
	}

	// Check wallet balance
	wallet, err := s.repo.GetWalletByUserID(userID)
	if err != nil {
		return fmt.Errorf("wallet not found: %w", err)
	}

	if wallet.MainBalance < serviceCharge {
		return fmt.Errorf("insufficient balance: current ₹%.2f, required ₹%.2f", wallet.MainBalance, serviceCharge)
	}

	// Deduct from main wallet
	err = s.repo.UpdateBalance(userID, "main", serviceCharge, "debit")
	if err != nil {
		return err
	}

	// Record transaction with service details
	transaction := &models.WalletTransaction{
		UserID:          userID,
		TransactionType: "debit",
		WalletType:      "main",
		Amount:          serviceCharge,
		BalanceBefore:   wallet.MainBalance,
		BalanceAfter:    wallet.MainBalance - serviceCharge,
		ReferenceID:     applicationID,
		Description:     fmt.Sprintf("Service charge for %s application", serviceType),
		Status:          "completed",
	}

	return s.repo.RecordTransaction(transaction)
}

// GetTransactionHistory retrieves transaction history
func (s *Service) GetTransactionHistory(userID int, page, pageSize int) ([]models.WalletTransaction, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	return s.repo.GetTransactionHistory(userID, pageSize, offset)
}

// RequestRecharge creates a recharge request
func (s *Service) RequestRecharge(userID int, amount float64, paymentReference, paymentProofURL string) (*models.WalletRequest, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	if amount < 100 {
		return nil, fmt.Errorf("minimum recharge amount is ₹100")
	}

	request := &models.WalletRequest{
		UserID:           userID,
		Amount:           amount,
		PaymentReference: paymentReference,
		PaymentProofURL:  paymentProofURL,
		Status:           "pending",
	}

	err := s.repo.CreateRechargeRequest(request)
	if err != nil {
		return nil, err
	}

	return request, nil
}

// GetRechargeRequests retrieves recharge requests (admin)
func (s *Service) GetRechargeRequests(status string, page, pageSize int) ([]models.WalletRequest, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	return s.repo.GetRechargeRequests(status, pageSize, offset)
}

// GetUserRechargeRequests retrieves user's recharge requests
func (s *Service) GetUserRechargeRequests(userID int) ([]models.WalletRequest, error) {
	return s.repo.GetUserRechargeRequests(userID)
}

// ApproveRecharge approves a recharge request
func (s *Service) ApproveRecharge(requestID, adminID int, notes string) error {
	return s.repo.ApproveRechargeRequest(requestID, adminID, notes)
}

// RejectRecharge rejects a recharge request
func (s *Service) RejectRecharge(requestID, adminID int, notes string) error {
	return s.repo.RejectRechargeRequest(requestID, adminID, notes)
}

// CheckBalance checks if user has sufficient balance
func (s *Service) CheckBalance(userID int, requiredAmount float64) (bool, error) {
	wallet, err := s.repo.GetWalletByUserID(userID)
	if err != nil {
		return false, err
	}

	return wallet.MainBalance >= requiredAmount, nil
}
