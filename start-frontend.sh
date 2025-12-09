#!/bin/bash

# DentHelp Frontend Startup Script
# This script starts the React frontend

echo "======================================"
echo "  DentHelp Frontend Startup Script"
echo "======================================"
echo ""

# Navigate to frontend directory
cd ReactDentalHelp

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "VITE_BACKEND_URL=http://localhost:8080" > .env
fi

echo "✅ .env file exists"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "This may take 2-3 minutes..."
    echo ""
    npm install

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Error: npm install failed"
        echo "Make sure Node.js and npm are installed"
        exit 1
    fi

    echo ""
    echo "✅ Dependencies installed"
    echo ""
fi

echo "🚀 Starting frontend development server..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
