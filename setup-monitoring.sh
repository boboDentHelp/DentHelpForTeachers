#!/bin/bash

# Setup script for monitoring and CI/CD
# This script helps configure the project for Prometheus metrics

set -e

echo "🚀 DentalHelp - Monitoring & CI/CD Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if running in project root
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Step 1: Adding Prometheus dependency to microservices..."
echo ""

# List of microservices
SERVICES=(
    "auth-service"
    "patient-service"
    "appointment-service"
    "dental-records-service"
    "xray-service"
    "treatment-service"
    "notification-service"
    "api-gateway"
    "eureka-server"
)

for service in "${SERVICES[@]}"; do
    POM_FILE="microservices/$service/pom.xml"

    if [ ! -f "$POM_FILE" ]; then
        print_warning "$service: pom.xml not found, skipping..."
        continue
    fi

    # Check if Prometheus dependency already exists
    if grep -q "micrometer-registry-prometheus" "$POM_FILE"; then
        print_info "$service: Prometheus dependency already exists"
    else
        print_info "$service: Adding Prometheus dependency..."

        # Add dependency before </dependencies> tag
        sed -i.bak '/<\/dependencies>/i\
        <!-- Prometheus Metrics -->\
        <dependency>\
            <groupId>io.micrometer</groupId>\
            <artifactId>micrometer-registry-prometheus</artifactId>\
        </dependency>\
' "$POM_FILE"

        print_success "$service: Prometheus dependency added"
    fi
done

echo ""
print_info "Step 2: Updating application.yml files..."
echo ""

for service in "${SERVICES[@]}"; do
    APP_YML="microservices/$service/src/main/resources/application.yml"

    if [ ! -f "$APP_YML" ]; then
        print_warning "$service: application.yml not found, skipping..."
        continue
    fi

    # Check if prometheus is already exposed
    if grep -q "prometheus" "$APP_YML"; then
        print_info "$service: Prometheus endpoint already configured"
    else
        print_info "$service: Adding Prometheus configuration..."

        # Add prometheus endpoint configuration
        cat >> "$APP_YML" << 'EOF'

# Prometheus Metrics
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
EOF

        print_success "$service: Prometheus configuration added"
    fi
done

echo ""
print_info "Step 3: Creating .env file for Docker Compose..."
echo ""

if [ -f ".env" ]; then
    print_warning ".env file already exists, backing up to .env.backup"
    cp .env .env.backup
fi

cat > .env << 'EOF'
# Email Configuration
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password

# Azure Storage (for X-Ray service)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=xrays

# Database Configuration (optional, defaults are in docker-compose.yml)
# DB_USERNAME=root
# DB_PASSWORD=root
EOF

print_success ".env file created (please update with your actual credentials)"

echo ""
print_info "Step 4: Testing Docker Compose configuration..."
echo ""

# Validate docker-compose files
if docker-compose config > /dev/null 2>&1; then
    print_success "docker-compose.yml is valid"
else
    print_error "docker-compose.yml has errors"
    exit 1
fi

if docker-compose -f docker-compose.monitoring.yml config > /dev/null 2>&1; then
    print_success "docker-compose.monitoring.yml is valid"
else
    print_error "docker-compose.monitoring.yml has errors"
    exit 1
fi

echo ""
print_info "Step 5: Building services (this may take a while)..."
echo ""

# Build all services
for service in "${SERVICES[@]}"; do
    print_info "Building $service..."
    cd "microservices/$service"

    if mvn clean package -DskipTests > /dev/null 2>&1; then
        print_success "$service built successfully"
    else
        print_error "$service build failed"
    fi

    cd ../..
done

echo ""
print_success "Setup completed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Update .env file with your actual credentials"
echo "  2. Start services: docker-compose up -d"
echo "  3. Start monitoring: docker-compose -f docker-compose.monitoring.yml up -d"
echo "  4. Access Grafana: http://localhost:3000 (admin/admin)"
echo "  5. Access Prometheus: http://localhost:9090"
echo "  6. Run load tests: k6 run tests/load/load-test.js"
echo ""
print_info "For GitHub Actions setup:"
echo "  1. Go to: Your Repo → Settings → Secrets and variables → Actions"
echo "  2. Add SONAR_TOKEN, SONAR_PROJECT_KEY, SONAR_ORGANIZATION"
echo "  3. Push code to trigger CI pipeline"
echo ""
print_info "For detailed instructions, see CI_CD_MONITORING_GUIDE.md"
echo ""
print_success "Happy coding! 🚀"
