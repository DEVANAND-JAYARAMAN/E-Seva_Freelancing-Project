package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/service/iam"
	awslambda "github.com/aws/aws-sdk-go-v2/service/lambda"
	lambdatypes "github.com/aws/aws-sdk-go-v2/service/lambda/types"
)

const (
	region       = "ap-south-1"
	functionName = "eseva-ec2-controller"
	roleName     = "eseva-lambda-ec2-role"
	instanceID   = "i-0c3145fb3cf6049c4"
	adminKey     = "eseva-admin-2024"
)

var ctx = context.TODO()

func main() {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		log.Fatal("AWS config error:", err)
	}

	iamClient := iam.NewFromConfig(cfg)
	lambdaClient := awslambda.NewFromConfig(cfg)
	dynamoClient := dynamodb.NewFromConfig(cfg)

	fmt.Println("==> Step 1: Creating IAM role...")
	roleARN := ensureIAMRole(iamClient)

	fmt.Println("==> Step 2: Creating AppConfig DynamoDB table...")
	ensureDynamoTable(dynamoClient)

	fmt.Println("==> Step 3: Building Lambda binary...")
	zipBytes := buildAndZip()

	fmt.Println("==> Step 4: Deploying Lambda function...")
	functionARN := deployLambda(lambdaClient, roleARN, zipBytes)

	fmt.Println("==> Step 5: Creating Function URL...")
	url := createFunctionURL(lambdaClient, functionARN)

	fmt.Println("\n✅ Done!")
	fmt.Println("Lambda Function URL:", url)
	fmt.Println("\nAdd this to your frontend .env.production:")
	fmt.Printf("NEXT_PUBLIC_LAMBDA_URL=%s\n", url)
	fmt.Println("NEXT_PUBLIC_ADMIN_KEY=" + adminKey)
}

func ensureIAMRole(client *iam.Client) string {
	trustPolicy := map[string]any{
		"Version": "2012-10-17",
		"Statement": []map[string]any{
			{
				"Effect":    "Allow",
				"Principal": map[string]string{"Service": "lambda.amazonaws.com"},
				"Action":    "sts:AssumeRole",
			},
		},
	}
	trustJSON, _ := json.Marshal(trustPolicy)

	out, err := client.CreateRole(ctx, &iam.CreateRoleInput{
		RoleName:                 aws.String(roleName),
		AssumeRolePolicyDocument: aws.String(string(trustJSON)),
	})
	if err != nil {
		// Role already exists — fetch ARN
		existing, err2 := client.GetRole(ctx, &iam.GetRoleInput{RoleName: aws.String(roleName)})
		if err2 != nil {
			log.Fatal("IAM role error:", err)
		}
		fmt.Println("   IAM role already exists:", *existing.Role.Arn)
		attachPolicies(client)
		return *existing.Role.Arn
	}

	attachPolicies(client)
	fmt.Println("   Created role:", *out.Role.Arn)
	time.Sleep(10 * time.Second) // IAM propagation
	return *out.Role.Arn
}

func attachPolicies(client *iam.Client) {
	policies := []string{
		"arn:aws:iam::aws:policy/AmazonEC2FullAccess",
		"arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
		"arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
	}
	for _, p := range policies {
		client.AttachRolePolicy(ctx, &iam.AttachRolePolicyInput{
			RoleName:  aws.String(roleName),
			PolicyArn: aws.String(p),
		})
	}
}

func ensureDynamoTable(client *dynamodb.Client) {
	_, err := client.DescribeTable(ctx, &dynamodb.DescribeTableInput{
		TableName: aws.String("AppConfig"),
	})
	if err == nil {
		fmt.Println("   AppConfig table already exists")
		return
	}

	_, err = client.CreateTable(ctx, &dynamodb.CreateTableInput{
		TableName: aws.String("AppConfig"),
		KeySchema: []types.KeySchemaElement{
			{AttributeName: aws.String("PK"), KeyType: types.KeyTypeHash},
			{AttributeName: aws.String("SK"), KeyType: types.KeyTypeRange},
		},
		AttributeDefinitions: []types.AttributeDefinition{
			{AttributeName: aws.String("PK"), AttributeType: types.ScalarAttributeTypeS},
			{AttributeName: aws.String("SK"), AttributeType: types.ScalarAttributeTypeS},
		},
		BillingMode: types.BillingModePayPerRequest,
	})
	if err != nil {
		log.Fatal("DynamoDB create error:", err)
	}

	waiter := dynamodb.NewTableExistsWaiter(client)
	waiter.Wait(ctx, &dynamodb.DescribeTableInput{TableName: aws.String("AppConfig")}, 30*time.Second)
	fmt.Println("   AppConfig table created")
}

func buildAndZip() []byte {
	handlerDir := "../handler"

	// Tidy and build Linux binary
	tidy := exec.Command("go", "mod", "tidy")
	tidy.Dir = handlerDir
	tidy.Stdout = os.Stdout
	tidy.Stderr = os.Stderr
	if err := tidy.Run(); err != nil {
		log.Fatal("go mod tidy failed:", err)
	}

	build := exec.Command("go", "build", "-o", "bootstrap", ".")
	build.Dir = handlerDir
	build.Env = append(os.Environ(), "GOOS=linux", "GOARCH=amd64", "CGO_ENABLED=0")
	build.Stdout = os.Stdout
	build.Stderr = os.Stderr
	if err := build.Run(); err != nil {
		log.Fatal("go build failed:", err)
	}

	// Read binary
	binary, err := os.ReadFile(handlerDir + "/bootstrap")
	if err != nil {
		log.Fatal("read binary failed:", err)
	}

	// Zip it
	var buf bytes.Buffer
	w := zip.NewWriter(&buf)
	f, _ := w.Create("bootstrap")
	f.Write(binary)
	w.Close()

	fmt.Println("   Lambda binary built and zipped")
	return buf.Bytes()
}

func deployLambda(client *awslambda.Client, roleARN string, zipBytes []byte) string {
	envVars := map[string]string{
		"EC2_INSTANCE_ID":   instanceID,
		"ADMIN_SECRET_KEY":  adminKey,
		"AWS_REGION_CUSTOM": region,
	}

	// Try update first
	_, err := client.GetFunction(ctx, &awslambda.GetFunctionInput{
		FunctionName: aws.String(functionName),
	})
	if err == nil {
		out, err := client.UpdateFunctionCode(ctx, &awslambda.UpdateFunctionCodeInput{
			FunctionName: aws.String(functionName),
			ZipFile:      zipBytes,
		})
		if err != nil {
			log.Fatal("update lambda failed:", err)
		}
		client.UpdateFunctionConfiguration(ctx, &awslambda.UpdateFunctionConfigurationInput{
			FunctionName: aws.String(functionName),
			Environment:  &lambdatypes.Environment{Variables: envVars},
			Timeout:      aws.Int32(120),
		})
		fmt.Println("   Lambda updated:", *out.FunctionArn)
		return *out.FunctionArn
	}

	out, err := client.CreateFunction(ctx, &awslambda.CreateFunctionInput{
		FunctionName: aws.String(functionName),
		Runtime:      lambdatypes.RuntimeProvidedal2023,
		Role:         aws.String(roleARN),
		Handler:      aws.String("bootstrap"),
		Code:         &lambdatypes.FunctionCode{ZipFile: zipBytes},
		Timeout:      aws.Int32(120),
		MemorySize:   aws.Int32(128),
		Environment:  &lambdatypes.Environment{Variables: envVars},
	})
	if err != nil {
		log.Fatal("create lambda failed:", err)
	}
	fmt.Println("   Lambda created:", *out.FunctionArn)
	time.Sleep(5 * time.Second)
	return *out.FunctionArn
}

func createFunctionURL(client *awslambda.Client, functionARN string) string {
	// Check if URL already exists
	out, err := client.GetFunctionUrlConfig(ctx, &awslambda.GetFunctionUrlConfigInput{
		FunctionName: aws.String(functionName),
	})
	if err == nil {
		fmt.Println("   Function URL already exists:", *out.FunctionUrl)
		return *out.FunctionUrl
	}

	created, err := client.CreateFunctionUrlConfig(ctx, &awslambda.CreateFunctionUrlConfigInput{
		FunctionName: aws.String(functionName),
		AuthType:     lambdatypes.FunctionUrlAuthTypeNone,
		Cors: &lambdatypes.Cors{
			AllowOrigins: []string{"*"},
			AllowHeaders: []string{"X-Admin-Key", "Content-Type"},
			AllowMethods: []string{"GET", "POST", "OPTIONS"},
		},
	})
	if err != nil {
		log.Fatal("create function URL failed:", err)
	}

	// Allow public invoke
	client.AddPermission(ctx, &awslambda.AddPermissionInput{
		FunctionName:             aws.String(functionName),
		StatementId:              aws.String("FunctionURLAllowPublicAccess"),
		Action:                   aws.String("lambda:InvokeFunctionUrl"),
		Principal:                aws.String("*"),
		FunctionUrlAuthType:      lambdatypes.FunctionUrlAuthTypeNone,
	})

	return *created.FunctionUrl
}
