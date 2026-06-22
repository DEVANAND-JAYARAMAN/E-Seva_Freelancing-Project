package models

type CRMCustomer struct {
	PK         string `dynamodbav:"PK" json:"PK"`
	SK         string `dynamodbav:"SK" json:"SK"`
	Id         string `dynamodbav:"id" json:"id"`
	Name       string `dynamodbav:"name" json:"name"`
	ShopName   string `dynamodbav:"shopName" json:"shopName"`
	Email      string `dynamodbav:"email" json:"email"`
	Phone      string `dynamodbav:"phone" json:"phone"`
	City       string `dynamodbav:"city" json:"city"`
	Type       string `dynamodbav:"type" json:"type"`
	Status     string `dynamodbav:"status" json:"status"`
	JoinedDate string `dynamodbav:"joinedDate" json:"joinedDate"`
	CreatedAt  string `dynamodbav:"createdAt" json:"createdAt"`
	UpdatedAt  string `dynamodbav:"updatedAt" json:"updatedAt"`
}
