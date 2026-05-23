package wallet

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

// GetBalance retrieves wallet balance
func (h *Handler) GetBalance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	wallet, err := h.service.GetWalletBalance(userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallet": wallet,
		"balance": gin.H{
			"main_balance": wallet.MainBalance,
			"api_balance":  wallet.APIBalance,
			"total":        wallet.MainBalance + wallet.APIBalance,
		},
	})
}

// GetTransactionHistory retrieves transaction history
func (h *Handler) GetTransactionHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	transactions, err := h.service.GetTransactionHistory(userID.(int), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": transactions,
		"page":         page,
		"page_size":    pageSize,
	})
}

type RechargeRequest struct {
	Amount           float64 `json:"amount" binding:"required,gt=0"`
	PaymentReference string  `json:"payment_reference" binding:"required"`
	PaymentProofURL  string  `json:"payment_proof_url"`
}

// RequestRecharge creates a recharge request
func (h *Handler) RequestRecharge(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req RechargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	request, err := h.service.RequestRecharge(
		userID.(int),
		req.Amount,
		req.PaymentReference,
		req.PaymentProofURL,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Recharge request submitted successfully",
		"request": request,
	})
}

// GetUserRechargeRequests retrieves user's recharge requests
func (h *Handler) GetUserRechargeRequests(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requests, err := h.service.GetUserRechargeRequests(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"requests": requests,
	})
}

// GetAllRechargeRequests retrieves all recharge requests (admin only)
func (h *Handler) GetAllRechargeRequests(c *gin.Context) {
	status := c.DefaultQuery("status", "")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	requests, err := h.service.GetRechargeRequests(status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"requests":  requests,
		"page":      page,
		"page_size": pageSize,
	})
}

type ApproveRejectRequest struct {
	Notes string `json:"notes"`
}

// ApproveRecharge approves a recharge request (admin only)
func (h *Handler) ApproveRecharge(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requestID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	var req ApproveRejectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Notes = "Approved"
	}

	err = h.service.ApproveRecharge(requestID, adminID.(int), req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Recharge request approved successfully",
	})
}

// RejectRecharge rejects a recharge request (admin only)
func (h *Handler) RejectRecharge(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requestID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	var req ApproveRejectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Notes = "Rejected"
	}

	err = h.service.RejectRecharge(requestID, adminID.(int), req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Recharge request rejected",
	})
}

// CheckBalance checks if user has sufficient balance
func (h *Handler) CheckBalance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	amountStr := c.Query("amount")
	if amountStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount is required"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	hasSufficient, err := h.service.CheckBalance(userID.(int), amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"has_sufficient_balance": hasSufficient,
		"required_amount":        amount,
	})
}

type GatewayRechargeRequestPayload struct {
	Amount         float64 `json:"amount" binding:"required,gt=0"`
	CustomerMobile string  `json:"customer_mobile" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required"`
	RedirectURL    string  `json:"redirect_url" binding:"required"`
}

// InitiateGatewayRecharge handles payment gateway recharge
// @Summary Initiate Payment Gateway Recharge
// @Description Creates a new Mugavi payment gateway order and returns the payment URL and QR code.
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body GatewayRechargeRequestPayload true "Gateway Recharge Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /wallet/recharge/gateway [post]
func (h *Handler) InitiateGatewayRecharge(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req GatewayRechargeRequestPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data, err := h.service.InitiateGatewayRecharge(
		userID.(int),
		req.Amount,
		req.CustomerMobile,
		req.CustomerEmail,
		req.RedirectURL,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment initiated successfully",
		"data":    data,
	})
}

type MugaviWebhookPayload struct {
	OrderID       string  `json:"order_id" form:"order_id"`
	Status        string  `json:"status" form:"status"`
	TransactionID string  `json:"transaction_id" form:"transaction_id"`
	Amount        float64 `json:"amount" form:"amount"`
}

// GatewayWebhook handles incoming webhook callbacks from Mugavi
func (h *Handler) GatewayWebhook(c *gin.Context) {
	var payload MugaviWebhookPayload
	if err := c.ShouldBind(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For security, you might want to verify a webhook signature here 
	// if the gateway provides one.

	err := h.service.ProcessGatewayCallback(payload.OrderID, payload.TransactionID, payload.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed successfully"})
}

