# Thuruvan Billing Stack

Next.js (Frontend) + Golang (Backend) + AWS RDS (MySQL)

## Folder structure

```
Thuruvan-Billing-Stack/
├── database/schema.sql      ← AWS RDS import
├── backend/                 ← Golang REST API (port 8080)
└── frontend/                ← Next.js UI (port 3000)
```

## 1. AWS RDS Setup

1. AWS Console → RDS → Create database → **MySQL 8**
2. Region: `ap-south-1` (Mumbai) recommended
3. Public access: Yes (dev) / VPC only (production)
4. Security group: allow port **3306** from your IP / EC2
5. Connect via MySQL client → run `database/schema.sql`

## 2. Backend (Golang)

```bash
cd backend
copy .env.example .env
# Edit .env with AWS RDS endpoint + password

go mod tidy
go run ./cmd/server
```

API: http://localhost:8080/health

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/shop | Shop settings |
| PUT | /api/v1/shop | Update shop |
| GET | /api/v1/services | List services |
| POST | /api/v1/services | Add service |
| GET | /api/v1/bills?date=YYYY-MM-DD | Day bills |
| POST | /api/v1/bills | Create bill |
| GET | /api/v1/bills/:id | Bill + items |

Login: `admin@billing.local` / `password`

## 3. Frontend (Next.js)

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Open: http://localhost:3000

## 4. Deploy to AWS (production)

| Part | AWS service |
|------|-------------|
| Database | **RDS MySQL** (already) |
| Go API | **EC2** or **ECS Fargate** or **App Runner** |
| Next.js | **Amplify** or **Vercel** or **S3+CloudFront** |

Set env:
- Backend: `DB_HOST`, `DB_PASS`, `FRONTEND_URL=https://your-domain.com`
- Frontend: `NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1`

## Local test without AWS

Use Laragon MySQL:
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=thuruvan_billing
```

Import `database/schema.sql` in phpMyAdmin.

## Old PHP code

PHP/Laravel code is **not used** here. Same billing logic, new stack.
