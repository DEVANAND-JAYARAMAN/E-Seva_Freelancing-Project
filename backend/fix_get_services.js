const fs = require('fs');

let code = fs.readFileSync('backend/service/service_handlers.go', 'utf8');

const targetStr = `func GetServiceRequests(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	var requests []models.ServiceApplication
	attributevalue.UnmarshalListOfMaps(out.Items, &requests)

	c.JSON(http.StatusOK, requests)
}`;

const replStr = `func GetServiceRequests(c *gin.Context) {
	out, err := db.DynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("ServiceApplications"),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	var requests []models.ServiceApplication
	attributevalue.UnmarshalListOfMaps(out.Items, &requests)

	// Backfill RetailerName and Mobile for older requests if missing
	for i := range requests {
		if requests[i].RetailerName == "" || requests[i].RetailerMobile == "" {
			userRes, err := db.DynamoClient.GetItem(context.TODO(), &dynamodb.GetItemInput{
				TableName: aws.String("Users"),
				Key: map[string]types.AttributeValue{
					"PK": &types.AttributeValueMemberS{Value: "USER#" + requests[i].RetailerId},
					"SK": &types.AttributeValueMemberS{Value: "PROFILE"},
				},
			})
			if err == nil && userRes.Item != nil {
				if nameAttr, ok := userRes.Item["name"].(*types.AttributeValueMemberS); ok {
					requests[i].RetailerName = nameAttr.Value
				}
				if mobAttr, ok := userRes.Item["mobile"].(*types.AttributeValueMemberS); ok {
					requests[i].RetailerMobile = mobAttr.Value
				}
			}
		}
	}

	c.JSON(http.StatusOK, requests)
}`;

if (code.includes('func GetServiceRequests(c *gin.Context) {')) {
    code = code.replace(targetStr, replStr);
    fs.writeFileSync('backend/service/service_handlers.go', code);
    console.log('Replaced GetServiceRequests successfully');
} else {
    console.log('Could not find target');
}
