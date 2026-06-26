const fs = require('fs');

let mainGo = fs.readFileSync('main.go', 'utf8');
if (!mainGo.includes('serviceGroup.DELETE("/dynamic/:id"')) {
    mainGo = mainGo.replace('serviceGroup.GET("/dynamic", service.GetDynamicServices)', 
        'serviceGroup.GET("/dynamic", service.GetDynamicServices)\n\t\t\tserviceGroup.PUT("/dynamic/:id", service.UpdateDynamicService)\n\t\t\tserviceGroup.DELETE("/dynamic/:id", service.DeleteDynamicService)');
    fs.writeFileSync('main.go', mainGo);
    console.log("Updated main.go");
}

let handlersGo = fs.readFileSync('service/service_handlers.go', 'utf8');
if (!handlersGo.includes('DeleteDynamicService')) {
    const handlersToAdd = `

func UpdateDynamicService(c *gin.Context) {
	id := c.Param("id")
	var req models.DynamicService
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Id = id
	req.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	item, err := attributevalue.MarshalMap(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal item"})
		return
	}

	_, err = db.DynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("DynamicServices"),
		Item:      item,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update dynamic service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service updated successfully"})
}

func DeleteDynamicService(c *gin.Context) {
	id := c.Param("id")

	_, err := db.DynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String("DynamicServices"),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dynamic service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}
`;
    handlersGo += handlersToAdd;
    fs.writeFileSync('service/service_handlers.go', handlersGo);
    console.log("Updated service_handlers.go");
}
