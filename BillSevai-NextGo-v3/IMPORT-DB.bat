@echo off
title Import BillSevai Database
cd /d "%~dp0"

set MYSQL=C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe
if not exist "%MYSQL%" set MYSQL=C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe
if not exist "%MYSQL%" (
  echo MySQL not found in Laragon. Import database\schema.sql manually in HeidiSQL.
  pause
  exit /b 1
)

echo Importing billsevai database...
"%MYSQL%" -u root < "database\schema.sql"
if errorlevel 1 (
  echo Import failed. Check Laragon MySQL is running.
) else (
  echo Done! Database billsevai ready.
  echo Login: owner@demo.test / password
)
pause
