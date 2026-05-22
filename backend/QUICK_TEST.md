# Quick Test Guide - Backend Authentication

## Current Status
✅ Go is installed (v1.25.6)
✅ Dependencies downloaded
✅ .env file created
❌ PostgreSQL needs to be installed

## Option 1: Install PostgreSQL (Recommended)

### Step 1: Download PostgreSQL
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 installer
3. Run the installer
4. Remember the password you set for the `postgres` user

### Step 2: Create Database
After installation, open Command Prompt or PowerShell:

```powershell
# Login to PostgreSQL (enter password when prompted)
psql -U postgres

# In psql, run these commands:
CREATE DATABASE eservice_db;
CREATE USER eservice_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE eservice_db TO eservice_user;
\q
```

### Step 3: Update .env file
Edit `backend\.env` and update the database password:
```env
DB_PASSWORD=your_secure_password
```

### Step 4: Start Backend
```powershell
cd backend
go run cmd/api/main.go
```

### Step 5: Run Tests
Open a new terminal and run:
```powershell
cd backend
.\test-auth.ps1
```

## Option 2: Use Docker PostgreSQL (Alternative)

If you have Docker installed:

```powershell
# Start PostgreSQL in Docker
docker run --name eservice-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=eservice_db -p 5432:5432 -d postgres:16

# Update .env
DB_USER=postgres
DB_PASSWORD=postgres
```

Then start the backend and run tests.

## Option 3: Test API Endpoints Manually (Without Database)

You can test if the Go server compiles and runs:

```powershell
cd backend
go build cmd/api/main.go
```

If it compiles successfully, the code is correct. You just need PostgreSQL to run it.

## Quick Manual Test (After PostgreSQL Setup)

### Test 1: Health Check
```powershell
curl http://localhost:8080/health
```

### Test 2: Login
```powershell
$body = @{
    email = "admin@eservice.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
```

### Test 3: Register User
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    full_name = "Test User"
    role = "retailer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $body
```

## Troubleshooting

### Error: "Failed to connect to database"
- PostgreSQL is not running
- Check credentials in .env file
- Verify database exists

### Error: "Port 8080 already in use"
```powershell
# Find and kill the process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Error: "go: command not found"
- Go is not in PATH
- Restart terminal after Go installation

## Next Steps After Setup

1. ✅ Install PostgreSQL
2. ✅ Create database and user
3. ✅ Start backend server
4. ✅ Run automated tests
5. ✅ Test with frontend (npm run dev)

## Need Help?

Check these files:
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `README.md` - Full documentation
- `test-api.http` - VS Code REST Client tests
- `test-auth.ps1` - Automated test script
