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

// ── CONFIG — edit these before running ────────────────────────────────────────
const (
	bucketName = "eseva-frontend"   // must be globally unique
	region     = "ap-south-1"       // Mumbai
	domainName = "yourdomain.com"   // your custom domain
	// ACM cert must be in us-east-1 for CloudFront
	acmCertARN = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
	outDir     = "../frontend/out"  // next build output folder
)

// ─────────────────────────────────────────────────────────────────────────────

func main() {
	ctx := context.Background()

	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	must(err, "load AWS config")

	s3c := s3.NewFromConfig(cfg)
	cfc := cloudfront.NewFromConfig(cfg)

	switch arg(1) {
	case "setup":
		distID := setup(ctx, s3c, cfc)
		fmt.Println("\n✅ Setup complete!")
		fmt.Println("   Distribution ID:", distID)
		fmt.Println("   👉 Add a CNAME record: ", domainName, "→ <dist>.cloudfront.net")
		fmt.Println("   Then run: go run deploy.go deploy", distID)
	case "deploy":
		distID := arg(2)
		if distID == "" {
			fmt.Fprintln(os.Stderr, "❌ Usage: go run deploy.go deploy <distributionID>")
			os.Exit(1)
		}
		deploy(ctx, s3c, cfc, distID)
	default:
		fmt.Println("Usage:")
		fmt.Println("  go run deploy.go setup              # first time only")
		fmt.Println("  go run deploy.go deploy <distID>    # every deploy")
	}
}

// setup creates S3 bucket + CloudFront distribution (run once)
func setup(ctx context.Context, s3c *s3.Client, cfc *cloudfront.Client) string {
	createBucket(ctx, s3c)
	setBucketPolicy(ctx, s3c)
	enableStaticWebsite(ctx, s3c)
	return createDistribution(ctx, cfc)
}

// deploy uploads out/ to S3 then invalidates CloudFront cache
func deploy(ctx context.Context, s3c *s3.Client, cfc *cloudfront.Client, distID string) {
	fmt.Println("📦 Uploading files from", outDir)
	uploadDir(ctx, s3c, outDir)
	fmt.Println("🔄 Invalidating CloudFront cache...")
	invalidateCache(ctx, cfc, distID)
	fmt.Println("✅ Deploy complete!")
}

// ── S3 ────────────────────────────────────────────────────────────────────────

func createBucket(ctx context.Context, c *s3.Client) {
	_, err := c.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(bucketName),
		CreateBucketConfiguration: &s3types.CreateBucketConfiguration{
			LocationConstraint: s3types.BucketLocationConstraint(region),
		},
	})
	must(err, "create bucket")

	_, err = c.PutPublicAccessBlock(ctx, &s3.PutPublicAccessBlockInput{
		Bucket: aws.String(bucketName),
		PublicAccessBlockConfiguration: &s3types.PublicAccessBlockConfiguration{
			BlockPublicAcls:       aws.Bool(false),
			IgnorePublicAcls:      aws.Bool(false),
			BlockPublicPolicy:     aws.Bool(false),
			RestrictPublicBuckets: aws.Bool(false),
		},
	})
	must(err, "disable block public access")
	fmt.Println("✅ Bucket created:", bucketName)
}

func setBucketPolicy(ctx context.Context, c *s3.Client) {
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
	_, err := c.PutBucketPolicy(ctx, &s3.PutBucketPolicyInput{
		Bucket: aws.String(bucketName),
		Policy: aws.String(string(policy)),
	})
	must(err, "set bucket policy")
	fmt.Println("✅ Bucket policy set (public read)")
}

func enableStaticWebsite(ctx context.Context, c *s3.Client) {
	_, err := c.PutBucketWebsite(ctx, &s3.PutBucketWebsiteInput{
		Bucket: aws.String(bucketName),
		WebsiteConfiguration: &s3types.WebsiteConfiguration{
			IndexDocument: &s3types.IndexDocument{Suffix: aws.String("index.html")},
			ErrorDocument: &s3types.ErrorDocument{Key: aws.String("404.html")},
		},
	})
	must(err, "enable static website hosting")
	fmt.Println("✅ Static website hosting enabled")
}

func uploadDir(ctx context.Context, c *s3.Client, localDir string) {
	err := filepath.Walk(localDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		rel, _ := filepath.Rel(localDir, path)
		key := filepath.ToSlash(rel)

		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()

		ct := mime.TypeByExtension(filepath.Ext(path))
		if ct == "" {
			ct = "application/octet-stream"
		}

		_, err = c.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(key),
			Body:        f,
			ContentType: aws.String(ct),
		})
		if err != nil {
			return fmt.Errorf("upload %s: %w", key, err)
		}
		fmt.Println("  ↑", key)
		return nil
	})
	must(err, "upload directory")
}

// ── CLOUDFRONT ────────────────────────────────────────────────────────────────

func createDistribution(ctx context.Context, c *cloudfront.Client) string {
	s3WebsiteOrigin := fmt.Sprintf("%s.s3-website.%s.amazonaws.com", bucketName, region)

	out, err := c.CreateDistribution(ctx, &cloudfront.CreateDistributionInput{
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
						DomainName: aws.String(s3WebsiteOrigin),
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
				// AWS managed CachingOptimized policy
				CachePolicyId: aws.String("658327ea-f89d-4fab-a63d-7e88639e58f6"),
				AllowedMethods: &cftypes.AllowedMethods{
					Quantity: aws.Int32(2),
					Items:    []cftypes.Method{cftypes.MethodGet, cftypes.MethodHead},
				},
			},
			// SPA fallback: serve index.html for all 403/404 so Next.js routing works
			CustomErrorResponses: &cftypes.CustomErrorResponses{
				Quantity: aws.Int32(2),
				Items: []cftypes.CustomErrorResponse{
					{ErrorCode: aws.Int32(403), ResponseCode: aws.Int32(200), ResponsePagePath: aws.String("/index.html"), ErrorCachingMinTTL: aws.Int64(0)},
					{ErrorCode: aws.Int32(404), ResponseCode: aws.Int32(200), ResponsePagePath: aws.String("/index.html"), ErrorCachingMinTTL: aws.Int64(0)},
				},
			},
			ViewerCertificate: &cftypes.ViewerCertificate{
				ACMCertificateArn:      aws.String(acmCertARN),
				SSLSupportMethod:       cftypes.SSLSupportMethodSniOnly,
				MinimumProtocolVersion: cftypes.MinimumProtocolVersionTLSv122021,
			},
			PriceClass: cftypes.PriceClassPriceClass200, // US + EU + Asia
		},
	})
	must(err, "create CloudFront distribution")

	fmt.Println("✅ CloudFront distribution created")
	fmt.Println("   Domain:", *out.Distribution.DomainName)
	return *out.Distribution.Id
}

func invalidateCache(ctx context.Context, c *cloudfront.Client, distID string) {
	_, err := c.CreateInvalidation(ctx, &cloudfront.CreateInvalidationInput{
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
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

func must(err error, msg string) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
		os.Exit(1)
	}
}

func arg(i int) string {
	if len(os.Args) > i {
		return strings.TrimSpace(os.Args[i])
	}
	return ""
}
