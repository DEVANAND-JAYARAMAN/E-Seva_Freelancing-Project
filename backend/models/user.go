package models

type User struct {
	PK           string `dynamodbav:"PK"`
	SK           string `dynamodbav:"SK"`
	UserId       string `dynamodbav:"userId"`
	FullName     string `dynamodbav:"name"`
	Email        string `dynamodbav:"email"`
	Mobile       string `dynamodbav:"mobile"`
	Role         string `dynamodbav:"role"`
	PasswordHash  string  `dynamodbav:"passwordHash" json:"-"`
	Status        string  `dynamodbav:"status" json:"status"`
	WalletBalance float64 `dynamodbav:"walletBalance" json:"walletBalance"`
	CreatedAt     string  `dynamodbav:"createdAt" json:"createdAt"`
	UpdatedAt     string  `dynamodbav:"updatedAt" json:"updatedAt"`
}

type Retailer struct {
	PK          string `dynamodbav:"PK"`
	SK          string `dynamodbav:"SK"`
	Id          string `dynamodbav:"id"`
	Name        string `dynamodbav:"name"`
	Email       string `dynamodbav:"email"`
	Phone       string `dynamodbav:"phone"`
	Status      string `dynamodbav:"status"`
	CreatedDate string `dynamodbav:"createdDate"`
	UpdatedAt   string `dynamodbav:"updatedAt"`
}

type Distributor struct {
	PK          string `dynamodbav:"PK"`
	SK          string `dynamodbav:"SK"`
	Id          string `dynamodbav:"id"`
	Name        string `dynamodbav:"name"`
	Email       string `dynamodbav:"email"`
	Phone       string `dynamodbav:"phone"`
	Status      string `dynamodbav:"status"`
	CreatedDate string `dynamodbav:"createdDate"`
	UpdatedAt   string `dynamodbav:"updatedAt"`
}
