@echo off
REM DentHelp Backend Startup Script for Windows
REM This script starts all microservices

echo ======================================
echo   DentHelp Backend Startup Script
echo ======================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo X Error: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [!] Warning: .env file not found!
    echo Creating .env file with template...
    echo.
    (
        echo # Email Configuration (REQUIRED^)
        echo MAIL_USERNAME=your-email@gmail.com
        echo MAIL_PASSWORD=your-16-char-app-password
        echo.
        echo # Azure Storage (OPTIONAL^)
        echo AZURE_STORAGE_CONNECTION_STRING=your-connection-string
        echo AZURE_STORAGE_CONTAINER_NAME=xrays
    ) > .env
    echo [!] Please edit .env file with your actual credentials
    echo Then run this script again.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

echo [*] Starting all microservices...
echo This may take 5-10 minutes on first run...
echo.

REM Start services
docker compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo [OK] All services started successfully!
    echo.
    echo [*] Please wait 2-3 minutes for all services to fully initialize
    echo.
    echo Service URLs:
    echo   - Eureka Dashboard: http://localhost:8761
    echo   - RabbitMQ Management: http://localhost:15672 (guest/guest^)
    echo   - API Gateway Health: http://localhost:8080/actuator/health
    echo.
    echo To check service status:
    echo   docker compose ps
    echo.
    echo To view logs:
    echo   docker compose logs -f
    echo.
    echo To stop all services:
    echo   docker compose down
    echo.
    echo Ready to start frontend? Run: cd ReactDentalHelp ^&^& npm run dev
) else (
    echo.
    echo X Error: Failed to start services
    echo Check the error messages above
    pause
    exit /b 1
)

pause
