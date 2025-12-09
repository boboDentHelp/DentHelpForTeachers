@echo off
REM DentHelp Frontend Startup Script for Windows
REM This script starts the React frontend

echo ======================================
echo   DentHelp Frontend Startup Script
echo ======================================
echo.

REM Navigate to frontend directory
cd ReactDentalHelp

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file...
    echo VITE_BACKEND_URL=http://localhost:8080 > .env
)

echo [OK] .env file exists
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [*] Installing dependencies...
    echo This may take 2-3 minutes...
    echo.
    call npm install

    if %errorlevel% neq 0 (
        echo.
        echo X Error: npm install failed
        echo Make sure Node.js and npm are installed
        pause
        exit /b 1
    )

    echo.
    echo [OK] Dependencies installed
    echo.
)

echo [*] Starting frontend development server...
echo.
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
