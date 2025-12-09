#!/bin/bash

# VPS Deployment Script for DentalHelp Microservices
# This script deploys the application to a VPS using Docker Compose

set -e

echo "🚀 DentalHelp VPS Deployment"
echo "=============================="

# Configuration
APP_DIR="/opt/dentalhelp"
BACKUP_DIR="/opt/dentalhelp-backups"
DEPLOY_USER=${DEPLOY_USER:-"deploy"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && [ -z "$SUDO_USER" ]; then
   print_error "Please run as root or with sudo"
   exit 1
fi

# Step 1: Backup current deployment
echo ""
echo "Step 1: Creating backup..."
if [ -d "$APP_DIR" ]; then
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/dentalhelp-backup-$TIMESTAMP.tar.gz" -C "$APP_DIR" . || print_warning "Backup failed"
    print_success "Backup created at $BACKUP_DIR/dentalhelp-backup-$TIMESTAMP.tar.gz"
else
    print_warning "No existing deployment to backup"
fi

# Step 2: Create application directory
echo ""
echo "Step 2: Setting up application directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"
print_success "Application directory ready"

# Step 3: Pull latest code (if using git deployment)
echo ""
echo "Step 3: Pulling latest changes..."
if [ -d ".git" ]; then
    git fetch origin
    git pull origin main
    print_success "Code updated"
else
    print_warning "Not a git repository - skipping pull"
fi

# Step 4: Pull latest Docker images
echo ""
echo "Step 4: Pulling latest Docker images..."
docker-compose pull
print_success "Docker images updated"

# Step 5: Stop current containers
echo ""
echo "Step 5: Stopping current containers..."
docker-compose down || print_warning "No running containers to stop"
print_success "Containers stopped"

# Step 6: Prune old images and containers
echo ""
echo "Step 6: Cleaning up old Docker resources..."
docker system prune -f || true
print_success "Cleanup complete"

# Step 7: Start new containers
echo ""
echo "Step 7: Starting new containers..."
docker-compose up -d
print_success "Containers started"

# Step 8: Wait for services to be healthy
echo ""
echo "Step 8: Waiting for services to be healthy..."
sleep 30

# Check service health
HEALTHY=0
MAX_ATTEMPTS=20

for i in $(seq 1 $MAX_ATTEMPTS); do
    if docker-compose ps | grep -q "healthy"; then
        HEALTHY=1
        break
    fi
    echo "Waiting for services... attempt $i/$MAX_ATTEMPTS"
    sleep 5
done

if [ $HEALTHY -eq 1 ]; then
    print_success "Services are healthy"
else
    print_error "Services failed to become healthy"
    echo "Checking logs..."
    docker-compose logs --tail=50
    exit 1
fi

# Step 9: Verify endpoints
echo ""
echo "Step 9: Verifying endpoints..."

# Check Eureka
if curl -f http://localhost:8761/actuator/health > /dev/null 2>&1; then
    print_success "Eureka Server is running"
else
    print_warning "Eureka Server health check failed"
fi

# Check API Gateway
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_success "API Gateway is running"
else
    print_warning "API Gateway health check failed"
fi

# Step 10: Show running services
echo ""
echo "Step 10: Deployment summary..."
docker-compose ps

echo ""
print_success "Deployment completed successfully! 🎉"
echo ""
echo "Service URLs:"
echo "  - Eureka Dashboard: http://YOUR_SERVER_IP:8761"
echo "  - API Gateway: http://YOUR_SERVER_IP:8080"
echo "  - Grafana: http://YOUR_SERVER_IP:3000"
echo "  - Prometheus: http://YOUR_SERVER_IP:9090"
echo ""
echo "Monitor logs with: docker-compose logs -f"
echo "Stop services with: docker-compose down"
echo ""
