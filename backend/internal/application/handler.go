package application

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetServiceTypes retrieves all available service types
func (h *Handler) GetServiceTypes(c *gin.Context) {
	services, err := h.service.GetServiceTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch service types"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"services": services,
	})
}

// GetServiceType retrieves a specific service type
func (h *Handler) GetServiceType(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	service, err := h.service.GetServiceTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service type not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"service": service,
	})
}

type SubmitApplicationRequest struct {
	ServiceTypeID   int    `json:"service_type_id" binding:"required"`
	ApplicationData string `json:"application_data" binding:"required"`
	DocumentURLs    string `json:"document_urls"`
}

// SubmitApplication submits a new application
func (h *Handler) SubmitApplication(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req SubmitApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	application, err := h.service.SubmitApplication(
		userID.(int),
		req.ServiceTypeID,
		req.ApplicationData,
		req.DocumentURLs,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Application submitted successfully",
		"application": application,
	})
}

// GetUserApplications retrieves user's applications
func (h *Handler) GetUserApplications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	applications, err := h.service.GetUserApplications(userID.(int), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
		"page":         page,
		"page_size":    pageSize,
	})
}

// GetAllApplications retrieves all applications (admin)
func (h *Handler) GetAllApplications(c *gin.Context) {
	status := c.DefaultQuery("status", "")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	applications, err := h.service.GetAllApplications(status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
		"page":         page,
		"page_size":    pageSize,
	})
}

// GetApplication retrieves a specific application
func (h *Handler) GetApplication(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application ID"})
		return
	}

	application, err := h.service.GetApplicationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// Check if user has permission to view this application
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	if userRole != "admin" && application.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"application": application,
	})
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
	Notes  string `json:"notes"`
}

// UpdateApplicationStatus updates application status (admin)
func (h *Handler) UpdateApplicationStatus(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application ID"})
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.service.UpdateApplicationStatus(id, req.Status, adminID.(int), req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Application status updated successfully",
	})
}
