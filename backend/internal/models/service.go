package models

import "time"

// ServiceType represents different e-services available
type ServiceType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	Charge      float64   `json:"charge"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Application represents an e-service application
type Application struct {
	ID              int        `json:"id"`
	UserID          int        `json:"user_id"`
	ServiceTypeID   int        `json:"service_type_id"`
	ServiceCode     string     `json:"service_code"`
	ServiceName     string     `json:"service_name"`
	ServiceCharge   float64    `json:"service_charge"`
	ApplicationData string     `json:"application_data"` // JSON data
	Status          string     `json:"status"`
	DocumentURLs    string     `json:"document_urls"` // JSON array of URLs
	AdminNotes      string     `json:"admin_notes"`
	SubmittedAt     time.Time  `json:"submitted_at"`
	ProcessedAt     *time.Time `json:"processed_at,omitempty"`
	ProcessedBy     *int       `json:"processed_by,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// ApplicationStatus constants
const (
	ApplicationStatusPending    = "pending"
	ApplicationStatusProcessing = "processing"
	ApplicationStatusCompleted  = "completed"
	ApplicationStatusRejected   = "rejected"
	ApplicationStatusResubmit   = "resubmit"
)
