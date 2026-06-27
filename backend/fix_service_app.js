const fs = require('fs');

let code = fs.readFileSync('backend/service/service_handlers.go', 'utf8');

const targetStr = `	app := models.ServiceApplication{
		PK:               "SERVICEAPP#" + appId,
		SK:               "PROFILE",
		Id:               appId,
		RetailerId:       req.RetailerId,
		ServiceId:        req.ServiceId,
		ServiceName:      req.ServiceName,
		Cost:             req.Cost,
		CustomerWhatsApp: req.CustomerWhatsApp,
		FormData:         formData,
		Documents:        documents,
		Status:           "Pending",`;

const replStr = `	// Fetch User info for RetailerName and Mobile
	retailerName := "Unknown"
	retailerMobile := "Unknown"
	userRes, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("Users"),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: "USER#" + req.RetailerId},
			"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
		},
	})
	if err == nil && userRes.Item != nil {
		if nameAttr, ok := userRes.Item["name"].(*types.AttributeValueMemberS); ok {
			retailerName = nameAttr.Value
		}
		if mobAttr, ok := userRes.Item["mobile"].(*types.AttributeValueMemberS); ok {
			retailerMobile = mobAttr.Value
		}
	}

	app := models.ServiceApplication{
		PK:               "SERVICEAPP#" + appId,
		SK:               "PROFILE",
		Id:               appId,
		RetailerId:       req.RetailerId,
		RetailerName:     retailerName,
		RetailerMobile:   retailerMobile,
		ServiceId:        req.ServiceId,
		ServiceName:      req.ServiceName,
		Cost:             req.Cost,
		CustomerWhatsApp: req.CustomerWhatsApp,
		FormData:         formData,
		Documents:        documents,
		Status:           "Pending",`;

if (code.includes('app := models.ServiceApplication{')) {
    code = code.replace(targetStr, replStr);
    fs.writeFileSync('backend/service/service_handlers.go', code);
    console.log('Replaced app := models.ServiceApplication successfully');
} else {
    console.log('Could not find target');
}
