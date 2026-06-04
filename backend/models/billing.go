package models

type Invoice struct {
	PK            string  `dynamodbav:"PK"`
	SK            string  `dynamodbav:"SK"`
	Id            string  `dynamodbav:"id"`
	InvoiceNumber string  `dynamodbav:"invoiceNumber"`
	RetailerName  string  `dynamodbav:"retailerName"`
	Amount        float64 `dynamodbav:"amount"`
	Date          string  `dynamodbav:"date"`
	DueDate       string  `dynamodbav:"dueDate"`
	Status        string  `dynamodbav:"status"`
	UtrNumber     string  `dynamodbav:"utrNumber"`
	Category      string  `dynamodbav:"category"`
	CreatedAt     string  `dynamodbav:"createdAt"`
	UpdatedAt     string  `dynamodbav:"updatedAt"`
}
