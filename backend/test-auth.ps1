# PowerShell Script to Test E-Service Authentication API
# Run this script: .\test-auth.ps1

$baseUrl = "http://localhost:8080"
$apiUrl = "$baseUrl/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E-Service Authentication API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ PASSED: Health check successful" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 2: Login with Default Admin
Write-Host "Test 2: Login with Default Admin" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@eservice.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $accessToken = $loginResponse.access_token
    $refreshToken = $loginResponse.refresh_token
    
    Write-Host "✓ PASSED: Login successful" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "  Status: $($loginResponse.user.status)" -ForegroundColor Gray
    Write-Host "  Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Login failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 3: Get User Profile (Protected Route)
Write-Host "Test 3: Get User Profile (Protected Route)" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }

    $profileResponse = Invoke-RestMethod -Uri "$apiUrl/profile" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ PASSED: Profile retrieved successfully" -ForegroundColor Green
    Write-Host "  ID: $($profileResponse.id)" -ForegroundColor Gray
    Write-Host "  Email: $($profileResponse.email)" -ForegroundColor Gray
    Write-Host "  Name: $($profileResponse.full_name)" -ForegroundColor Gray
    Write-Host "  Role: $($profileResponse.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Profile retrieval failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Register New User
Write-Host "Test 4: Register New User" -ForegroundColor Yellow
try {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $registerBody = @{
        email = "testuser_$timestamp@test.com"
        password = "password123"
        full_name = "Test User $timestamp"
        phone = "+1234567890"
        role = "retailer"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$apiUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody

    Write-Host "✓ PASSED: User registered successfully" -ForegroundColor Green
    Write-Host "  Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "  Name: $($registerResponse.user.full_name)" -ForegroundColor Gray
    Write-Host "  Role: $($registerResponse.user.role)" -ForegroundColor Gray
    Write-Host "  Status: $($registerResponse.user.status)" -ForegroundColor Gray
    Write-Host "  Message: $($registerResponse.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: User registration failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Login with Wrong Password (Should Fail)
Write-Host "Test 5: Login with Wrong Password (Should Fail)" -ForegroundColor Yellow
try {
    $wrongLoginBody = @{
        email = "admin@eservice.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $wrongLoginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $wrongLoginBody

    Write-Host "✗ FAILED: Should have rejected wrong password" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ PASSED: Wrong password correctly rejected" -ForegroundColor Green
    Write-Host "  Expected error received" -ForegroundColor Gray
    Write-Host ""
}

# Test 6: Access Protected Route Without Token (Should Fail)
Write-Host "Test 6: Access Protected Route Without Token (Should Fail)" -ForegroundColor Yellow
try {
    $noTokenResponse = Invoke-RestMethod -Uri "$apiUrl/profile" -Method Get
    Write-Host "✗ FAILED: Should have rejected request without token" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ PASSED: Request without token correctly rejected" -ForegroundColor Green
    Write-Host "  Expected error received" -ForegroundColor Gray
    Write-Host ""
}

# Test 7: Refresh Access Token
Write-Host "Test 7: Refresh Access Token" -ForegroundColor Yellow
try {
    $refreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $refreshResponse = Invoke-RestMethod -Uri "$apiUrl/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshBody

    Write-Host "✓ PASSED: Token refreshed successfully" -ForegroundColor Green
    Write-Host "  New Access Token: $($refreshResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Token refresh failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 8: Wallet Balance (Placeholder endpoint)
Write-Host "Test 8: Get Wallet Balance" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }

    $walletResponse = Invoke-RestMethod -Uri "$apiUrl/wallet/balance" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ PASSED: Wallet balance retrieved" -ForegroundColor Green
    Write-Host "  Response: $($walletResponse.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Wallet balance retrieval failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 9: Logout
Write-Host "Test 9: Logout" -ForegroundColor Yellow
try {
    $logoutBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $logoutResponse = Invoke-RestMethod -Uri "$apiUrl/auth/logout" `
        -Method Post `
        -ContentType "application/json" `
        -Body $logoutBody

    Write-Host "✓ PASSED: Logout successful" -ForegroundColor Green
    Write-Host "  Message: $($logoutResponse.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ FAILED: Logout failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 10: Use Revoked Refresh Token (Should Fail)
Write-Host "Test 10: Use Revoked Refresh Token (Should Fail)" -ForegroundColor Yellow
try {
    $revokedRefreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $revokedResponse = Invoke-RestMethod -Uri "$apiUrl/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $revokedRefreshBody

    Write-Host "✗ FAILED: Should have rejected revoked token" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "✓ PASSED: Revoked token correctly rejected" -ForegroundColor Green
    Write-Host "  Expected error received" -ForegroundColor Gray
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Suite Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the results above for any failures." -ForegroundColor White
Write-Host "Backend is running on: $baseUrl" -ForegroundColor White
Write-Host ""
