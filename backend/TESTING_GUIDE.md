# Backend Authentication Testing Guide

This guide will help you test the authentication system locally using various methods.

## Prerequisites

Before testing, ensure you have:
- ✅ PostgreSQL installed and running
- ✅ Go 1.21+ installed
- ✅ Backend configured with `.env` file

## Step 1: Setup and Start the Backend

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
go mod download
```

### 3. Create and configure .env file
```bash
copy .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=eservice_user
DB_PASSWORD=your_password
DB_NAME=eservice_db
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE eservice_db;
CREATE USER eservice_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eservice_db TO eservice_user;
```

### 5. Start the backend server
```bash
go run cmd/api/main.go
```

You should see:
```
Successfully connected to PostgreSQL database
Database schema initialized successfully
Starting server on port 8080
```

## Step 2: Testing Methods

### Method 1: Using cURL (Command Line)

#### Test 1: Health Check
```bash
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "E-Service API is running"
}
```

#### Test 2: Login with Default Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@eservice.com\",\"password\":\"admin123\"}"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@eservice.com",
    "full_name": "System Admin",
    "phone": "",
    "role": "admin",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Save the access_token for next tests!**

#### Test 3: Register New User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"retailer@test.com\",\"password\":\"password123\",\"full_name\":\"Test Retailer\",\"phone\":\"+1234567890\",\"role\":\"retailer\"}"
```

**Expected Response:**
```json
{
  "message": "User registered successfully. Please wait for admin approval.",
  "user": {
    "id": 2,
    "email": "retailer@test.com",
    "full_name": "Test Retailer",
    "phone": "+1234567890",
    "role": "retailer",
    "status": "pending"
  }
}
```

#### Test 4: Get User Profile (Protected Route)
Replace `YOUR_ACCESS_TOKEN` with the token from login:

```bash
curl -X GET http://localhost:8080/api/v1/profile ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "email": "admin@eservice.com",
  "full_name": "System Admin",
  "role": "admin",
  "status": "active"
}
```

#### Test 5: Refresh Access Token
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh_token\":\"YOUR_REFRESH_TOKEN\"}"
```

#### Test 6: Logout
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh_token\":\"YOUR_REFRESH_TOKEN\"}"
```

### Method 2: Using PowerShell

#### Login Test
```powershell
$body = @{
    email = "admin@eservice.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json
$token = $response.access_token
```

#### Get Profile Test
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/profile" `
    -Method Get `
    -Headers $headers | ConvertTo-Json
```

### Method 3: Using Postman

1. **Download Postman**: https://www.postman.com/downloads/

2. **Import Collection**: Create a new collection called "E-Service Auth"

3. **Add Requests**:

#### Request 1: Login
- **Method**: POST
- **URL**: `http://localhost:8080/api/v1/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "admin@eservice.com",
  "password": "admin123"
}
```
- **Tests** (to save token):
```javascript
var jsonData = pm.response.json();
pm.environment.set("access_token", jsonData.access_token);
pm.environment.set("refresh_token", jsonData.refresh_token);
```

#### Request 2: Get Profile
- **Method**: GET
- **URL**: `http://localhost:8080/api/v1/profile`
- **Headers**: 
  - `Authorization: Bearer {{access_token}}`

#### Request 3: Register User
- **Method**: POST
- **URL**: `http://localhost:8080/api/v1/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "newuser@test.com",
  "password": "password123",
  "full_name": "New User",
  "phone": "+1234567890",
  "role": "retailer"
}
```

### Method 4: Using the Frontend

1. **Start the Next.js frontend**:
```bash
# In the project root directory
npm run dev
```

2. **Open browser**: http://localhost:3000/login

3. **Login with default admin**:
   - Email: `admin@eservice.com`
   - Password: `admin123`

4. **Test registration**: http://localhost:3000/register

5. **Check browser console** (F12) to see API calls and responses

### Method 5: Using VS Code REST Client Extension

1. **Install Extension**: "REST Client" by Huachao Mao

2. **Create test file**: `backend/test-api.http`

```http
### Health Check
GET http://localhost:8080/health

### Login
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@eservice.com",
  "password": "admin123"
}

### Get Profile (replace with your token)
GET http://localhost:8080/api/v1/profile
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE

### Register New User
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User",
  "phone": "+1234567890",
  "role": "retailer"
}

### Refresh Token
POST http://localhost:8080/api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "YOUR_REFRESH_TOKEN_HERE"
}

### Logout
POST http://localhost:8080/api/v1/auth/logout
Content-Type: application/json

{
  "refresh_token": "YOUR_REFRESH_TOKEN_HERE"
}
```

3. **Click "Send Request"** above each request

## Step 3: Test Scenarios

### Scenario 1: Complete User Journey

1. **Register a new user**
2. **Try to login** (should fail - status is "pending")
3. **Login as admin**
4. **Approve the user** (feature to be implemented)
5. **Login with new user** (should succeed)

### Scenario 2: Token Expiration

1. **Login and get access token**
2. **Wait for token to expire** (or modify JWT_EXPIRY_HOURS to 1 minute for testing)
3. **Try to access protected route** (should fail with 401)
4. **Use refresh token** to get new access token
5. **Access protected route again** (should succeed)

### Scenario 3: Role-Based Access

1. **Login as admin**
2. **Access admin-only endpoint** (should succeed)
3. **Login as retailer**
4. **Try to access admin endpoint** (should fail with 403)

## Step 4: Verify Database

### Check Users Table
```sql
SELECT id, email, full_name, role, status, created_at 
FROM users;
```

### Check Refresh Tokens
```sql
SELECT id, user_id, expires_at, revoked, created_at 
FROM refresh_tokens 
ORDER BY created_at DESC;
```

### Check Wallets
```sql
SELECT w.id, w.user_id, u.email, w.main_balance, w.api_balance 
FROM wallets w 
JOIN users u ON w.user_id = u.id;
```

## Common Issues and Solutions

### Issue 1: "Failed to connect to database"
**Solution**: 
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Issue 2: "Port already in use"
**Solution**:
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

### Issue 3: "Invalid credentials"
**Solution**:
- Check email and password are correct
- Verify user exists in database
- Check user status is "active"

### Issue 4: "Account is not active"
**Solution**:
- New users have "pending" status
- Update status to "active" in database:
```sql
UPDATE users SET status = 'active' WHERE email = 'user@example.com';
```

## Expected Test Results

### ✅ Successful Tests:
- Health check returns 200 OK
- Login with valid credentials returns tokens
- Protected routes work with valid token
- Registration creates new user
- Refresh token generates new access token
- Logout revokes refresh token

### ❌ Expected Failures:
- Login with wrong password returns 401
- Access protected route without token returns 401
- Access admin route as retailer returns 403
- Login with pending user returns error
- Use revoked refresh token returns error

## Performance Testing

### Test Response Times
```bash
# Windows - measure time
Measure-Command { 
    Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"email":"admin@eservice.com","password":"admin123"}'
}
```

Expected response time: < 200ms

## Security Testing

### Test 1: SQL Injection
Try login with:
```json
{
  "email": "admin@eservice.com' OR '1'='1",
  "password": "anything"
}
```
**Expected**: Should fail (protected by parameterized queries)

### Test 2: Invalid Token
```bash
curl -X GET http://localhost:8080/api/v1/profile ^
  -H "Authorization: Bearer invalid_token_here"
```
**Expected**: 401 Unauthorized

### Test 3: Expired Token
Use an old token
**Expected**: 401 Unauthorized with "Invalid or expired token"

## Next Steps

After successful testing:
1. ✅ Implement user approval workflow
2. ✅ Add wallet management endpoints
3. ✅ Implement application submission
4. ✅ Add file upload functionality
5. ✅ Integrate with frontend completely

## Support

If you encounter issues:
1. Check backend logs in terminal
2. Check PostgreSQL logs
3. Verify `.env` configuration
4. Review this guide
5. Check `backend/README.md` for more details
