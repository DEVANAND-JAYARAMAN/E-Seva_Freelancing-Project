-- Thuruvan Billing — AWS RDS (MySQL 8)
CREATE DATABASE IF NOT EXISTS thuruvan_billing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE thuruvan_billing;

CREATE TABLE shop (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL DEFAULT 'My Shop',
  tagline VARCHAR(160) NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(40) NULL,
  upi_id VARCHAR(80) NULL,
  bill_prefix VARCHAR(12) NOT NULL DEFAULT 'TC-',
  currency VARCHAR(5) NOT NULL DEFAULT '₹',
  last_bill_no INT NOT NULL DEFAULT 0,
  footer_note VARCHAR(160) DEFAULT 'Thank you! Visit again'
);

INSERT INTO shop (id, name, tagline, phone, bill_prefix) VALUES
(1, 'Thuruvan Communication', 'e-Sevai · CSC · Xerox', '9159456750', 'TC-');

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- password: password
INSERT INTO users (name, email, password_hash) VALUES
('Admin', 'admin@billing.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm/oeMW');

CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) DEFAULT 'General',
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active'
);

INSERT INTO services (name, category, rate) VALUES
('Xerox B/W (1 side)', 'Xerox', 2),
('Xerox Color (1 side)', 'Xerox', 5),
('Aadhaar Print', 'e-Sevai', 30),
('PAN Application', 'PAN', 120),
('Voter ID Apply', 'Voter ID', 50),
('Community Certificate', 'CSC', 60);

CREATE TABLE bills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bill_no VARCHAR(20) NOT NULL,
  customer_name VARCHAR(120) NOT NULL DEFAULT 'Walk-in',
  customer_mobile VARCHAR(20) NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  pay_mode VARCHAR(40) NOT NULL DEFAULT 'Cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bills_created (created_at)
);

CREATE TABLE bill_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bill_id INT NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  INDEX idx_bill_items_bill (bill_id)
);
