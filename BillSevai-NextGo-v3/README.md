# BillSevai v3 — Next.js + Golang + AWS

Port of BillSevai v2 billing to a modern stack.

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 |
| Backend | Go (Gin) REST API |
| Database | MySQL (Laragon local / AWS RDS) |

## Quick start (Windows + Laragon)

1. Install [Go](https://go.dev/dl/) and restart PC
2. Run `IMPORT-DB.bat` (Laragon MySQL must be running)
3. Copy `backend/.env.example` → `backend/.env` and set DB credentials
4. Run `START-ALL.bat`
5. Open http://localhost:3000 — login `owner@demo.test` / `password`

## API

Base URL: `http://localhost:8080/api/v1`

- `POST /auth/login`, `POST /auth/register`
- `GET /dashboard`, `GET|PUT /shop`
- `GET|POST /services`, `GET|POST /customers`
- `GET|POST /bills`, `GET /bills/:id`

## AWS RDS

1. Create MySQL 8 RDS instance in `ap-south-1`
2. Security group: allow 3306 from your app server
3. Import `database/schema.sql`
4. Set `backend/.env` with RDS host, user, password, `DB_SSL=true`
5. Deploy Go API on EC2; set `NEXT_PUBLIC_API_URL` on frontend host

## Project structure

```
BillSevai-NextGo/
  frontend/     Next.js app
  backend/      Go API
  database/     schema.sql
  START-ALL.bat
  IMPORT-DB.bat
```
