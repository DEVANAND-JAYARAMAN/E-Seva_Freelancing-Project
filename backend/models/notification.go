package models

type Notification struct {
	PK        string `dynamodbav:"PK" json:"PK"`
	SK        string `dynamodbav:"SK" json:"SK"`
	Id        string `dynamodbav:"id" json:"id"`
	UserId    string `dynamodbav:"userId" json:"userId"` // "ALL" or specific User ID
	Title     string `dynamodbav:"title" json:"title"`
	Message   string `dynamodbav:"message" json:"message"`
	Type      string `dynamodbav:"type" json:"type"` // "info", "success", "warning", "error"
	IsRead    bool   `dynamodbav:"isRead" json:"isRead"`
	CreatedAt string `dynamodbav:"createdAt" json:"createdAt"`
	Link      string `dynamodbav:"link" json:"link"`
}
