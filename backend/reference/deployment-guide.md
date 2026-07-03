# E-Seva Deployment Reference

## Infrastructure Overview

| Component      | Details                                                                                       |
|----------------|-----------------------------------------------------------------------------------------------|
| Frontend       | S3 + CloudFront — `https://thuruvancommunications.com`                                        |
| Backend API    | EC2 + Nginx + SSL — `https://api.thuruvancommunications.com`                                  |
| Database       | DynamoDB — `ap-south-1`                                                                       |
| DNS            | Route 53 — `thuruvancommunications.com`                                                       |
| SSL (frontend) | ACM — `arn:aws:acm:us-east-1:483528440028:certificate/c83e44b0-1b0e-4037-932d-881724bc03f3`  |
| SSL (backend)  | Let's Encrypt — auto-renews via Certbot                                                       |

---

## EC2 Instance

| Field          | Value                      |
|----------------|----------------------------|
| Public IP      | `3.108.235.150`            |
| Private IP     | `172.31.11.141`            |
| User           | `ubuntu`                   |
| Repo path      | `/opt/eservice`            |
| Instance type  | `t3.small`                 |
| Region         | `ap-south-1`               |
| IAM Role       | `eseva-ec2-dynamodb-role`  |

---

## CloudFront Distribution

| Field  | Value                                          |
|--------|------------------------------------------------|
| ID     | `E1QSK2KO9YHZZH`                              |
| Domain | `d27p4qb1q08njc.cloudfront.net`               |
| Origin | `eseva-s3.s3-website.ap-south-1.amazonaws.com` |

---

## Route 53

| Field          | Value                       |
|----------------|-----------------------------|
| Hosted Zone ID | `Z02510323C23XYMZZEG25`     |
| Nameserver 1   | `ns-1403.awsdns-47.org`     |
| Nameserver 2   | `ns-71.awsdns-08.com`       |
| Nameserver 3   | `ns-567.awsdns-06.net`      |
| Nameserver 4   | `ns-1996.awsdns-57.co.uk`   |

---

## Deploy Frontend (Every Update)

SSH into EC2, then run:

```bash
cd /opt/eservice && git pull && \
cd frontend && npm run build && \
cd ~/fsetup && GOTOOLCHAIN=local GOTMPDIR=~/gobuild TMPDIR=~/gobuild \
/usr/local/go/bin/go run setup_frontend_hosting.go deploy E1QSK2KO9YHZZH
```

This will:
1. Pull latest code from GitHub
2. Build the Next.js static export into `/opt/eservice/frontend/out`
3. Upload all files to S3 bucket `eseva-s3`
4. Invalidate CloudFront cache so changes are live immediately

---

## Go Scripts (in `backend/`)

| Script                       | Purpose                                     | Run once? |
|------------------------------|---------------------------------------------|-----------|
| `setup_dynamodb.go`          | Creates DynamoDB tables                     | ✅ Yes    |
| `setup_frontend_hosting.go`  | Creates S3 bucket + CloudFront distribution | ✅ Yes    |
| `setup_route53.go`           | Creates Route 53 hosted zone + DNS records  | ✅ Yes    |
| `setup_backend_https.go`     | Adds `api.` A record in Route 53            | ✅ Yes    |

### How to run any script on EC2

```bash
cd /opt/eservice && git pull
cp backend/<script_name>.go ~/fsetup/
cd ~/fsetup && GOTOOLCHAIN=local GOTMPDIR=~/gobuild TMPDIR=~/gobuild \
/usr/local/go/bin/go run <script_name>.go
```

---

## Backend (Go + Gin)

- Runs on port `8080`
- Nginx proxies `https://api.thuruvancommunications.com` → `http://localhost:8080`

### Restart backend

```bash
cd /opt/eservice/backend && ./eservice-backend
```

### Run in background

```bash
cd /opt/eservice/backend && nohup ./eservice-backend > /tmp/backend.log 2>&1 &
```

### Rebuild after code changes

```bash
cd /opt/eservice/backend && go build -o eservice-backend . && ./eservice-backend
```

---

## Environment Variables

### Frontend — `frontend/.env.production`

```
NEXT_PUBLIC_API_URL=https://api.thuruvancommunications.com
NEXT_PUBLIC_ADMIN_KEY=eseva-admin-2024
NEXT_PUBLIC_LAMBDA_URL=https://daqpqxq9zg.execute-api.ap-south-1.amazonaws.com/prod
NEXT_PUBLIC_UPI_ID=mkksriptsami@oksbi
```

### Backend — `backend/.env`

Loaded from `/opt/eservice/backend/.env` on EC2 (not committed to GitHub).

---

## EC2 Go Setup

| Field         | Value                  |
|---------------|------------------------|
| Go binary     | `/usr/local/go/bin/go` |
| Go version    | `1.23.4`               |
| Working dir   | `~/fsetup`             |
| Build cache   | `~/gobuild`            |
| go.mod module | `fsetup`               |

Always prefix Go script runs with:

```
GOTOOLCHAIN=local GOTMPDIR=~/gobuild TMPDIR=~/gobuild /usr/local/go/bin/go run
```
