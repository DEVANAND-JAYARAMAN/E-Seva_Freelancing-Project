package auth

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

func (r *Repository) CreateUser(user *models.User) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO users (email, password_hash, full_name, phone, role, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRow(
		query,
		user.Email,
		user.PasswordHash,
		user.FullName,
		user.Phone,
		user.Role,
		user.Status,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("error creating user: %w", err)
	}

	// Create wallet for the user
	walletQuery := `
		INSERT INTO wallets (user_id, main_balance, api_balance)
		VALUES ($1, 0.00, 0.00)
	`
	_, err = tx.Exec(walletQuery, user.ID)
	if err != nil {
		return fmt.Errorf("error creating wallet: %w", err)
	}

	// Create initial transaction ledger record
	ledgerQuery := `
		INSERT INTO wallet_transactions 
		(user_id, transaction_type, wallet_type, amount, balance_before, balance_after, description, status)
		VALUES ($1, 'credit', 'main', 0.00, 0.00, 0.00, 'Wallet initialized on account creation', 'completed')
	`
	_, err = tx.Exec(ledgerQuery, user.ID)
	if err != nil {
		return fmt.Errorf("error creating initial wallet transaction: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, password_hash, full_name, phone, role, status, 
		       created_at, updated_at, last_login
		FROM users
		WHERE email = $1
	`
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching user: %w", err)
	}

	return user, nil
}

func (r *Repository) GetUserByID(id int) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, password_hash, full_name, phone, role, status, 
		       created_at, updated_at, last_login
		FROM users
		WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching user: %w", err)
	}

	return user, nil
}

func (r *Repository) UpdateLastLogin(userID int) error {
	query := `UPDATE users SET last_login = $1 WHERE id = $2`
	_, err := r.db.Exec(query, time.Now(), userID)
	return err
}

func (r *Repository) SaveRefreshToken(userID int, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err := r.db.Exec(query, userID, token, expiresAt)
	return err
}

func (r *Repository) GetRefreshToken(token string) (int, error) {
	var userID int
	var expiresAt time.Time
	var revoked bool

	query := `
		SELECT user_id, expires_at, revoked
		FROM refresh_tokens
		WHERE token = $1
	`
	err := r.db.QueryRow(query, token).Scan(&userID, &expiresAt, &revoked)

	if err == sql.ErrNoRows {
		return 0, fmt.Errorf("invalid refresh token")
	}
	if err != nil {
		return 0, err
	}

	if revoked {
		return 0, fmt.Errorf("refresh token has been revoked")
	}

	if time.Now().After(expiresAt) {
		return 0, fmt.Errorf("refresh token has expired")
	}

	return userID, nil
}

func (r *Repository) RevokeRefreshToken(token string) error {
	query := `UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1`
	_, err := r.db.Exec(query, token)
	return err
}

func (r *Repository) RevokeAllUserTokens(userID int) error {
	query := `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}
