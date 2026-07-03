//go:build ignore

package main

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/route53"
	r53types "github.com/aws/aws-sdk-go-v2/service/route53/types"
)

const (
	domain = "thuruvancommunications.com"

	// CloudFront distribution
	cfDomain = "d27p4qb1q08njc.cloudfront.net"
	// CloudFront hosted zone ID — fixed value for all CloudFront distributions
	cfHostedZoneID = "Z2FDTNDATAQYW2"

	// ACM validation CNAME (from Certificate Manager console)
	acmCNAMEName  = "_1ff0c929bc9268466a0fa10441b00edc.thuruvancommunications.com."
	acmCNAMEValue = "_f1a464e53ea62a5e35ec50647fe9e6a0.jkddzztszm.acm-validations.aws."
)

var r53c *route53.Client

func init() {
	// Route 53 is a global service, region doesn't matter but us-east-1 is standard
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
	fmt.Println("E-Seva — Route 53 Setup")
	fmt.Println("========================================\n")

	zoneID := createHostedZone(ctx)
	addRecords(ctx, zoneID)

	fmt.Println("\n========================================")
	fmt.Println("✅ Route 53 setup complete!")
	fmt.Println("========================================")
	fmt.Println("\n⚠️  IMPORTANT — Tell Mohan bro to update GoDaddy nameservers:")
	fmt.Println("   Go to GoDaddy → My Domains → thuruvancommunications.com")
	fmt.Println("   → DNS → Nameservers → Change → Enter Custom Nameservers")
	fmt.Println("   → Replace all existing nameservers with the 4 listed above")
	fmt.Println("\nDNS propagation takes 24–48 hours after nameserver change.")
	fmt.Println("Once done, https://thuruvancommunications.com will be live.")
}

func createHostedZone(ctx context.Context) string {
	// Check if hosted zone already exists
	listOut, err := r53c.ListHostedZonesByName(ctx, &route53.ListHostedZonesByNameInput{
		DNSName: aws.String(domain),
	})
	must(err, "list hosted zones")

	for _, z := range listOut.HostedZones {
		if strings.TrimSuffix(*z.Name, ".") == domain {
			zoneID := zoneIDShort(*z.Id)
			fmt.Println("✅ Hosted zone already exists:", zoneID)
			printNameservers(ctx, zoneID)
			return zoneID
		}
	}

	out, err := r53c.CreateHostedZone(ctx, &route53.CreateHostedZoneInput{
		Name:            aws.String(domain),
		CallerReference: aws.String(fmt.Sprintf("eseva-%d", time.Now().Unix())),
	})
	must(err, "create hosted zone")

	zoneID := zoneIDShort(*out.HostedZone.Id)
	fmt.Println("✅ Hosted zone created:", zoneID)

	fmt.Println("\n📋 Route 53 Nameservers (give these to Mohan bro for GoDaddy):")
	for _, ns := range out.DelegationSet.NameServers {
		fmt.Println("  ", ns)
	}
	return zoneID
}

func printNameservers(ctx context.Context, zoneID string) {
	out, err := r53c.GetHostedZone(ctx, &route53.GetHostedZoneInput{
		Id: aws.String(zoneID),
	})
	must(err, "get hosted zone")
	fmt.Println("\n📋 Route 53 Nameservers (give these to Mohan bro for GoDaddy):")
	for _, ns := range out.DelegationSet.NameServers {
		fmt.Println("  ", ns)
	}
}

func addRecords(ctx context.Context, zoneID string) {
	_, err := r53c.ChangeResourceRecordSets(ctx, &route53.ChangeResourceRecordSetsInput{
		HostedZoneId: aws.String(zoneID),
		ChangeBatch: &r53types.ChangeBatch{
			Changes: []r53types.Change{
				// ALIAS record: root domain → CloudFront (works for root domain unlike CNAME)
				{
					Action: r53types.ChangeActionUpsert,
					ResourceRecordSet: &r53types.ResourceRecordSet{
						Name: aws.String(domain),
						Type: r53types.RRTypeA,
						AliasTarget: &r53types.AliasTarget{
							DNSName:              aws.String(cfDomain),
							HostedZoneId:         aws.String(cfHostedZoneID),
							EvaluateTargetHealth: false,
						},
					},
				},
				// ACM validation CNAME (keeps cert auto-renewing)
				{
					Action: r53types.ChangeActionUpsert,
					ResourceRecordSet: &r53types.ResourceRecordSet{
						Name: aws.String(acmCNAMEName),
						Type: r53types.RRTypeCname,
						TTL:  aws.Int64(300),
						ResourceRecords: []r53types.ResourceRecord{
							{Value: aws.String(acmCNAMEValue)},
						},
					},
				},
			},
		},
	})
	must(err, "add DNS records")
	fmt.Println("✅ ALIAS record added: thuruvancommunications.com → CloudFront")
	fmt.Println("✅ ACM validation CNAME added (cert auto-renewal)")
}

func zoneIDShort(id string) string {
	// /hostedzone/Z1234ABC → Z1234ABC
	parts := strings.Split(id, "/")
	return parts[len(parts)-1]
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
