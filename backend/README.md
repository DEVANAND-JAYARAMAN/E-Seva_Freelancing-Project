# E-Service Backend API

Go-based authentication and API backend for the E-Service Dashboard.

## Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Admin, Distributor, Retailer, Customer)
- ✅ PostgreSQL database with transaction safety
- ✅ Wallet management system
- ✅ Secure password hashing with bcrypt
- ✅ CORS support for Next.js frontend
- ✅ Audit logging
- ✅ RESTful API design

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 13 or higher
- Git

## Installation

### 1. Clone and Setup

```bash
cd backend
```

### 2. Install Dependencies

```bash
go mod download
```

### 3. Configure Environment

Copy the example environment file and update with your settings:

```bash
copy .env.example .env
```

Edit `.env` and configure:
- Database credentials
- JWT secret (use a strong random string)
- CORS allowed origins
- Server port

### 4. Setup PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE eservice_db;
CREATE USER eservice_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE eservice_db TO eservice_user;
```

### 5. Run the Application

```bash
go run cmd/api/main.go
```

The server will start on `http://localhost:8080` (or your configured port).

The database schema will be automatically initialized on first run.

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "retailer"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "retailer",
    "status": "active"
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

#### Get User Profile
```http
GET /api/v1/profile
Authorization: Bearer <access_token>
```

#### Wallet Balance
```http
GET /api/v1/wallet/balance
Authorization: Bearer <access_token>
```

#### Request Wallet Top-up
```http
POST /api/v1/wallet/request
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 1000.00,
  "payment_reference": "TXN123456"
}
```

### Admin Only Endpoints

#### List All Users
```http
GET /api/v1/admin/users
Authorization: Bearer <admin_access_token>
```

## User Roles

- **admin**: Full system access, can approve users and wallet requests
- **distributor**: Can manage retailers under them
- **retailer**: Can submit applications and manage their wallet
- **customer**: Basic access to services

## User Status

- **pending**: Newly registered, awaiting admin approval
- **active**: Approved and can use the system
- **suspended**: Temporarily disabled
- **inactive**: Permanently disabled

## Default Admin Account

A default admin account is created on first run:

- **Email**: admin@eservice.com
- **Password**: admin123
- **Role**: admin
- **Status**: active

⚠️ **Important**: Change this password immediately in production!

## Database Schema

The application automatically creates the following tables:

- `users` - User accounts and authentication
- `wallets` - User wallet balances
- `wallet_transactions` - Transaction ledger
- `wallet_requests` - Top-up requests
- `refresh_tokens` - JWT refresh tokens
- `audit_logs` - System audit trail

## Development

### Run with Auto-reload

Install Air for hot reloading:

```bash
go install github.com/cosmtrek/air@latest
air
```

### Run Tests

```bash
go test ./...
```

### Build for Production

```bash
go build -o eservice-api cmd/api/main.go
```

## Frontend Integration

### Next.js API Client

Create `lib/api.ts` in your Next.js project:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  return response;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  
  register: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getProfile: async () => {
    const response = await fetchWithAuth('/profile');
    return response.json();
  },
};
```

### Environment Variables

Add to your Next.js `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Change default admin password**
3. **Use strong JWT secrets** (minimum 32 characters)
4. **Enable PostgreSQL SSL** in production
5. **Implement rate limiting** for auth endpoints
6. **Regular security audits**
7. **Keep dependencies updated**

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Test connection
psql -h localhost -U eservice_user -d eservice_db
```

### Port Already in Use

Change the `PORT` in `.env` file or kill the process:

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

## License

MIT License - see LICENSE file for details
