package models

type ServiceApplication struct {
	PK           string  `dynamodbav:"PK"`
	SK           string  `dynamodbav:"SK"`
	Id           string  `dynamodbav:"id"`
	RetailerId   string  `dynamodbav:"retailerId"`
	ServiceId    string  `dynamodbav:"serviceId"`
	ServiceName  string  `dynamodbav:"serviceName"`
	Cost             float64           `dynamodbav:"cost"`
	CustomerWhatsApp string            `dynamodbav:"customerWhatsApp"`
	FormData         map[string]string `dynamodbav:"formData"`
	Documents        []string          `dynamodbav:"documents"`
	Status           string            `dynamodbav:"status"` // Pending, Approved, Rejected, Completed
	CreatedDate      string            `dynamodbav:"createdDate"`
	LastUpdated      string            `dynamodbav:"lastUpdated"`
}

type Wallet struct {
	PK          string  `dynamodbav:"PK"`
	SK          string  `dynamodbav:"SK"`
	UserId      string  `dynamodbav:"userId"`
	Balance     float64 `dynamodbav:"balance"`
	UpdatedAt   string  `dynamodbav:"updatedAt"`
}

type WalletTransaction struct {
	PK         string  `dynamodbav:"PK"`
	SK         string  `dynamodbav:"SK"`
	Id         string  `dynamodbav:"id"`
	WalletType string  `dynamodbav:"walletType"` // Retailer or Distributor
	Amount     float64 `dynamodbav:"amount"`
	Type       string  `dynamodbav:"type"`       // Debit or Credit
	Status     string  `dynamodbav:"status"`     // Success or Failure
	Reference  string  `dynamodbav:"reference"`  // ServiceApp ID
	CreatedAt  string  `dynamodbav:"createdAt"`
}
