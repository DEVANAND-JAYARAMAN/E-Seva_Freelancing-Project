@echo off
title BillSevai NextGo
cd /d "%~dp0"

echo ========================================
echo   BillSevai v3 - Next.js + Golang
echo ========================================
echo.

where go >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Go not installed!
  echo Download: https://go.dev/dl/
  echo Install Go, restart PC, then run this again.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not installed!
  pause
  exit /b 1
)

if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env"
  echo Created backend\.env - edit DB settings if needed.
)

if not exist "frontend\.env.local" (
  copy "frontend\.env.local.example" "frontend\.env.local"
)

if not exist "frontend\node_modules" (
  echo Installing frontend packages...
  cd frontend
  call npm install
  cd ..
)

echo Starting API on http://localhost:8080 ...
start "BillSevai API" cmd /k "cd /d %~dp0backend && go run ./cmd/server"

timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:3000 ...
start "BillSevai Web" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Open: http://localhost:3000
echo   Login: owner@demo.test / password
echo ========================================
pause
