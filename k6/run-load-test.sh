#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DentalHelp k6 Load Testing${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Default test type
TEST_TYPE=${1:-load}

case $TEST_TYPE in
    smoke)
        echo -e "${YELLOW}Running smoke test (minimal load)...${NC}"
        SCRIPT="/scripts/smoke-test.js"
        ;;
    load)
        echo -e "${YELLOW}Running load test (normal load)...${NC}"
        SCRIPT="/scripts/load-test.js"
        ;;
    stress)
        echo -e "${YELLOW}Running stress test (high load)...${NC}"
        SCRIPT="/scripts/stress-test.js"
        ;;
    *)
        echo -e "${RED}Invalid test type: $TEST_TYPE${NC}"
        echo "Usage: $0 [smoke|load|stress]"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Checking if InfluxDB is running...${NC}"
if ! docker ps | grep -q influxdb; then
    echo -e "${RED}InfluxDB is not running. Please start monitoring services first:${NC}"
    echo -e "${YELLOW}  docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ InfluxDB is running${NC}"
echo ""

# Detect the Docker network name
PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')
NETWORK_NAME="${PROJECT_NAME}_microservices-network"

# Check if network exists, if not try alternate name
if ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}Network $NETWORK_NAME not found, trying microservices-network...${NC}"
    NETWORK_NAME="microservices-network"
    if ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
        echo -e "${RED}Error: microservices-network not found. Please start your services first.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Using network: $NETWORK_NAME${NC}"
echo ""

# Run the k6 test
echo -e "${YELLOW}Starting k6 test...${NC}"
echo ""

docker run --rm \
    --network "$NETWORK_NAME" \
    -v "$(pwd)/k6/scripts:/scripts" \
    -v "$(pwd)/k6/results:/var/k6" \
    -e K6_OUT=influxdb=http://influxdb:8086/k6 \
    -e BASE_URL=http://api-gateway:8080 \
    grafana/k6:latest \
    run --out influxdb=http://influxdb:8086/k6 $SCRIPT

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Test completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}View results in Grafana:${NC}"
echo -e "  http://localhost:3000"
echo -e "  Username: admin"
echo -e "  Password: admin"
echo ""
echo -e "${YELLOW}Dashboard: k6 Load Testing Dashboard${NC}"
echo ""
