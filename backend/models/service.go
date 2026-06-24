package models

type ServiceApplication struct {
	PK               string            `dynamodbav:"PK" json:"PK"`
	SK               string            `dynamodbav:"SK" json:"SK"`
	Id               string            `dynamodbav:"id" json:"id"`
	RetailerId       string            `dynamodbav:"retailerId" json:"retailerId"`
	ServiceId        string            `dynamodbav:"serviceId" json:"serviceId"`
	ServiceName      string            `dynamodbav:"serviceName" json:"serviceName"`
	Cost             float64           `dynamodbav:"cost" json:"cost"`
	CustomerWhatsApp string            `dynamodbav:"customerWhatsApp" json:"customerWhatsApp"`
	FormData         map[string]string `dynamodbav:"formData" json:"formData"`
	Documents        []string          `dynamodbav:"documents" json:"documents"`
	Status           string            `dynamodbav:"status" json:"status"` // Pending, Approved, Rejected, Completed
	AdminRemarks     string            `dynamodbav:"adminRemarks" json:"adminRemarks"`
	AckFiles         []string          `dynamodbav:"ackFiles" json:"ackFiles"`
	CreatedDate      string            `dynamodbav:"createdDate" json:"createdDate"`
	LastUpdated      string            `dynamodbav:"lastUpdated" json:"lastUpdated"`
}

type Wallet struct {
	PK        string  `dynamodbav:"PK" json:"PK"`
	SK        string  `dynamodbav:"SK" json:"SK"`
	UserId    string  `dynamodbav:"userId" json:"userId"`
	Balance   float64 `dynamodbav:"balance" json:"balance"`
	UpdatedAt string  `dynamodbav:"updatedAt" json:"updatedAt"`
}

type WalletTransaction struct {
	PK         string  `dynamodbav:"PK" json:"PK"`
	SK         string  `dynamodbav:"SK" json:"SK"`
	Id         string  `dynamodbav:"id" json:"id"`
	WalletType string  `dynamodbav:"walletType" json:"walletType"` // Retailer or Distributor
	Amount     float64 `dynamodbav:"amount" json:"amount"`
	Type       string  `dynamodbav:"type" json:"type"`           // Debit or Credit
	Status     string  `dynamodbav:"status" json:"status"`       // Success or Failure
	Reference  string  `dynamodbav:"reference" json:"reference"` // ServiceApp ID
	CreatedAt  string  `dynamodbav:"createdAt" json:"createdAt"`
}
