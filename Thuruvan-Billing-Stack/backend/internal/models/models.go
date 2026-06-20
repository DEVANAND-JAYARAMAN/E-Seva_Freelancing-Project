package models

import "time"

type Shop struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Tagline     *string `json:"tagline"`
	Address     *string `json:"address"`
	Phone       *string `json:"phone"`
	UPIID       *string `json:"upi_id"`
	BillPrefix  string  `json:"bill_prefix"`
	Currency    string  `json:"currency"`
	LastBillNo  int     `json:"last_bill_no"`
	FooterNote  *string `json:"footer_note"`
}

type Service struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Rate     float64 `json:"rate"`
	Status   string  `json:"status"`
}

type BillItem struct {
	ID          int     `json:"id,omitempty"`
	ServiceName string  `json:"service_name"`
	Rate        float64 `json:"rate"`
	Qty         int     `json:"qty"`
	Amount      float64 `json:"amount"`
}

type Bill struct {
	ID             int        `json:"id"`
	BillNo         string     `json:"bill_no"`
	CustomerName   string     `json:"customer_name"`
	CustomerMobile *string    `json:"customer_mobile"`
	Subtotal       float64    `json:"subtotal"`
	Discount       float64    `json:"discount"`
	Total          float64    `json:"total"`
	PayMode        string     `json:"pay_mode"`
	CreatedAt      time.Time  `json:"created_at"`
	Items          []BillItem `json:"items,omitempty"`
}

type CreateBillRequest struct {
	CustomerName   string `json:"customer_name"`
	CustomerMobile string `json:"customer_mobile"`
	PayMode        string `json:"pay_mode"`
	Discount       float64 `json:"discount"`
	Items          []struct {
		Name string  `json:"name"`
		Rate float64 `json:"rate"`
		Qty  int     `json:"qty"`
	} `json:"items"`
}
