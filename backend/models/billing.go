package models

type Invoice struct {
	PK            string  `dynamodbav:"PK" json:"PK"`
	SK            string  `dynamodbav:"SK" json:"SK"`
	Id            string  `dynamodbav:"id" json:"id"`
	InvoiceNumber string  `dynamodbav:"invoiceNumber" json:"invoiceNumber"`
	RetailerName  string  `dynamodbav:"retailerName" json:"retailerName"`
	Amount        float64 `dynamodbav:"amount" json:"amount"`
	Date          string  `dynamodbav:"date" json:"date"`
	DueDate       string  `dynamodbav:"dueDate" json:"dueDate"`
	Status        string  `dynamodbav:"status" json:"status"`
	UtrNumber     string  `dynamodbav:"utrNumber" json:"utrNumber"`
	Category      string  `dynamodbav:"category" json:"category"`
	CreatedAt     string  `dynamodbav:"createdAt" json:"createdAt"`
	UpdatedAt     string  `dynamodbav:"updatedAt" json:"updatedAt"`
}
