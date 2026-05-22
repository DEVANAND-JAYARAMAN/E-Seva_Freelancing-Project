package postgres

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

func Connect(connectionString string) (*DB, error) {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
	return &DB{db}, nil
}

func (db *DB) InitSchema() error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		full_name VARCHAR(255) NOT NULL,
		phone VARCHAR(20),
		role VARCHAR(50) NOT NULL DEFAULT 'retailer',
		status VARCHAR(50) NOT NULL DEFAULT 'pending',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		last_login TIMESTAMP,
		CONSTRAINT valid_role CHECK (role IN ('admin', 'distributor', 'retailer', 'customer')),
		CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'suspended', 'inactive'))
	);

	-- Wallet table
	CREATE TABLE IF NOT EXISTS wallets (
		id SERIAL PRIMARY KEY,
		user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		main_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
		api_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT positive_main_balance CHECK (main_balance >= 0),
		CONSTRAINT positive_api_balance CHECK (api_balance >= 0)
	);

	-- Wallet transactions ledger
	CREATE TABLE IF NOT EXISTS wallet_transactions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		transaction_type VARCHAR(50) NOT NULL,
		wallet_type VARCHAR(20) NOT NULL,
		amount DECIMAL(15, 2) NOT NULL,
		balance_before DECIMAL(15, 2) NOT NULL,
		balance_after DECIMAL(15, 2) NOT NULL,
		reference_id VARCHAR(255),
		description TEXT,
		status VARCHAR(50) DEFAULT 'completed',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('credit', 'debit', 'transfer', 'refund')),
		CONSTRAINT valid_wallet_type CHECK (wallet_type IN ('main', 'api'))
	);

	-- Wallet top-up requests
	CREATE TABLE IF NOT EXISTS wallet_requests (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		amount DECIMAL(15, 2) NOT NULL,
		payment_reference VARCHAR(255),
		payment_proof_url VARCHAR(500),
		status VARCHAR(50) DEFAULT 'pending',
		requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		processed_at TIMESTAMP,
		processed_by INTEGER REFERENCES users(id),
		admin_notes TEXT,
		CONSTRAINT valid_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
	);

	-- Refresh tokens table
	CREATE TABLE IF NOT EXISTS refresh_tokens (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		token VARCHAR(500) UNIQUE NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		revoked BOOLEAN DEFAULT FALSE
	);

	-- Audit logs
	CREATE TABLE IF NOT EXISTS audit_logs (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
		action VARCHAR(100) NOT NULL,
		resource_type VARCHAR(100),
		resource_id VARCHAR(100),
		ip_address VARCHAR(45),
		user_agent TEXT,
		details JSONB,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Create indexes for better performance
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
	CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
	CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);
	CREATE INDEX IF NOT EXISTS idx_wallet_requests_user_id ON wallet_requests(user_id);
	CREATE INDEX IF NOT EXISTS idx_wallet_requests_status ON wallet_requests(status);
	CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
	CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
	CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
	CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

	-- Create default admin user (password: admin123)
	INSERT INTO users (email, password_hash, full_name, role, status)
	VALUES ('admin@eservice.com', '$2a$10$YQs8qE5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'System Admin', 'admin', 'active')
	ON CONFLICT (email) DO NOTHING;
	`

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("error initializing schema: %w", err)
	}

	log.Println("Database schema initialized successfully")
	return nil
}
