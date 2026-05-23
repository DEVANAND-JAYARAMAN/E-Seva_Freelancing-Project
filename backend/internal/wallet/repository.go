package wallet

import (
	"database/sql"
	"eservice-backend/internal/models"
	"eservice-backend/internal/platform/postgres"
	"fmt"
	"time"
)

type Repository struct {
	db *postgres.DB
}

func NewRepository(db *postgres.DB) *Repository {
	return &Repository{db: db}
}

// GetWalletByUserID retrieves wallet for a specific user
func (r *Repository) GetWalletByUserID(userID int) (*models.Wallet, error) {
	wallet := &models.Wallet{}
	query := `
		SELECT id, user_id, main_balance, api_balance, created_at, updated_at
		FROM wallets
		WHERE user_id = $1
	`
	err := r.db.QueryRow(query, userID).Scan(
		&wallet.ID,
		&wallet.UserID,
		&wallet.MainBalance,
		&wallet.APIBalance,
		&wallet.CreatedAt,
		&wallet.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("wallet not found for user")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching wallet: %w", err)
	}

	return wallet, nil
}

// CreateWallet creates a new wallet for a user
func (r *Repository) CreateWallet(userID int) (*models.Wallet, error) {
	wallet := &models.Wallet{
		UserID:      userID,
		MainBalance: 0.00,
		APIBalance:  0.00,
	}

	query := `
		INSERT INTO wallets (user_id, main_balance, api_balance)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(query, wallet.UserID, wallet.MainBalance, wallet.APIBalance).Scan(
		&wallet.ID,
		&wallet.CreatedAt,
		&wallet.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error creating wallet: %w", err)
	}

	return wallet, nil
}

// UpdateBalance updates wallet balance with transaction safety
func (r *Repository) UpdateBalance(userID int, walletType string, amount float64, transactionType string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer tx.Rollback()

	// Lock the wallet row for update
	var currentBalance float64
	var walletID int
	lockQuery := `
		SELECT id, ` + walletType + `_balance
		FROM wallets
		WHERE user_id = $1
		FOR UPDATE
	`
	err = tx.QueryRow(lockQuery, userID).Scan(&walletID, &currentBalance)
	if err != nil {
		return fmt.Errorf("error locking wallet: %w", err)
	}

	// Calculate new balance
	var newBalance float64
	if transactionType == "credit" {
		newBalance = currentBalance + amount
	} else if transactionType == "debit" {
		if currentBalance < amount {
			return fmt.Errorf("insufficient balance: current %.2f, required %.2f", currentBalance, amount)
		}
		newBalance = currentBalance - amount
	} else {
		return fmt.Errorf("invalid transaction type: %s", transactionType)
	}

	// Update wallet balance
	updateQuery := `
		UPDATE wallets
		SET ` + walletType + `_balance = $1, updated_at = $2
		WHERE user_id = $3
	`
	_, err = tx.Exec(updateQuery, newBalance, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("error updating balance: %w", err)
	}

	// Record transaction in ledger
	ledgerQuery := `
		INSERT INTO wallet_transactions 
		(user_id, transaction_type, wallet_type, amount, balance_before, balance_after, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = tx.Exec(
		ledgerQuery,
		userID,
		transactionType,
		walletType,
		amount,
		currentBalance,
		newBalance,
		"completed",
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("error recording transaction: %w", err)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

// RecordTransaction records a transaction with reference
func (r *Repository) RecordTransaction(transaction *models.WalletTransaction) error {
	query := `
		INSERT INTO wallet_transactions 
		(user_id, transaction_type, wallet_type, amount, balance_before, balance_after, 
		 reference_id, description, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`
	err := r.db.QueryRow(
		query,
		transaction.UserID,
		transaction.TransactionType,
		transaction.WalletType,
		transaction.Amount,
		transaction.BalanceBefore,
		transaction.BalanceAfter,
		transaction.ReferenceID,
		transaction.Description,
		transaction.Status,
		time.Now(),
	).Scan(&transaction.ID)

	return err
}

// GetTransactionHistory retrieves transaction history for a user
func (r *Repository) GetTransactionHistory(userID int, limit, offset int) ([]models.WalletTransaction, error) {
	query := `
		SELECT id, user_id, transaction_type, wallet_type, amount, 
		       balance_before, balance_after, reference_id, description, status, created_at
		FROM wallet_transactions
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error fetching transactions: %w", err)
	}
	defer rows.Close()

	var transactions []models.WalletTransaction
	for rows.Next() {
		var t models.WalletTransaction
		err := rows.Scan(
			&t.ID,
			&t.UserID,
			&t.TransactionType,
			&t.WalletType,
			&t.Amount,
			&t.BalanceBefore,
			&t.BalanceAfter,
			&t.ReferenceID,
			&t.Description,
			&t.Status,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning transaction: %w", err)
		}
		transactions = append(transactions, t)
	}

	return transactions, nil
}

// CreateRechargeRequest creates a new wallet recharge request
func (r *Repository) CreateRechargeRequest(request *models.WalletRequest) error {
	query := `
		INSERT INTO wallet_requests 
		(user_id, amount, payment_reference, payment_proof_url, status, requested_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	err := r.db.QueryRow(
		query,
		request.UserID,
		request.Amount,
		request.PaymentReference,
		request.PaymentProofURL,
		"pending",
		time.Now(),
	).Scan(&request.ID)

	return err
}

// GetRechargeRequests retrieves recharge requests (admin view)
func (r *Repository) GetRechargeRequests(status string, limit, offset int) ([]models.WalletRequest, error) {
	query := `
		SELECT wr.id, wr.user_id, wr.amount, wr.payment_reference, wr.payment_proof_url,
		       wr.status, wr.requested_at, wr.processed_at, wr.processed_by, wr.admin_notes,
		       u.email, u.full_name
		FROM wallet_requests wr
		JOIN users u ON wr.user_id = u.id
		WHERE ($1 = '' OR wr.status = $1)
		ORDER BY wr.requested_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(query, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error fetching recharge requests: %w", err)
	}
	defer rows.Close()

	var requests []models.WalletRequest
	for rows.Next() {
		var req models.WalletRequest
		var email, fullName string
		err := rows.Scan(
			&req.ID,
			&req.UserID,
			&req.Amount,
			&req.PaymentReference,
			&req.PaymentProofURL,
			&req.Status,
			&req.RequestedAt,
			&req.ProcessedAt,
			&req.ProcessedBy,
			&req.AdminNotes,
			&email,
			&fullName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning request: %w", err)
		}
		requests = append(requests, req)
	}

	return requests, nil
}

// GetRechargeRequestByReference retrieves a recharge request by payment reference
func (r *Repository) GetRechargeRequestByReference(reference string) (*models.WalletRequest, error) {
	query := `
		SELECT id, user_id, amount, payment_reference, payment_proof_url,
		       status, requested_at, processed_at, processed_by, admin_notes
		FROM wallet_requests
		WHERE payment_reference = $1
		LIMIT 1
	`
	var req models.WalletRequest
	err := r.db.QueryRow(query, reference).Scan(
		&req.ID,
		&req.UserID,
		&req.Amount,
		&req.PaymentReference,
		&req.PaymentProofURL,
		&req.Status,
		&req.RequestedAt,
		&req.ProcessedAt,
		&req.ProcessedBy,
		&req.AdminNotes,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("request not found")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching request by reference: %w", err)
	}
	return &req, nil
}


// GetUserRechargeRequests retrieves recharge requests for a specific user
func (r *Repository) GetUserRechargeRequests(userID int) ([]models.WalletRequest, error) {
	query := `
		SELECT id, user_id, amount, payment_reference, payment_proof_url,
		       status, requested_at, processed_at, processed_by, admin_notes
		FROM wallet_requests
		WHERE user_id = $1
		ORDER BY requested_at DESC
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error fetching user requests: %w", err)
	}
	defer rows.Close()

	var requests []models.WalletRequest
	for rows.Next() {
		var req models.WalletRequest
		err := rows.Scan(
			&req.ID,
			&req.UserID,
			&req.Amount,
			&req.PaymentReference,
			&req.PaymentProofURL,
			&req.Status,
			&req.RequestedAt,
			&req.ProcessedAt,
			&req.ProcessedBy,
			&req.AdminNotes,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning request: %w", err)
		}
		requests = append(requests, req)
	}

	return requests, nil
}

// ApproveRechargeRequest approves a recharge request and credits wallet
func (r *Repository) ApproveRechargeRequest(requestID, adminID int, notes string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer tx.Rollback()

	// Get request details
	var userID int
	var amount float64
	var status string
	query := `SELECT user_id, amount, status FROM wallet_requests WHERE id = $1`
	err = tx.QueryRow(query, requestID).Scan(&userID, &amount, &status)
	if err != nil {
		return fmt.Errorf("error fetching request: %w", err)
	}

	if status != "pending" {
		return fmt.Errorf("request already processed")
	}

	// Update request status
	updateQuery := `
		UPDATE wallet_requests
		SET status = 'approved', processed_at = $1, processed_by = $2, admin_notes = $3
		WHERE id = $4
	`
	_, err = tx.Exec(updateQuery, time.Now(), adminID, notes, requestID)
	if err != nil {
		return fmt.Errorf("error updating request: %w", err)
	}

	// Credit wallet
	var currentBalance float64
	lockQuery := `SELECT main_balance FROM wallets WHERE user_id = $1 FOR UPDATE`
	err = tx.QueryRow(lockQuery, userID).Scan(&currentBalance)
	if err != nil {
		return fmt.Errorf("error locking wallet: %w", err)
	}

	newBalance := currentBalance + amount
	creditQuery := `UPDATE wallets SET main_balance = $1, updated_at = $2 WHERE user_id = $3`
	_, err = tx.Exec(creditQuery, newBalance, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("error crediting wallet: %w", err)
	}

	// Record transaction
	ledgerQuery := `
		INSERT INTO wallet_transactions 
		(user_id, transaction_type, wallet_type, amount, balance_before, balance_after, 
		 reference_id, description, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err = tx.Exec(
		ledgerQuery,
		userID,
		"credit",
		"main",
		amount,
		currentBalance,
		newBalance,
		fmt.Sprintf("RECHARGE-%d", requestID),
		fmt.Sprintf("Wallet recharge approved by admin"),
		"completed",
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("error recording transaction: %w", err)
	}

	return tx.Commit()
}

// RejectRechargeRequest rejects a recharge request
func (r *Repository) RejectRechargeRequest(requestID, adminID int, notes string) error {
	query := `
		UPDATE wallet_requests
		SET status = 'rejected', processed_at = $1, processed_by = $2, admin_notes = $3
		WHERE id = $4 AND status = 'pending'
	`
	result, err := r.db.Exec(query, time.Now(), adminID, notes, requestID)
	if err != nil {
		return fmt.Errorf("error rejecting request: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("request not found or already processed")
	}

	return nil
}
