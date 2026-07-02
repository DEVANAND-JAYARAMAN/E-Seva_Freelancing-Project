//go:build ignore

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudfront"
	cftypes "github.com/aws/aws-sdk-go-v2/service/cloudfront/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// ── CONFIG — edit before running ─────────────────────────────────────────────
const (
	region     = "ap-south-1"
	bucketName = "eseva-s3" // must be globally unique across all of AWS

	// Your custom domain (e.g. "app.yourdomain.com" or "yourdomain.com")
	domainName = "thuruvancommunications.com"

	// ACM certificate ARN — MUST be in us-east-1 for CloudFront (not ap-south-1)
	// Steps to get one:
	//   1. Go to AWS Console → Certificate Manager → switch region to us-east-1
	//   2. Request a public certificate for your domain
	//   3. Validate via DNS (add the CNAME record your registrar)
	//   4. Paste the ARN below
	acmCertARN = "arn:aws:acm:us-east-1:483528440028:certificate/d5ec52a1-d0f9-490c-a67e-f67ceaad6943"

	// Path to the Next.js static export folder (relative to where you run this)
	// After `npm run build` inside frontend/, the output is frontend/out/
	outDir = "../frontend/out"
)

// ─────────────────────────────────────────────────────────────────────────────

var (
	s3c *s3.Client
	cfc *cloudfront.Client
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Failed to load AWS config: %v\n", err)
		fmt.Println("   Make sure this EC2 instance has an IAM role with S3 + CloudFront permissions.")
		os.Exit(1)
	}
	s3c = s3.NewFromConfig(cfg)
	cfc = cloudfront.NewFromConfig(cfg)
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	ctx := context.Background()

	switch os.Args[1] {
	case "setup":
		runSetup(ctx)
	case "deploy":
		if len(os.Args) < 3 {
			fmt.Fprintln(os.Stderr, "❌ Usage: go run setup_frontend_hosting.go deploy <distributionID>")
			os.Exit(1)
		}
		runDeploy(ctx, os.Args[2])
	case "help":
		printUsage()
	default:
		printUsage()
	}
}

// runSetup creates the S3 bucket + CloudFront distribution (run once)
func runSetup(ctx context.Context) {
	fmt.Println("\n========================================")
	fmt.Println("E-Seva Frontend — S3 + CloudFront Setup")
	fmt.Println("========================================\n")

	createBucket(ctx)
	setBucketPolicy(ctx)
	enableStaticWebsite(ctx)
	distID, distDomain := createDistribution(ctx)

	fmt.Println("\n========================================")
	fmt.Println("✅ Setup complete!")
	fmt.Println("========================================")
	fmt.Println("\nNext steps:")
	fmt.Printf("  1. Add a CNAME DNS record at your registrar:\n")
	fmt.Printf("       %s  →  %s\n", domainName, distDomain)
	fmt.Println("  2. Build the frontend:  cd ../frontend && npm run build")
	fmt.Printf("  3. Deploy:  go run setup_frontend_hosting.go deploy %s\n", distID)
	fmt.Println("\n⚠️  CloudFront takes ~15 minutes to fully deploy globally.")
}

// runDeploy uploads out/ to S3 and invalidates the CloudFront cache
func runDeploy(ctx context.Context, distID string) {
	fmt.Println("\n========================================")
	fmt.Println("E-Seva Frontend — Deploy")
	fmt.Println("========================================\n")

	if _, err := os.Stat(outDir); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "❌ Output folder not found: %s\n", outDir)
		fmt.Println("   Run `npm run build` inside the frontend/ folder first.")
		os.Exit(1)
	}

	fmt.Println("📦 Uploading files to S3...")
	uploadDir(ctx, outDir)
	fmt.Println("\n🔄 Invalidating CloudFront cache...")
	invalidateCache(ctx, distID)

	fmt.Println("\n========================================")
	fmt.Println("✅ Deploy complete!")
	fmt.Printf("   Live at: https://%s\n", domainName)
	fmt.Println("========================================\n")
}

// ── S3 ────────────────────────────────────────────────────────────────────────

func createBucket(ctx context.Context) {
	_, err := s3c.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(bucketName),
		CreateBucketConfiguration: &s3types.CreateBucketConfiguration{
			LocationConstraint: s3types.BucketLocationConstraint(region),
		},
	})
	must(err, "create S3 bucket")

	// Disable the default "block all public access" so the bucket policy works
	_, err = s3c.PutPublicAccessBlock(ctx, &s3.PutPublicAccessBlockInput{
		Bucket: aws.String(bucketName),
		PublicAccessBlockConfiguration: &s3types.PublicAccessBlockConfiguration{
			BlockPublicAcls:       aws.Bool(false),
			IgnorePublicAcls:      aws.Bool(false),
			BlockPublicPolicy:     aws.Bool(false),
			RestrictPublicBuckets: aws.Bool(false),
		},
	})
	must(err, "disable block public access")
	fmt.Println("✅ S3 bucket created:", bucketName)
}

func setBucketPolicy(ctx context.Context) {
	policy, _ := json.Marshal(map[string]interface{}{
		"Version": "2012-10-17",
		"Statement": []map[string]interface{}{
			{
				"Effect":    "Allow",
				"Principal": "*",
				"Action":    "s3:GetObject",
				"Resource":  "arn:aws:s3:::" + bucketName + "/*",
			},
		},
	})
	_, err := s3c.PutBucketPolicy(ctx, &s3.PutBucketPolicyInput{
		Bucket: aws.String(bucketName),
		Policy: aws.String(string(policy)),
	})
	must(err, "set bucket policy")
	fmt.Println("✅ Bucket policy set (public read)")
}

func enableStaticWebsite(ctx context.Context) {
	_, err := s3c.PutBucketWebsite(ctx, &s3.PutBucketWebsiteInput{
		Bucket: aws.String(bucketName),
		WebsiteConfiguration: &s3types.WebsiteConfiguration{
			IndexDocument: &s3types.IndexDocument{Suffix: aws.String("index.html")},
			ErrorDocument: &s3types.ErrorDocument{Key: aws.String("404.html")},
		},
	})
	must(err, "enable static website hosting")
	fmt.Println("✅ Static website hosting enabled")
}

func uploadDir(ctx context.Context, localDir string) {
	count := 0
	err := filepath.Walk(localDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		rel, _ := filepath.Rel(localDir, path)
		key := filepath.ToSlash(rel)

		f, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("open %s: %w", path, err)
		}
		defer f.Close()

		ct := mime.TypeByExtension(filepath.Ext(path))
		if ct == "" {
			ct = "application/octet-stream"
		}

		_, err = s3c.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(key),
			Body:        f,
			ContentType: aws.String(ct),
		})
		if err != nil {
			return fmt.Errorf("upload %s: %w", key, err)
		}
		fmt.Println("  ↑", key)
		count++
		return nil
	})
	must(err, "upload directory")
	fmt.Printf("  ✅ %d files uploaded\n", count)
}

// ── CLOUDFRONT ────────────────────────────────────────────────────────────────

func createDistribution(ctx context.Context) (distID, distDomain string) {
	// CloudFront must point to the S3 website endpoint (not the REST endpoint)
	// so that it serves index.html for directories correctly
	s3WebsiteEndpoint := fmt.Sprintf("%s.s3-website.%s.amazonaws.com", bucketName, region)

	out, err := cfc.CreateDistribution(ctx, &cloudfront.CreateDistributionInput{
		DistributionConfig: &cftypes.DistributionConfig{
			CallerReference:   aws.String(fmt.Sprintf("eseva-%d", time.Now().Unix())),
			Comment:           aws.String("E-Seva frontend"),
			Enabled:           aws.Bool(true),
			DefaultRootObject: aws.String("index.html"),
			Aliases: &cftypes.Aliases{
				Quantity: aws.Int32(1),
				Items:    []string{domainName},
			},
			Origins: &cftypes.Origins{
				Quantity: aws.Int32(1),
				Items: []cftypes.Origin{
					{
						Id:         aws.String("S3-" + bucketName),
						DomainName: aws.String(s3WebsiteEndpoint),
						// Use CustomOriginConfig (not S3OriginConfig) because we're
						// pointing to the S3 website endpoint which is HTTP only
						CustomOriginConfig: &cftypes.CustomOriginConfig{
							HTTPPort:             aws.Int32(80),
							HTTPSPort:            aws.Int32(443),
							OriginProtocolPolicy: cftypes.OriginProtocolPolicyHttpOnly,
						},
					},
				},
			},
			DefaultCacheBehavior: &cftypes.DefaultCacheBehavior{
				TargetOriginId:       aws.String("S3-" + bucketName),
				ViewerProtocolPolicy: cftypes.ViewerProtocolPolicyRedirectToHttps,
				// AWS managed "CachingOptimized" policy ID
				CachePolicyId: aws.String("658327ea-f89d-4fab-a63d-7e88639e58f6"),
				AllowedMethods: &cftypes.AllowedMethods{
					Quantity: aws.Int32(2),
					Items:    []cftypes.Method{cftypes.MethodGet, cftypes.MethodHead},
				},
			},
			// SPA fallback: return index.html for 403/404 so Next.js client-side
			// routing works when users refresh or deep-link to a page
			CustomErrorResponses: &cftypes.CustomErrorResponses{
				Quantity: aws.Int32(2),
				Items: []cftypes.CustomErrorResponse{
					{
						ErrorCode:          aws.Int32(403),
						ResponseCode:       aws.Int32(200),
						ResponsePagePath:   aws.String("/index.html"),
						ErrorCachingMinTTL: aws.Int64(0),
					},
					{
						ErrorCode:          aws.Int32(404),
						ResponseCode:       aws.Int32(200),
						ResponsePagePath:   aws.String("/index.html"),
						ErrorCachingMinTTL: aws.Int64(0),
					},
				},
			},
			ViewerCertificate: &cftypes.ViewerCertificate{
				ACMCertificateArn:      aws.String(acmCertARN),
				SSLSupportMethod:       cftypes.SSLSupportMethodSniOnly,
				MinimumProtocolVersion: cftypes.MinimumProtocolVersionTLSv122021,
			},
			PriceClass: cftypes.PriceClassPriceClass200, // US + EU + Asia (covers India)
		},
	})
	must(err, "create CloudFront distribution")

	distID = *out.Distribution.Id
	distDomain = *out.Distribution.DomainName
	fmt.Println("✅ CloudFront distribution created")
	fmt.Println("   ID:    ", distID)
	fmt.Println("   Domain:", distDomain)
	return
}

func invalidateCache(ctx context.Context, distID string) {
	_, err := cfc.CreateInvalidation(ctx, &cloudfront.CreateInvalidationInput{
		DistributionId: aws.String(distID),
		InvalidationBatch: &cftypes.InvalidationBatch{
			CallerReference: aws.String(fmt.Sprintf("%d", time.Now().Unix())),
			Paths: &cftypes.Paths{
				Quantity: aws.Int32(1),
				Items:    []string{"/*"},
			},
		},
	})
	must(err, "invalidate CloudFront cache")
	fmt.Println("✅ Cache invalidated")
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

func must(err error, msg string) {
	if err != nil {
		// Hint for the most common error
		if strings.Contains(err.Error(), "AccessDenied") || strings.Contains(err.Error(), "not authorized") {
			fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
			fmt.Println("   → Add S3 + CloudFront permissions to your EC2 IAM role.")
			fmt.Println("   → Required: s3:*, cloudfront:CreateDistribution, cloudfront:CreateInvalidation")
		} else {
			fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
		}
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`
E-Seva Frontend Hosting Setup

Usage:
  go run setup_frontend_hosting.go setup              # First time: creates S3 + CloudFront
  go run setup_frontend_hosting.go deploy <distID>    # Every deploy: upload + invalidate cache
  go run setup_frontend_hosting.go help               # Show this message

Before running:
  1. Edit the CONFIG constants at the top of this file:
       - bucketName  (must be globally unique)
       - domainName  (your domain, e.g. app.yourdomain.com)
       - acmCertARN  (ACM cert in us-east-1 for your domain)

  2. Add these permissions to your EC2 IAM role:
       - s3:CreateBucket, s3:PutBucketPolicy, s3:PutBucketWebsite
       - s3:PutPublicAccessBlock, s3:PutObject
       - cloudfront:CreateDistribution, cloudfront:CreateInvalidation

  3. Build the frontend first:
       cd ../frontend && npm run build

Workflow:
  First time:
    go run setup_frontend_hosting.go setup
    → Add the CNAME DNS record shown in the output
    → Wait ~15 min for CloudFront to deploy

  Every update:
    cd ../frontend && npm run build
    cd ../backend
    go run setup_frontend_hosting.go deploy <distID>
`)
}
