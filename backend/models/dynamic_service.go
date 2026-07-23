package models

type DynamicService struct {
	ID          string   `dynamodbav:"id" json:"id"`
	Name        string   `dynamodbav:"name" json:"name"`
	RetailerCharge    float64  `dynamodbav:"retailerCharge" json:"retailerCharge"`
	DistributorCharge float64  `dynamodbav:"distributorCharge" json:"distributorCharge"`
	OfficialCost      float64  `dynamodbav:"officialCost" json:"officialCost"`
	FormFields        []string `dynamodbav:"formFields" json:"formFields"`
	CustomImage       string   `dynamodbav:"customImage" json:"customImage"`
	CreatedDate       string   `dynamodbav:"createdDate" json:"createdDate"`
}
