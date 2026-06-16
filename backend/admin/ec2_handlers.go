package admin

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/gin-gonic/gin"
)

func getEC2Client() (*ec2.Client, error) {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "ap-south-1"
	}
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return nil, err
	}
	return ec2.NewFromConfig(cfg), nil
}

func instanceID() string {
	id := os.Getenv("EC2_INSTANCE_ID")
	if id == "" {
		id = "i-0c3145fb3cf6049c4"
	}
	return id
}

func authMiddleware(c *gin.Context) {
	key := c.GetHeader("X-Admin-Key")
	if key != os.Getenv("ADMIN_SECRET_KEY") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	c.Next()
}

func describeInstance(client *ec2.Client) (*ec2types.Instance, error) {
	desc, err := client.DescribeInstances(context.TODO(), &ec2.DescribeInstancesInput{
		InstanceIds: []string{instanceID()},
	})
	if err != nil {
		return nil, err
	}
	inst := desc.Reservations[0].Instances[0]
	return &inst, nil
}

func StartInstance(c *gin.Context) {
	client, err := getEC2Client()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = client.StartInstances(context.TODO(), &ec2.StartInstancesInput{
		InstanceIds: []string{instanceID()},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Poll up to 60s for public IP
	var publicIP string
	for i := 0; i < 12; i++ {
		time.Sleep(5 * time.Second)
		inst, err := describeInstance(client)
		if err == nil && inst.PublicIpAddress != nil && *inst.PublicIpAddress != "" {
			publicIP = aws.ToString(inst.PublicIpAddress)
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "started", "public_ip": publicIP})
}

func StopInstance(c *gin.Context) {
	client, err := getEC2Client()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = client.StopInstances(context.TODO(), &ec2.StopInstancesInput{
		InstanceIds: []string{instanceID()},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "stopped"})
}

func InstanceStatus(c *gin.Context) {
	client, err := getEC2Client()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	inst, err := describeInstance(client)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	publicIP := ""
	if inst.PublicIpAddress != nil {
		publicIP = aws.ToString(inst.PublicIpAddress)
	}

	c.JSON(http.StatusOK, gin.H{
		"state":     string(inst.State.Name),
		"public_ip": publicIP,
	})
}

func RegisterRoutes(api *gin.RouterGroup) {
	adminGroup := api.Group("/admin", authMiddleware)
	{
		adminGroup.POST("/ec2/start", StartInstance)
		adminGroup.POST("/ec2/stop", StopInstance)
		adminGroup.GET("/ec2/status", InstanceStatus)
	}
}
