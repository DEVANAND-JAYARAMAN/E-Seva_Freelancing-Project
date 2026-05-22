# E-Service Authentication Setup Guide

This guide will help you set up the complete authentication system for the E-Service application.

## Architecture Overview

- **Frontend**: Next.js 14 (React) - Port 3000
- **Backend**: Go (Golang) with Gin framework - Port 8080
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)

## Prerequisites

1. **Node.js** (v18 or higher) - for Next.js frontend
2. **Go** (v1.21 or higher) - for backend API
3. **PostgreSQL** (v13 or higher) - for database
4. **Git** - for version control

## Step 1: Database Setup

### Install PostgreSQL

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

**After installation:**

1. Open pgAdmin or use psql command line
2. Create the database and user:

```sql
CREATE DATABASE eservice_db;
CREATE USER eservice_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE eservice_db TO eservice_user;
```

## Step 2: Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Install Go dependencies

```bash
go mod download
```

### 3. Configure environment variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` file with your settings:

```env
PORT=8080
GIN_MODE=debug

DB_HOST=localhost
DB_PORT=5432
DB_USER=eservice_user
DB_PASSWORD=your_secure_password
DB_NAME=eservice_db
DB_SSLMODE=disable

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRY_HOURS=24
JWT_REFRESH_EXPIRY_HOURS=168

ALLOWED_ORIGINS=http://localhost:3000
```

**Important**: Change `JWT_SECRET` to a strong random string (minimum 32 characters)!

### 4. Run the backend

```bash
go run cmd/api/main.go
```

The backend will:
- Start on http://localhost:8080
- Automatically create database tables
- Create a default admin account:
  - Email: `admin@eservice.com`
  - Password: `admin123`

You should see:
```
Successfully connected to PostgreSQL database
Database schema initialized successfully
Starting server on port 8080
```

## Step 3: Frontend Setup

### 1. Navigate to project root (if in backend folder)

```bash
cd ..
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` file:

```bash
copy .env.local.example .env.local
```

The file should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 4. Run the frontend

```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Step 4: Test the Authentication

### 1. Access the application

Open your browser and go to: http://localhost:3000/login

### 2. Login with default admin account

- **Email**: admin@eservice.com
- **Password**: admin123

### 3. Register a new user

1. Click "Register here" on the login page
2. Fill in the registration form
3. Select a role (Retailer, Distributor, or Customer)
4. Submit the form

**Note**: New users will have "pending" status and need admin approval to login.

### 4. Test API endpoints

You can test the API using curl or Postman:

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@eservice.com\",\"password\":\"admin123\"}"
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles and Permissions

The system supports 4 user roles:

1. **Admin** - Full system access
   - Approve/reject user registrations
   - Approve wallet top-up requests
   - Manage all users
   - Access all features

2. **Distributor** - Manage retailers
   - View and manage retailers under them
   - Process applications
   - Manage wallet

3. **Retailer** - Submit applications
   - Submit service applications
   - Request wallet top-ups
   - View application status
   - Download receipts

4. **Customer** - Basic access
   - View services
   - Track applications

## User Status

- **pending** - Newly registered, awaiting admin approval
- **active** - Approved and can use the system
- **suspended** - Temporarily disabled
- **inactive** - Permanently disabled

## API Endpoints

### Public Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Protected Endpoints (Require Authentication)

- `GET /api/v1/profile` - Get user profile
- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/request` - Request wallet top-up
- `GET /api/v1/applications` - List applications
- `POST /api/v1/applications` - Submit application

### Admin Only Endpoints

- `GET /api/v1/admin/users` - List all users

## Troubleshooting

### Backend won't start

**Error: "Failed to connect to database"**
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

**Error: "Port already in use"**
- Change PORT in `.env` file
- Or kill the process using port 8080

### Frontend can't connect to backend

**Error: "Failed to fetch"**
- Ensure backend is running on port 8080
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings in backend

### Login fails

**Error: "Account is not active"**
- New users need admin approval
- Login with admin account first
- Implement user approval feature (coming soon)

## Next Steps

### Implement Additional Features

1. **User Management** (Admin)
   - List all users
   - Approve/reject registrations
   - Change user status

2. **Wallet Management**
   - View balance
   - Request top-ups
   - Transaction history
   - Admin approval workflow

3. **Application System**
   - Submit applications (Aadhaar, PAN, etc.)
   - Upload documents
   - Track status
   - Download receipts

4. **PDF Generation**
   - Generate receipts
   - Application confirmations

5. **File Upload (AWS S3)**
   - Document uploads
   - Secure storage
   - Presigned URLs

## Security Best Practices

1. ✅ Change default admin password immediately
2. ✅ Use strong JWT secret (minimum 32 characters)
3. ✅ Enable HTTPS in production
4. ✅ Use environment variables for secrets
5. ✅ Enable PostgreSQL SSL in production
6. ✅ Implement rate limiting
7. ✅ Regular security audits
8. ✅ Keep dependencies updated

## Production Deployment

### Backend

1. Build the binary:
```bash
cd backend
go build -o eservice-api cmd/api/main.go
```

2. Set production environment variables
3. Use a process manager (systemd, PM2, or Docker)
4. Enable HTTPS with reverse proxy (nginx)
5. Use managed PostgreSQL (AWS RDS, etc.)

### Frontend

1. Build the Next.js app:
```bash
npm run build
```

2. Deploy to Vercel, Netlify, or your server
3. Set production environment variables
4. Configure custom domain

## Support

For issues or questions:
1. Check the logs (backend and frontend)
2. Review this guide
3. Check the API documentation in `backend/README.md`

## License

MIT License
