# k6 Load Testing with Docker and Grafana - Complete Guide

This guide walks you through running k6 load tests with 10,000 concurrent users and monitoring results in Grafana.

## Overview

The load testing stack includes:
- **k6**: Load testing tool
- **InfluxDB**: Time-series database for storing k6 metrics
- **Grafana**: Visualization dashboard
- **Prometheus**: Metrics collection from microservices

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM available
- All microservices built and ready

## Quick Start Commands

### 1. Start Your Microservices

```bash
# Start all microservices and databases
docker-compose up -d

# Wait for services to be healthy (check with)
docker-compose ps
```

### 2. Start the Monitoring Stack

```bash
# Start InfluxDB, Grafana, and Prometheus
docker-compose -f docker-compose.monitoring.yml up -d

# Verify monitoring services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 3. Run the 10k User Load Test

```bash
# Using the helper script (Linux/Mac)
./k6/run-load-test.sh load

# Or run manually with Docker
docker run --rm \
    --network denthelpsecond_microservices-network \
    -v "$(pwd)/k6/scripts:/scripts" \
    -v "$(pwd)/k6/results:/var/k6" \
    -e K6_OUT=influxdb=http://influxdb:8086/k6 \
    -e BASE_URL=http://api-gateway:8080 \
    grafana/k6:latest \
    run --out influxdb=http://influxdb:8086/k6 /scripts/load-test.js
```

### 4. Access Grafana Dashboard

```bash
# Open in browser
http://localhost:3000

# Credentials
Username: admin
Password: admin
```

Navigate to: **Dashboards → k6 Load Testing Dashboard**

## Detailed Setup

### Step 1: Prepare Your Environment

```bash
# Navigate to project directory
cd /path/to/DenthelpSecond

# Create k6 results directory if it doesn't exist
mkdir -p k6/results
```

### Step 2: Start Services in Order

```bash
# 1. Start databases first
docker-compose up -d auth-db patient-db appointment-db dental-records-db xray-db treatment-db notification-db

# 2. Wait for databases (30-60 seconds)
sleep 60

# 3. Start infrastructure services
docker-compose up -d rabbitmq redis eureka-server

# 4. Wait for Eureka (30 seconds)
sleep 30

# 5. Start microservices
docker-compose up -d api-gateway auth-service patient-service appointment-service dental-records-service xray-service treatment-service notification-service

# 6. Wait for services to register (30 seconds)
sleep 30

# 7. Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d
```

### Step 3: Verify Everything is Running

```bash
# Check all containers
docker-compose ps
docker-compose -f docker-compose.monitoring.yml ps

# Check Eureka dashboard (all services should be UP)
curl http://localhost:8761

# Check InfluxDB
docker exec -it influxdb influx -execute 'SHOW DATABASES'
# Should show 'k6' database

# Check Grafana
curl http://localhost:3000
```

### Step 4: Configure Grafana (First Time Only)

1. Open Grafana: http://localhost:3000
2. Login with `admin/admin`
3. Skip password change (or set a new one)
4. Verify datasources:
   - Go to **Configuration → Data Sources**
   - You should see:
     - **Prometheus** (default) - http://prometheus:9090
     - **InfluxDB** - http://influxdb:8086 (database: k6)

### Step 5: Run Load Tests

#### Option A: Using Helper Script (Recommended)

```bash
# Smoke test (1 user, 30 seconds)
./k6/run-load-test.sh smoke

# Load test (10,000 users, ~32 minutes)
./k6/run-load-test.sh load

# Stress test (400 users, ~20 minutes)
./k6/run-load-test.sh stress
```

#### Option B: Manual Docker Command

```bash
docker run --rm \
    --network denthelpsecond_microservices-network \
    -v "$(pwd)/k6/scripts:/scripts" \
    -v "$(pwd)/k6/results:/var/k6" \
    -e K6_OUT=influxdb=http://influxdb:8086/k6 \
    -e BASE_URL=http://api-gateway:8080 \
    grafana/k6:latest \
    run --out influxdb=http://influxdb:8086/k6 /scripts/load-test.js
```

**Note**: If network name fails, check your actual network:
```bash
docker network ls | grep microservices
# Use the exact name shown
```

#### Option C: Using Docker Compose

```bash
# Edit docker-compose.monitoring.yml k6 service command if needed
docker-compose -f docker-compose.monitoring.yml up k6
```

## Load Test Configuration

### 10k User Load Test Profile

The load test ramps up gradually to avoid overwhelming the system:

```javascript
stages: [
  { duration: '2m',  target: 1000  },   // Ramp to 1k users
  { duration: '3m',  target: 3000  },   // Ramp to 3k users
  { duration: '3m',  target: 6000  },   // Ramp to 6k users
  { duration: '3m',  target: 8000  },   // Ramp to 8k users
  { duration: '4m',  target: 10000 },   // Ramp to 10k users
  { duration: '10m', target: 10000 },   // Sustained 10k users
  { duration: '3m',  target: 5000  },   // Ramp down
  { duration: '2m',  target: 1000  },   // Ramp down
  { duration: '2m',  target: 0     },   // Complete
]

// Total duration: ~32 minutes
```

### Test Scenarios

Each virtual user executes:
1. User Registration
2. User Login
3. Get User Profile
4. Update Profile
5. Get Appointments
6. Create Appointment

### Performance Thresholds

- **Response Time**: 95th percentile < 2000ms
- **Error Rate**: < 15%
- **Failed Requests**: < 15%

## Monitoring with Grafana

### Accessing the Dashboard

1. Open: http://localhost:3000
2. Login: `admin/admin`
3. Navigate: **Dashboards → k6 Load Testing Dashboard**

### Key Metrics to Watch

1. **Virtual Users (VUs)**: Current concurrent users
2. **Request Rate**: Requests per second
3. **Response Time Percentiles**:
   - p50 (median)
   - p90
   - p95 (threshold)
   - p99
4. **Error Rate**: Percentage of failed requests
5. **Checks**: Test assertions (passed/failed)
6. **Throughput**: Data sent/received

### Dashboard Panels

- **Request Duration** (top left): Shows response time trends
- **Request Rate** (top right): HTTP requests per second
- **Virtual Users** (middle left): Active concurrent users
- **Error Rate** (middle right): Failed request percentage
- **Checks** (bottom): Test assertion results

### Time Range

Set the time range to match your test:
- Click the time picker (top right)
- Select "Last 1 hour" for the 32-minute test
- Or use "Last 5 minutes" to see real-time data

## Understanding Results

### Good Results

```
✓ http_req_duration.............: avg=850ms  p(95)=1800ms
✓ http_req_failed...............: 3.2%
✓ checks........................: 96.8%
✓ successful_logins.............: 9500
```

### Warning Signs

```
✗ http_req_duration.............: avg=3500ms p(95)=8000ms  ← Too slow
✗ http_req_failed...............: 28%                      ← Too many errors
✗ checks........................: 72%                      ← Many failures
```

### What to Do If Tests Fail

1. **High Response Times**:
   - Check CPU/memory usage: `docker stats`
   - Scale down to fewer users
   - Optimize database queries
   - Add caching

2. **High Error Rates**:
   - Check service logs: `docker-compose logs <service>`
   - Check database connections
   - Verify service health: `docker-compose ps`

3. **Connection Errors**:
   - Verify network: `docker network ls`
   - Check API Gateway: `curl http://localhost:8080/actuator/health`
   - Ensure all services are UP in Eureka

## Troubleshooting

### Issue: k6 Can't Connect to Services

```bash
# Check Docker network
docker network ls
docker network inspect denthelpsecond_microservices-network

# Verify k6 is using correct network
# Check the script: k6/run-load-test.sh
```

### Issue: InfluxDB Not Receiving Metrics

```bash
# Check InfluxDB logs
docker-compose -f docker-compose.monitoring.yml logs influxdb

# Verify k6 database exists
docker exec -it influxdb influx -execute 'SHOW DATABASES'

# Should see 'k6' database
```

### Issue: Grafana Shows No Data

1. Check InfluxDB datasource:
   - **Configuration → Data Sources → InfluxDB**
   - URL: `http://influxdb:8086`
   - Database: `k6`
   - Click "Save & Test"

2. Verify test has run:
   ```bash
   docker exec -it influxdb influx -database k6 -execute 'SHOW MEASUREMENTS'
   ```

3. Adjust time range in Grafana (top right)

### Issue: Network Name Doesn't Exist

```bash
# List all networks
docker network ls

# Find your microservices network
docker network ls | grep microservices

# Update k6/run-load-test.sh with correct name
# or create the network:
docker network create denthelpsecond_microservices-network
```

### Issue: Services Are Slow/Crashing

```bash
# Check resource usage
docker stats

# Check logs for specific service
docker-compose logs auth-service

# Scale down users in k6/scripts/load-test.js
# Start with 1000 users instead of 10000
```

## Advanced Configuration

### Customize Test Parameters

Edit `k6/scripts/load-test.js`:

```javascript
// Reduce to 5k users
stages: [
  { duration: '2m', target: 2000 },
  { duration: '5m', target: 5000 },
  { duration: '5m', target: 5000 },
  { duration: '2m', target: 0 },
]
```

### Run Test Against Different Environment

```bash
docker run --rm \
    --network denthelpsecond_microservices-network \
    -v "$(pwd)/k6/scripts:/scripts" \
    -e K6_OUT=influxdb=http://influxdb:8086/k6 \
    -e BASE_URL=http://production-api.example.com \
    grafana/k6:latest \
    run /scripts/load-test.js
```

### Save Results Locally

```bash
docker run --rm \
    --network denthelpsecond_microservices-network \
    -v "$(pwd)/k6/scripts:/scripts" \
    -v "$(pwd)/k6/results:/var/k6" \
    grafana/k6:latest \
    run --out json=/var/k6/results.json /scripts/load-test.js
```

## Performance Optimization Tips

### Before Running 10k Users

1. **Increase Docker Resources**:
   - Docker Desktop → Settings → Resources
   - RAM: Minimum 8GB, recommended 16GB
   - CPUs: Minimum 4, recommended 8

2. **Scale Database Connections**:
   - Edit service `application.yml`
   - Increase `spring.datasource.hikari.maximum-pool-size`

3. **Monitor System Resources**:
   ```bash
   # Terminal 1: Monitor containers
   docker stats

   # Terminal 2: Run test
   ./k6/run-load-test.sh load
   ```

4. **Start with Smaller Load**:
   - Run smoke test first
   - Then stress test (400 users)
   - Finally 10k test

## Cleanup

### Stop Tests

```bash
# Stop monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# Stop microservices
docker-compose down
```

### Clean Up Data

```bash
# Remove volumes (WARNING: deletes all data)
docker-compose down -v
docker-compose -f docker-compose.monitoring.yml down -v

# Remove test results
rm -rf k6/results/*
```

## Summary of Commands

```bash
# Start everything
docker-compose up -d
docker-compose -f docker-compose.monitoring.yml up -d

# Run 10k user load test
./k6/run-load-test.sh load

# View results
open http://localhost:3000

# Check status
docker-compose ps
docker stats

# Stop everything
docker-compose -f docker-compose.monitoring.yml down
docker-compose down
```

## Next Steps

1. Run smoke test to verify setup
2. Run stress test (400 users) to check stability
3. Run full 10k load test
4. Analyze results in Grafana
5. Optimize based on findings
6. Re-run tests to verify improvements

## Resources

- k6 Documentation: https://k6.io/docs/
- Grafana Documentation: https://grafana.com/docs/
- InfluxDB Documentation: https://docs.influxdata.com/
- Project README: `k6/README.md`

---

**Load Test Duration**: ~32 minutes
**Peak Virtual Users**: 10,000
**Total Requests**: ~500,000+ (depending on response times)
**Grafana Dashboard**: http://localhost:3000
