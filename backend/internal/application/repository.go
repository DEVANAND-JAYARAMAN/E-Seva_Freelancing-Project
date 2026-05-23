package application

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

// GetServiceTypes retrieves all active service types
func (r *Repository) GetServiceTypes() ([]models.ServiceType, error) {
	query := `
		SELECT id, name, code, description, charge, is_active, created_at, updated_at
		FROM service_types
		WHERE is_active = true
		ORDER BY name
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error fetching service types: %w", err)
	}
	defer rows.Close()

	var services []models.ServiceType
	for rows.Next() {
		var s models.ServiceType
		err := rows.Scan(
			&s.ID,
			&s.Name,
			&s.Code,
			&s.Description,
			&s.Charge,
			&s.IsActive,
			&s.CreatedAt,
			&s.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning service type: %w", err)
		}
		services = append(services, s)
	}

	return services, nil
}

// GetServiceTypeByID retrieves a specific service type
func (r *Repository) GetServiceTypeByID(id int) (*models.ServiceType, error) {
	service := &models.ServiceType{}
	query := `
		SELECT id, name, code, description, charge, is_active, created_at, updated_at
		FROM service_types
		WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&service.ID,
		&service.Name,
		&service.Code,
		&service.Description,
		&service.Charge,
		&service.IsActive,
		&service.CreatedAt,
		&service.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("service type not found")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching service type: %w", err)
	}

	return service, nil
}

// CreateApplication creates a new application
func (r *Repository) CreateApplication(app *models.Application) error {
	query := `
		INSERT INTO applications 
		(user_id, service_type_id, service_code, service_name, service_charge, 
		 application_data, document_urls, status, submitted_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(
		query,
		app.UserID,
		app.ServiceTypeID,
		app.ServiceCode,
		app.ServiceName,
		app.ServiceCharge,
		app.ApplicationData,
		app.DocumentURLs,
		models.ApplicationStatusPending,
		time.Now(),
	).Scan(&app.ID, &app.CreatedAt, &app.UpdatedAt)

	return err
}

// GetApplicationByID retrieves an application by ID
func (r *Repository) GetApplicationByID(id int) (*models.Application, error) {
	app := &models.Application{}
	query := `
		SELECT id, user_id, service_type_id, service_code, service_name, service_charge,
		       application_data, status, document_urls, admin_notes, submitted_at,
		       processed_at, processed_by, created_at, updated_at
		FROM applications
		WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&app.ID,
		&app.UserID,
		&app.ServiceTypeID,
		&app.ServiceCode,
		&app.ServiceName,
		&app.ServiceCharge,
		&app.ApplicationData,
		&app.Status,
		&app.DocumentURLs,
		&app.AdminNotes,
		&app.SubmittedAt,
		&app.ProcessedAt,
		&app.ProcessedBy,
		&app.CreatedAt,
		&app.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("application not found")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching application: %w", err)
	}

	return app, nil
}

// GetUserApplications retrieves applications for a specific user
func (r *Repository) GetUserApplications(userID int, limit, offset int) ([]models.Application, error) {
	query := `
		SELECT id, user_id, service_type_id, service_code, service_name, service_charge,
		       application_data, status, document_urls, admin_notes, submitted_at,
		       processed_at, processed_by, created_at, updated_at
		FROM applications
		WHERE user_id = $1
		ORDER BY submitted_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error fetching applications: %w", err)
	}
	defer rows.Close()

	var applications []models.Application
	for rows.Next() {
		var app models.Application
		err := rows.Scan(
			&app.ID,
			&app.UserID,
			&app.ServiceTypeID,
			&app.ServiceCode,
			&app.ServiceName,
			&app.ServiceCharge,
			&app.ApplicationData,
			&app.Status,
			&app.DocumentURLs,
			&app.AdminNotes,
			&app.SubmittedAt,
			&app.ProcessedAt,
			&app.ProcessedBy,
			&app.CreatedAt,
			&app.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning application: %w", err)
		}
		applications = append(applications, app)
	}

	return applications, nil
}

// GetAllApplications retrieves all applications (admin view)
func (r *Repository) GetAllApplications(status string, limit, offset int) ([]models.Application, error) {
	query := `
		SELECT a.id, a.user_id, a.service_type_id, a.service_code, a.service_name, a.service_charge,
		       a.application_data, a.status, a.document_urls, a.admin_notes, a.submitted_at,
		       a.processed_at, a.processed_by, a.created_at, a.updated_at,
		       u.email, u.full_name
		FROM applications a
		JOIN users u ON a.user_id = u.id
		WHERE ($1 = '' OR a.status = $1)
		ORDER BY a.submitted_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(query, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error fetching applications: %w", err)
	}
	defer rows.Close()

	var applications []models.Application
	for rows.Next() {
		var app models.Application
		var email, fullName string
		err := rows.Scan(
			&app.ID,
			&app.UserID,
			&app.ServiceTypeID,
			&app.ServiceCode,
			&app.ServiceName,
			&app.ServiceCharge,
			&app.ApplicationData,
			&app.Status,
			&app.DocumentURLs,
			&app.AdminNotes,
			&app.SubmittedAt,
			&app.ProcessedAt,
			&app.ProcessedBy,
			&app.CreatedAt,
			&app.UpdatedAt,
			&email,
			&fullName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning application: %w", err)
		}
		applications = append(applications, app)
	}

	return applications, nil
}

// UpdateApplicationStatus updates application status
func (r *Repository) UpdateApplicationStatus(id int, status string, adminID int, notes string) error {
	query := `
		UPDATE applications
		SET status = $1, processed_at = $2, processed_by = $3, admin_notes = $4, updated_at = $5
		WHERE id = $6
	`
	result, err := r.db.Exec(query, status, time.Now(), adminID, notes, time.Now(), id)
	if err != nil {
		return fmt.Errorf("error updating application: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("application not found")
	}

	return nil
}
