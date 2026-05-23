package application

import (
	"eservice-backend/internal/models"
	"eservice-backend/internal/wallet"
	"fmt"
)

type Service struct {
	repo          *Repository
	walletService *wallet.Service
}

func NewService(repo *Repository, walletService *wallet.Service) *Service {
	return &Service{
		repo:          repo,
		walletService: walletService,
	}
}

// GetServiceTypes retrieves all available service types
func (s *Service) GetServiceTypes() ([]models.ServiceType, error) {
	return s.repo.GetServiceTypes()
}

// GetServiceTypeByID retrieves a specific service type
func (s *Service) GetServiceTypeByID(id int) (*models.ServiceType, error) {
	return s.repo.GetServiceTypeByID(id)
}

// SubmitApplication submits a new application and deducts charge from wallet
func (s *Service) SubmitApplication(userID int, serviceTypeID int, applicationData, documentURLs string) (*models.Application, error) {
	// Get service type details
	serviceType, err := s.repo.GetServiceTypeByID(serviceTypeID)
	if err != nil {
		return nil, fmt.Errorf("invalid service type: %w", err)
	}

	if !serviceType.IsActive {
		return nil, fmt.Errorf("service type is not active")
	}

	// Check wallet balance
	hasSufficient, err := s.walletService.CheckBalance(userID, serviceType.Charge)
	if err != nil {
		return nil, fmt.Errorf("error checking balance: %w", err)
	}

	if !hasSufficient {
		return nil, fmt.Errorf("insufficient wallet balance: required ₹%.2f", serviceType.Charge)
	}

	// Create application
	app := &models.Application{
		UserID:          userID,
		ServiceTypeID:   serviceType.ID,
		ServiceCode:     serviceType.Code,
		ServiceName:     serviceType.Name,
		ServiceCharge:   serviceType.Charge,
		ApplicationData: applicationData,
		DocumentURLs:    documentURLs,
		Status:          models.ApplicationStatusPending,
	}

	err = s.repo.CreateApplication(app)
	if err != nil {
		return nil, fmt.Errorf("error creating application: %w", err)
	}

	// Deduct service charge from wallet
	err = s.walletService.DeductServiceCharge(
		userID,
		serviceType.Name,
		serviceType.Charge,
		fmt.Sprintf("APP-%d", app.ID),
	)
	if err != nil {
		// Application created but charge deduction failed
		// In production, you might want to mark application as "payment_pending"
		return nil, fmt.Errorf("application created but charge deduction failed: %w", err)
	}

	return app, nil
}

// GetUserApplications retrieves applications for a user
func (s *Service) GetUserApplications(userID int, page, pageSize int) ([]models.Application, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	return s.repo.GetUserApplications(userID, pageSize, offset)
}

// GetAllApplications retrieves all applications (admin)
func (s *Service) GetAllApplications(status string, page, pageSize int) ([]models.Application, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	return s.repo.GetAllApplications(status, pageSize, offset)
}

// GetApplicationByID retrieves a specific application
func (s *Service) GetApplicationByID(id int) (*models.Application, error) {
	return s.repo.GetApplicationByID(id)
}

// UpdateApplicationStatus updates application status (admin)
func (s *Service) UpdateApplicationStatus(id int, status string, adminID int, notes string) error {
	// Validate status
	validStatuses := map[string]bool{
		models.ApplicationStatusPending:    true,
		models.ApplicationStatusProcessing: true,
		models.ApplicationStatusCompleted:  true,
		models.ApplicationStatusRejected:   true,
		models.ApplicationStatusResubmit:   true,
	}

	if !validStatuses[status] {
		return fmt.Errorf("invalid status: %s", status)
	}

	return s.repo.UpdateApplicationStatus(id, status, adminID, notes)
}
