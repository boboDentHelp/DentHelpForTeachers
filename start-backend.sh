#!/bin/bash

# DentHelp Backend Startup Script
# This script starts all microservices

echo "======================================"
echo "  DentHelp Backend Startup Script"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env file with template..."
    echo ""
    cat > .env << EOF
# Email Configuration (REQUIRED)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password

# Azure Storage (OPTIONAL)
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=xrays
EOF
    echo "⚠️  Please edit .env file with your actual credentials"
    echo "Then run this script again."
    exit 1
fi

echo "✅ .env file found"
echo ""

echo "🚀 Starting all microservices..."
echo "This may take 5-10 minutes on first run..."
echo ""

# Start services
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All services started successfully!"
    echo ""
    echo "⏱️  Please wait 2-3 minutes for all services to fully initialize"
    echo ""
    echo "📊 Service URLs:"
    echo "  - Eureka Dashboard: http://localhost:8761"
    echo "  - RabbitMQ Management: http://localhost:15672 (guest/guest)"
    echo "  - API Gateway Health: http://localhost:8080/actuator/health"
    echo ""
    echo "🔍 To check service status:"
    echo "  docker compose ps"
    echo ""
    echo "📋 To view logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "🛑 To stop all services:"
    echo "  docker compose down"
    echo ""
    echo "Ready to start frontend? Run: cd ReactDentalHelp && npm run dev"
else
    echo ""
    echo "❌ Error: Failed to start services"
    echo "Check the error messages above"
    exit 1
fi
