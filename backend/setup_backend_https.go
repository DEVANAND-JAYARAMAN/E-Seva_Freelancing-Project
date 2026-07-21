//go:build ignore

package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/route53"
	r53types "github.com/aws/aws-sdk-go-v2/service/route53/types"
)

const (
	domain    = "thuruvancommunications.com"
	apiDomain = "api.thuruvancommunications.com"
	ec2IP     = "65.2.4.89"
)

var r53c *route53.Client

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Failed to load AWS config: %v\n", err)
		os.Exit(1)
	}
	r53c = route53.NewFromConfig(cfg)
}

func main() {
	ctx := context.Background()

	fmt.Println("\n========================================")
	fmt.Println("E-Seva — Backend HTTPS Setup (Route 53)")
	fmt.Println("========================================\n")

	zoneID := getHostedZoneID(ctx)
	addAPIRecord(ctx, zoneID)

	fmt.Println("\n========================================")
	fmt.Println("✅ Route 53 record added!")
	fmt.Println("========================================")
	fmt.Printf("\n✅ A record: %s → %s\n", apiDomain, ec2IP)
	fmt.Println("\nNext: Run Nginx + Certbot commands on EC2 to enable HTTPS.")
}

func getHostedZoneID(ctx context.Context) string {
	out, err := r53c.ListHostedZonesByName(ctx, &route53.ListHostedZonesByNameInput{
		DNSName: aws.String(domain),
	})
	must(err, "list hosted zones")
	for _, z := range out.HostedZones {
		if strings.TrimSuffix(*z.Name, ".") == domain {
			parts := strings.Split(*z.Id, "/")
			return parts[len(parts)-1]
		}
	}
	fmt.Fprintln(os.Stderr, "❌ Hosted zone not found. Run setup_route53.go first.")
	os.Exit(1)
	return ""
}

func addAPIRecord(ctx context.Context, zoneID string) {
	_, err := r53c.ChangeResourceRecordSets(ctx, &route53.ChangeResourceRecordSetsInput{
		HostedZoneId: aws.String(zoneID),
		ChangeBatch: &r53types.ChangeBatch{
			Changes: []r53types.Change{
				{
					Action: r53types.ChangeActionUpsert,
					ResourceRecordSet: &r53types.ResourceRecordSet{
						Name: aws.String(apiDomain),
						Type: r53types.RRTypeA,
						TTL:  aws.Int64(300),
						ResourceRecords: []r53types.ResourceRecord{
							{Value: aws.String(ec2IP)},
						},
					},
				},
			},
		},
	})
	must(err, "add API A record")
	fmt.Printf("✅ A record added: %s → %s\n", apiDomain, ec2IP)
}

func must(err error, msg string) {
	if err != nil {
		if strings.Contains(err.Error(), "AccessDenied") || strings.Contains(err.Error(), "not authorized") {
			fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
			fmt.Println("   → Add Route53FullAccess to your EC2 IAM role.")
		} else {
			fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
		}
		os.Exit(1)
	}
}
