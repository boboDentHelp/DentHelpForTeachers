#!/bin/bash

echo "=================================="
echo "Dental Help - Microservices Setup"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file with your actual credentials:"
    echo "   - MAIL_USERNAME (Gmail address)"
    echo "   - MAIL_PASSWORD (Gmail app password)"
    echo ""
    echo "After editing .env, run this script again."
    exit 0
fi

echo "Building and starting all services..."
echo "This may take several minutes on first run..."
echo ""

# Build and start services
docker-compose up --build -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "=================================="
echo "Services Status:"
echo "=================================="
docker-compose ps

echo ""
echo "=================================="
echo "Service URLs:"
echo "=================================="
echo "Eureka Dashboard:    http://localhost:8761"
echo "API Gateway:         http://localhost:8080"
echo "RabbitMQ Management: http://localhost:15672 (guest/guest)"
echo ""
echo "Auth Service:        http://localhost:8081"
echo "Patient Service:     http://localhost:8082"
echo ""
echo "=================================="
echo "To view logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""
echo "To stop and remove all data:"
echo "  docker-compose down -v"
echo "=================================="
