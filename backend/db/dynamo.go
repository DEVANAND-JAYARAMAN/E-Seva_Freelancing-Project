package db

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var DynamoClient *dynamodb.Client

func ConnectDynamoDB() {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "ap-south-1"
	}
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		log.Fatalf("unable to load AWS SDK config, %v", err)
	}
	DynamoClient = dynamodb.NewFromConfig(cfg)
	log.Printf("DynamoDB Client initialized successfully (region: %s)", region)
}
