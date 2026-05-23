$baseUrl = "http://localhost:8080"
$apiUrl = "$baseUrl/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mugavi Gateway Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login with Default Admin to test (or use a retailer, admin is fine as it has a wallet)
Write-Host "1. Logging in..." -ForegroundColor Yellow
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
    Write-Host "✓ PASSED: Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Login failed" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $accessToken"
}

# Check initial balance
Write-Host "2. Checking initial balance..." -ForegroundColor Yellow
try {
    $balResponse = Invoke-RestMethod -Uri "$apiUrl/wallet/balance" -Method Get -Headers $headers
    $initialBalance = $balResponse.balance.main_balance
    Write-Host "✓ PASSED: Initial Balance: $initialBalance" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Balance check failed" -ForegroundColor Red
    exit 1
}

# Initiate gateway recharge
Write-Host "3. Initiating gateway recharge..." -ForegroundColor Yellow
$orderId = ""
try {
    $reqBody = @{
        amount = 150.00
        customer_mobile = "9876543210"
        customer_email = "test@example.com"
        redirect_url = "http://localhost:3000/success"
    } | ConvertTo-Json

    $reqResponse = Invoke-RestMethod -Uri "$apiUrl/wallet/recharge/gateway" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $reqBody

    Write-Host "✓ PASSED: Gateway initiated" -ForegroundColor Green
    $orderId = $reqResponse.data.order_id
    Write-Host "  Order ID: $orderId" -ForegroundColor Gray
    Write-Host "  Payment URL: $($reqResponse.data.payment_url)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Gateway initiation failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Wait for 2 seconds
Start-Sleep -Seconds 2

# Simulate webhook call
Write-Host "4. Simulating Mugavi webhook callback..." -ForegroundColor Yellow
try {
    $webhookBody = @{
        order_id = $orderId
        status = "success"
        transaction_id = "TXN-MUGAVI-999"
        amount = 150.00
    } | ConvertTo-Json

    $webhookResponse = Invoke-RestMethod -Uri "$apiUrl/webhooks/mugavi" `
        -Method Post `
        -ContentType "application/json" `
        -Body $webhookBody

    Write-Host "✓ PASSED: Webhook processed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: Webhook simulation failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Wait for 1 second for DB
Start-Sleep -Seconds 1

# Check final balance
Write-Host "5. Checking final balance..." -ForegroundColor Yellow
try {
    $balResponse2 = Invoke-RestMethod -Uri "$apiUrl/wallet/balance" -Method Get -Headers $headers
    $finalBalance = $balResponse2.balance.main_balance
    Write-Host "✓ PASSED: Final Balance: $finalBalance" -ForegroundColor Green
    
    if ($finalBalance -eq ($initialBalance + 150)) {
        Write-Host "✓ VERIFIED: Amount was correctly added to the wallet!" -ForegroundColor Green
    } else {
        Write-Host "✗ VERIFIED: Balance did not increase as expected." -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAILED: Balance check failed" -ForegroundColor Red
    exit 1
}

Write-Host "Test completed."
