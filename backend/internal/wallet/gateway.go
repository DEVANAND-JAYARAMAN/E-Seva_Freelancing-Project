package wallet

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	MugaviBaseURL  = "https://mugavaipaymentgetway.in/api/v1"
	MugaviUsername = "6380616163"
	MugaviAPIKey   = "enCJ5EKHzcSRqBP8"
)

type MugaviPaymentRequest struct {
	Amount         float64 `json:"amount"`
	CustomerMobile string  `json:"customer_mobile"`
	CustomerEmail  string  `json:"customer_email"`
	OrderID        string  `json:"order_id"`
	RedirectURL    string  `json:"redirect_url"`
}

type MugaviPaymentResponseData struct {
	Amount         float64 `json:"amount"`
	CustomerMobile string  `json:"customer_mobile"`
	CustomerEmail  string  `json:"customer_email"`
	OrderID        string  `json:"order_id"`
	PaymentURL     string  `json:"payment_url"`
	QRImage        string  `json:"qr_image"`
}

type MugaviPaymentResponse struct {
	Status  string                    `json:"status"`
	Message string                    `json:"message"`
	Data    MugaviPaymentResponseData `json:"data"`
}

// CreateMugaviOrder creates an order using Mugavi Payment Gateway
func CreateMugaviOrder(req MugaviPaymentRequest) (*MugaviPaymentResponse, error) {
	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", MugaviBaseURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.SetBasicAuth(MugaviUsername, MugaviAPIKey)
	httpReq.Header.Set("username", MugaviUsername)
	httpReq.Header.Set("api_key", MugaviAPIKey)

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to payment gateway: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("payment gateway returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var paymentResp MugaviPaymentResponse
	if err := json.Unmarshal(bodyBytes, &paymentResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w. Body: %s", err, string(bodyBytes))
	}

	if paymentResp.Status != "success" {
		return &paymentResp, fmt.Errorf("payment gateway error: %s", paymentResp.Message)
	}

	return &paymentResp, nil
}
