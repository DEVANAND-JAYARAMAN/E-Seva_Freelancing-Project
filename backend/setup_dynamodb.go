package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var dynamoClient *dynamodb.Client

func init() {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "ap-south-1"
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		log.Fatalf("unable to load AWS SDK config: %v", err)
	}
	dynamoClient = dynamodb.NewFromConfig(cfg)
}

func createTableIfNotExists(ctx context.Context, tableName string, createTableInput *dynamodb.CreateTableInput) error {
	// Check if table exists
	_, err := dynamoClient.DescribeTable(ctx, &dynamodb.DescribeTableInput{
		TableName: aws.String(tableName),
	})

	if err == nil {
		fmt.Printf("✓ Table '%s' already exists, skipping creation\n", tableName)
		return nil
	}

	// Create the table
	fmt.Printf("Creating table '%s'...\n", tableName)
	_, err = dynamoClient.CreateTable(ctx, createTableInput)
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", tableName, err)
	}

	fmt.Printf("✓ Table '%s' created successfully\n", tableName)

	// Wait for table to be active (max 2 minutes)
	waiter := dynamodb.NewTableExistsWaiter(dynamoClient)
	err = waiter.Wait(ctx, &dynamodb.DescribeTableInput{
		TableName: aws.String(tableName),
	}, 2*time.Minute)

	if err != nil {
		return fmt.Errorf("timeout waiting for table %s to become active: %w", tableName, err)
	}

	fmt.Printf("  └─ Table '%s' is now ACTIVE\n", tableName)
	return nil
}

func createUsersTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "Users", &dynamodb.CreateTableInput{
		TableName: aws.String("Users"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("email"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("role"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdAt"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-Email"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("email"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Role"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("role"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdAt"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func createRetailersTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "Retailers", &dynamodb.CreateTableInput{
		TableName: aws.String("Retailers"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdDate"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("city"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("name"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("phone"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-Status"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-City"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("city"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("name"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Phone"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("phone"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeKeysOnly,
				},
			},
		},
	})
}

func createDistributorsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "Distributors", &dynamodb.CreateTableInput{
		TableName: aws.String("Distributors"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdDate"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("city"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("name"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-Status"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-City"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("city"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("name"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func createWalletsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "Wallets", &dynamodb.CreateTableInput{
		TableName: aws.String("Wallets"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
	})
}

func createWalletTransactionsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "WalletTransactions", &dynamodb.CreateTableInput{
		TableName: aws.String("WalletTransactions"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("walletType"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdAt"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("reference"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-WalletType"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("walletType"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdAt"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Status"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdAt"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Reference"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("reference"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func createPaymentRequestsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "PaymentRequests", &dynamodb.CreateTableInput{
		TableName: aws.String("PaymentRequests"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("retailerId"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("requestDate"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("utrNumber"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-RetailerRequests"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("retailerId"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("requestDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Status"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("requestDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-UTR"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("utrNumber"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeKeysOnly,
				},
			},
		},
	})
}

func createServiceApplicationsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "ServiceApplications", &dynamodb.CreateTableInput{
		TableName: aws.String("ServiceApplications"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("retailerId"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdDate"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("serviceId"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("lastUpdated"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-Retailer"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("retailerId"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Service"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("serviceId"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("createdDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-Status"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("lastUpdated"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func createServicePricingTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "ServicePricing", &dynamodb.CreateTableInput{
		TableName: aws.String("ServicePricing"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
	})
}

func createStatusTicketsTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "StatusTickets", &dynamodb.CreateTableInput{
		TableName: aws.String("StatusTickets"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
	})
}

func createInvoicesTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "Invoices", &dynamodb.CreateTableInput{
		TableName: aws.String("Invoices"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("date"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("retailerName"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("utrNumber"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-BillingStatus"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("date"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-BillingRetailer"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("retailerName"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("date"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-BillingUTR"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("utrNumber"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func createCRMCustomersTable(ctx context.Context) error {
	return createTableIfNotExists(ctx, "CRMCustomers", &dynamodb.CreateTableInput{
		TableName: aws.String("CRMCustomers"),
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("PK"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("SK"),
				KeyType:       types.KeyTypeRange,
			},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("PK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("SK"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("type"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("joinedDate"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("phone"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("GSI-CRMType"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("type"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("joinedDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-CRMStatus"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("status"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("joinedDate"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
			{
				IndexName: aws.String("GSI-CRMPhone"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("phone"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
			},
		},
	})
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "help" {
		fmt.Println(`
DynamoDB Table Creation Script for E-Seva Platform

Usage:
  go run setup_dynamodb.go              # Create all tables
  go run setup_dynamodb.go help         # Show this help message

Environment Variables Required:
  AWS_REGION                            # AWS region (default: us-east-1)
  AWS_ACCESS_KEY_ID                     # (if not using IAM role)
  AWS_SECRET_ACCESS_KEY                 # (if not using IAM role)

Prerequisites:
  1. AWS credentials must be configured (IAM role on EC2 preferred)
  2. Credentials must have DynamoDB:CreateTable, DynamoDB:DescribeTable permissions
  3. AWS region must be set

Output:
  - Creates 11 DynamoDB tables with all GSIs
  - All tables use PAY_PER_REQUEST billing mode
  - Tables are created sequentially with status checks
  - Existing tables are skipped (safe to run multiple times)

Tables Created:
  ✓ Users                 (with GSI-Email, GSI-Role)
  ✓ Retailers             (with GSI-Status, GSI-City, GSI-Phone)
  ✓ Distributors          (with GSI-Status, GSI-City)
  ✓ Wallets               (no GSIs)
  ✓ WalletTransactions    (with GSI-WalletType, GSI-Status, GSI-Reference)
  ✓ PaymentRequests       (with GSI-RetailerRequests, GSI-Status, GSI-UTR)
  ✓ ServiceApplications   (with GSI-Retailer, GSI-Service, GSI-Status)
  ✓ ServicePricing        (no GSIs)
  ✓ StatusTickets         (no GSIs)
  ✓ Invoices              (with GSI-BillingStatus, GSI-BillingRetailer, GSI-BillingUTR)
  ✓ CRMCustomers          (with GSI-CRMType, GSI-CRMStatus, GSI-CRMPhone)
`)
		return
	}

	ctx := context.Background()

	fmt.Println("\n================================")
	fmt.Println("E-Seva Platform - DynamoDB Setup")
	fmt.Println("================================\n")

	tables := []struct {
		name string
		fn   func(context.Context) error
	}{
		{"Users", createUsersTable},
		{"Retailers", createRetailersTable},
		{"Distributors", createDistributorsTable},
		{"Wallets", createWalletsTable},
		{"WalletTransactions", createWalletTransactionsTable},
		{"PaymentRequests", createPaymentRequestsTable},
		{"ServiceApplications", createServiceApplicationsTable},
		{"ServicePricing", createServicePricingTable},
		{"StatusTickets", createStatusTicketsTable},
		{"Invoices", createInvoicesTable},
		{"CRMCustomers", createCRMCustomersTable},
	}

	errors := 0
	for _, table := range tables {
		if err := table.fn(ctx); err != nil {
			fmt.Printf("✗ Error creating table '%s': %v\n", table.name, err)
			errors++
		}
	}

	fmt.Println("\n================================")
	if errors == 0 {
		fmt.Println("✓ All tables created successfully!")
	} else {
		fmt.Printf("✗ %d table(s) failed to create\n", errors)
		os.Exit(1)
	}
	fmt.Println("================================\n")

	fmt.Println("Next Steps:")
	fmt.Println("1. Populate ServicePricing table with pricing data")
	fmt.Println("2. Create initial Wallets for users during signup")
	fmt.Println("3. Start the backend server: go run main.go")
	fmt.Println("\nFor more details, see DYNAMODB_ANALYSIS_REPORT.md")
}
