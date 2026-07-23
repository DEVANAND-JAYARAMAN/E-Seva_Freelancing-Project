package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-south-1"))
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := dynamodb.NewFromConfig(cfg)

	out, err := client.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: aws.String("DynamicServices"),
	})

	if err != nil {
		log.Fatalf("failed to scan, %v", err)
	}

	for _, item := range out.Items {
		// Just print the keys available in the map
		keys := []string{}
		for k := range item {
			keys = append(keys, k)
		}
		fmt.Printf("Item keys: %v\n", keys)

		// Try to print the ID field if it exists
		if val, ok := item["ID"]; ok {
			fmt.Printf("Found 'ID': %v\n", val)
		}
		if val, ok := item["id"]; ok {
			fmt.Printf("Found 'id': %v\n", val)
		}
	}
}
