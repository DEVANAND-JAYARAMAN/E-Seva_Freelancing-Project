package models

type User struct {
	PK            string  `dynamodbav:"PK" json:"PK"`
	SK            string  `dynamodbav:"SK" json:"SK"`
	UserId        string  `dynamodbav:"userId" json:"userId"`
	FullName      string  `dynamodbav:"name" json:"name"`
	Email         string  `dynamodbav:"email" json:"email"`
	Mobile        string  `dynamodbav:"mobile" json:"mobile"`
	Role          string  `dynamodbav:"role" json:"role"`
	PasswordHash  string  `dynamodbav:"passwordHash" json:"-"`
	Status        string  `dynamodbav:"status" json:"status"`
	WalletBalance float64 `dynamodbav:"walletBalance" json:"walletBalance"`
	CreatedAt     string  `dynamodbav:"createdAt" json:"createdAt"`
	UpdatedAt     string  `dynamodbav:"updatedAt" json:"updatedAt"`
}

type Retailer struct {
	PK          string `dynamodbav:"PK" json:"PK"`
	SK          string `dynamodbav:"SK" json:"SK"`
	Id          string `dynamodbav:"id" json:"id"`
	Name        string `dynamodbav:"name" json:"name"`
	Email       string `dynamodbav:"email" json:"email"`
	Phone       string `dynamodbav:"phone" json:"phone"`
	Status      string `dynamodbav:"status" json:"status"`
	CreatedDate string `dynamodbav:"createdDate" json:"createdDate"`
	UpdatedAt   string `dynamodbav:"updatedAt" json:"updatedAt"`
}

type Distributor struct {
	PK          string `dynamodbav:"PK" json:"PK"`
	SK          string `dynamodbav:"SK" json:"SK"`
	Id          string `dynamodbav:"id" json:"id"`
	Name        string `dynamodbav:"name" json:"name"`
	Email       string `dynamodbav:"email" json:"email"`
	Phone       string `dynamodbav:"phone" json:"phone"`
	Status      string `dynamodbav:"status" json:"status"`
	CreatedDate string `dynamodbav:"createdDate" json:"createdDate"`
	UpdatedAt   string `dynamodbav:"updatedAt" json:"updatedAt"`
}
