package main

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
)

var (
	ec2Client    *ec2.Client
	dynamoClient *dynamodb.Client
	instanceID   = getEnv("EC2_INSTANCE_ID", "i-0c3145fb3cf6049c4")
	adminKey     = getEnv("ADMIN_SECRET_KEY", "eseva-admin-2024")
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func init() {
	cfg, _ := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-south-1"))
	ec2Client = ec2.NewFromConfig(cfg)
	dynamoClient = dynamodb.NewFromConfig(cfg)
}

func corsHeaders() map[string]string {
	return map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Headers": "X-Admin-Key,Content-Type",
	}
}

func respond(code int, body any) events.LambdaFunctionURLResponse {
	b, _ := json.Marshal(body)
	return events.LambdaFunctionURLResponse{StatusCode: code, Headers: corsHeaders(), Body: string(b)}
}

func getInstanceState() (state string, publicIP string, err error) {
	out, err := ec2Client.DescribeInstances(context.TODO(), &ec2.DescribeInstancesInput{
		InstanceIds: []string{instanceID},
	})
	if err != nil {
		return "", "", err
	}
	inst := out.Reservations[0].Instances[0]
	return string(inst.State.Name), aws.ToString(inst.PublicIpAddress), nil
}

func saveIP(ctx context.Context, ip string) {
	dynamoClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String("AppConfig"),
		Item: map[string]types.AttributeValue{
			"PK":        &types.AttributeValueMemberS{Value: "CONFIG"},
			"SK":        &types.AttributeValueMemberS{Value: "EC2_IP"},
			"value":     &types.AttributeValueMemberS{Value: ip},
			"updatedAt": &types.AttributeValueMemberS{Value: time.Now().UTC().Format(time.RFC3339)},
		},
	})
}

func handler(ctx context.Context, req events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	if req.RequestContext.HTTP.Method == "OPTIONS" {
		return respond(200, nil), nil
	}

	if req.Headers["x-admin-key"] != adminKey {
		return respond(401, map[string]string{"error": "unauthorized"}), nil
	}

	path := req.RequestContext.HTTP.Path

	switch path {
	case "/start":
		_, err := ec2Client.StartInstances(ctx, &ec2.StartInstancesInput{InstanceIds: []string{instanceID}})
		if err != nil {
			return respond(500, map[string]string{"error": err.Error()}), nil
		}
		var publicIP string
		for i := 0; i < 12; i++ {
			time.Sleep(5 * time.Second)
			_, ip, err := getInstanceState()
			if err == nil && ip != "" {
				publicIP = ip
				break
			}
		}
		if publicIP != "" {
			saveIP(ctx, publicIP)
		}
		return respond(200, map[string]string{"status": "started", "public_ip": publicIP}), nil

	case "/stop":
		_, err := ec2Client.StopInstances(ctx, &ec2.StopInstancesInput{InstanceIds: []string{instanceID}})
		if err != nil {
			return respond(500, map[string]string{"error": err.Error()}), nil
		}
		saveIP(ctx, "")
		return respond(200, map[string]string{"status": "stopped"}), nil

	case "/status":
		state, ip, err := getInstanceState()
		if err != nil {
			return respond(500, map[string]string{"error": err.Error()}), nil
		}
		return respond(200, map[string]string{"state": state, "public_ip": ip}), nil

	case "/ip":
		out, err := dynamoClient.GetItem(ctx, &dynamodb.GetItemInput{
			TableName: aws.String("AppConfig"),
			Key: map[string]types.AttributeValue{
				"PK": &types.AttributeValueMemberS{Value: "CONFIG"},
				"SK": &types.AttributeValueMemberS{Value: "EC2_IP"},
			},
		})
		if err != nil || out.Item == nil {
			return respond(200, map[string]string{"public_ip": ""}), nil
		}
		ip := out.Item["value"].(*types.AttributeValueMemberS).Value
		return respond(200, map[string]string{"public_ip": ip}), nil

	default:
		return respond(404, map[string]string{"error": "not found"}), nil
	}
}

func main() {
	lambda.Start(handler)
}
