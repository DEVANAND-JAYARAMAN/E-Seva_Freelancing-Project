package models

type CRMCustomer struct {
	PK         string `dynamodbav:"PK"`
	SK         string `dynamodbav:"SK"`
	Id         string `dynamodbav:"id"`
	Name       string `dynamodbav:"name"`
	ShopName   string `dynamodbav:"shopName"`
	Email      string `dynamodbav:"email"`
	Phone      string `dynamodbav:"phone"`
	City       string `dynamodbav:"city"`
	Type       string `dynamodbav:"type"`
	Status     string `dynamodbav:"status"`
	JoinedDate string `dynamodbav:"joinedDate"`
	CreatedAt  string `dynamodbav:"createdAt"`
	UpdatedAt  string `dynamodbav:"updatedAt"`
}
