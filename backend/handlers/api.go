package handlers

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Models

type ServiceApplication struct {
	ApplicationID string                 `json:"applicationId"`
	ServiceID     string                 `json:"serviceId"`
	ServiceName   string                 `json:"serviceName"`
	RetailerID    string                 `json:"retailerId"`
	RetailerName  string                 `json:"retailerName"`
	Status        string                 `json:"status"`
	Amount        float64                `json:"amount"`
	FormData      map[string]interface{} `json:"formData"`
	CreatedDate   string                 `json:"createdDate"`
}

type Notification struct {
	ID        string `json:"id"`
	Type      string `json:"type"` // "NEW_REQUEST", "NEW_RETAILER"
	Message   string `json:"message"`
	IsRead    bool   `json:"isRead"`
	CreatedAt string `json:"createdAt"`
}

// In-Memory Storage for Demo (Would use DynamoDB in production)
var (
	applications  []ServiceApplication
	notifications []Notification
	clients       = make(map[*websocket.Conn]bool)
	broadcast     = make(chan Notification)
	mu            sync.Mutex
)

// WebSocket Upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for admin dashboard
	},
}

// Start a goroutine to handle broadcasting to WebSocket clients
func init() {
	go func() {
		for {
			notification := <-broadcast
			mu.Lock()
			for client := range clients {
				err := client.WriteJSON(notification)
				if err != nil {
					client.Close()
					delete(clients, client)
				}
			}
			mu.Unlock()
		}
	}()
}

// @Summary Submit a Service Request
// @Description Retailer or Distributor submits a new service request application
// @Tags Services
// @Accept json
// @Produce json
// @Param request body ServiceApplication true "Service Application Data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /services/request [post]
func SubmitServiceRequest(c *gin.Context) {
	var req ServiceApplication
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ApplicationID = uuid.New().String()
	req.Status = "Pending"
	req.CreatedDate = time.Now().Format(time.RFC3339)

	// Save to DB
	mu.Lock()
	applications = append([]ServiceApplication{req}, applications...) // Add to front
	mu.Unlock()

	// Trigger Notification for Admin
	notify := Notification{
		ID:        uuid.New().String(),
		Type:      "NEW_REQUEST",
		Message:   "New service request for " + req.ServiceName + " submitted by " + req.RetailerName,
		IsRead:    false,
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	
	mu.Lock()
	notifications = append([]Notification{notify}, notifications...)
	mu.Unlock()
	
	broadcast <- notify // Send realtime

	c.JSON(http.StatusOK, gin.H{"message": "Request submitted successfully", "applicationId": req.ApplicationID})
}

// @Summary Get Admin Service Requests
// @Description Fetch all service requests simultaneously for Admin Panel
// @Tags Admin
// @Produce json
// @Success 200 {array} ServiceApplication
// @Router /admin/requests [get]
func GetAdminServiceRequests(c *gin.Context) {
	mu.Lock()
	defer mu.Unlock()
	c.JSON(http.StatusOK, applications)
}

// @Summary Add Retailer or Distributor
// @Description Add a new Retailer or Distributor and trigger a notification
// @Tags Admin
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "User Data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /admin/retailer [post]
func AddRetailerOrDistributor(c *gin.Context) {
	var user struct {
		Name string `json:"name"`
		Type string `json:"type"` // "retailer" or "distributor"
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Logic to save user to DB...

	// Trigger Notification for Admin
	notify := Notification{
		ID:        uuid.New().String(),
		Type:      "NEW_RETAILER",
		Message:   "New " + user.Type + " onboarded: " + user.Name,
		IsRead:    false,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	mu.Lock()
	notifications = append([]Notification{notify}, notifications...)
	mu.Unlock()

	broadcast <- notify // Send realtime

	c.JSON(http.StatusOK, gin.H{"message": "User added successfully"})
}

// @Summary Get Notifications
// @Description Get a list of notifications for the Admin Panel
// @Tags Admin
// @Produce json
// @Success 200 {array} Notification
// @Router /admin/notifications [get]
func GetNotifications(c *gin.Context) {
	mu.Lock()
	defer mu.Unlock()
	c.JSON(http.StatusOK, notifications)
}

// 5. WebSocket Connection for In-App Popup Notifications
func NotificationsWS(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer ws.Close()

	mu.Lock()
	clients[ws] = true
	mu.Unlock()

	// Keep connection alive
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			mu.Lock()
			delete(clients, ws)
			mu.Unlock()
			break
		}
	}
}
