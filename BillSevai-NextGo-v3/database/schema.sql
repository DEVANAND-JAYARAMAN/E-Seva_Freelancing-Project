-- BillSevai v3 — Next.js + Golang + AWS RDS (MySQL 8)
CREATE DATABASE IF NOT EXISTS billsevai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE billsevai;

CREATE TABLE shops (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  tagline VARCHAR(160) NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(40) NULL,
  gstin VARCHAR(20) NULL,
  currency VARCHAR(5) NOT NULL DEFAULT '₹',
  bill_prefix VARCHAR(12) NOT NULL DEFAULT 'BS-',
  last_bill_no INT NOT NULL DEFAULT 0,
  footer_note VARCHAR(255) NULL DEFAULT 'Thank you! Visit again.',
  brand_color VARCHAR(20) NULL DEFAULT '#0e7c66',
  upi_id VARCHAR(80) NULL,
  print_format VARCHAR(20) NOT NULL DEFAULT 'thermal',
  plan VARCHAR(20) NOT NULL DEFAULT 'trial',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  trial_ends_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shop_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shop_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'General',
  counter VARCHAR(40) NOT NULL DEFAULT 'default',
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_services_shop (shop_id)
);

CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shop_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  credit_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_customers_shop (shop_id)
);

CREATE TABLE bills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shop_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  customer_id BIGINT NULL,
  bill_no VARCHAR(30) NOT NULL,
  customer_name VARCHAR(120) NOT NULL DEFAULT 'Walk-in',
  customer_mobile VARCHAR(20) NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  pay_mode VARCHAR(40) NOT NULL DEFAULT 'Cash',
  status VARCHAR(30) NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_bills_shop_date (shop_id, created_at)
);

CREATE TABLE bill_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bill_id BIGINT NOT NULL,
  service_id BIGINT NULL,
  name VARCHAR(120) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  item_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  INDEX idx_bill_items_bill (bill_id)
);

-- Demo shop (same login as BillSevai Laravel)
INSERT INTO shops (id, name, slug, tagline, phone, bill_prefix, trial_ends_at) VALUES
(1, 'Thuruvan Communication', 'thuruvan-communication', 'e-Sevai · CSC · Xerox', '9159456750', 'TC-', DATE_ADD(NOW(), INTERVAL 14 DAY));

-- password: password ($2y$ works with Go bcrypt)
INSERT INTO users (shop_id, name, email, password_hash, role) VALUES
(1, 'Shop Owner', 'owner@demo.test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm/oeMW', 'owner');

INSERT INTO services (shop_id, name, category, rate) VALUES
(1, 'Xerox B/W (1 side)', 'Xerox Work', 2),
(1, 'Xerox Color (1 side)', 'Xerox Work', 5),
(1, 'Aadhaar Print', 'Aadhaar', 30),
(1, 'Community Certificate', 'e-Sevai / CSC', 60),
(1, 'PAN Application', 'PAN', 120);
