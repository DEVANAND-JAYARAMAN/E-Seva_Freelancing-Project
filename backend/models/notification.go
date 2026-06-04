package models

type Notification struct {
	PK        string `dynamodbav:"PK"`
	SK        string `dynamodbav:"SK"`
	Id        string `dynamodbav:"id"`
	UserId    string `dynamodbav:"userId"` // "ALL" or specific User ID
	Title     string `dynamodbav:"title"`
	Message   string `dynamodbav:"message"`
	Type      string `dynamodbav:"type"` // "info", "success", "warning", "error"
	IsRead    bool   `dynamodbav:"isRead"`
	CreatedAt string `dynamodbav:"createdAt"`
}
