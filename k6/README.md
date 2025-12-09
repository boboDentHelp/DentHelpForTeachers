# k6 Load Testing for DentalHelp

This directory contains load testing scripts and configuration for the DentalHelp microservices application using k6.

## Prerequisites

- Docker and Docker Compose installed
- All microservices running
- Monitoring stack (Prometheus, Grafana, InfluxDB) running

## Quick Start

### 1. Start All Services

First, start your microservices and monitoring stack:

```bash
# Start microservices
docker-compose up -d

# Start monitoring stack (includes k6 and Grafana)
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Run Load Tests

#### Using the Helper Scripts

**On Linux/Mac:**
```bash
# Run smoke test (minimal load, 1 user)
./k6/run-load-test.sh smoke

# Run load test (moderate load, up to 100 users)
./k6/run-load-test.sh load

# Run stress test (high load, up to 400 users)
./k6/run-load-test.sh stress
```

**On Windows (PowerShell):**
```powershell
# Run smoke test (minimal load, 1 user)
.\k6\run-load-test.ps1 smoke

# Run load test (moderate load, up to 100 users)
.\k6\run-load-test.ps1 load

# Run stress test (high load, up to 400 users)
.\k6\run-load-test.ps1 stress
```

#### Using Docker Directly

```bash
# Run load test
docker run --rm \
    --network dentalhelp-2_microservices-network \
    -v "$(pwd)/k6/scripts:/scripts" \
    -v "$(pwd)/k6/results:/var/k6" \
    -e K6_OUT=influxdb=http://influxdb:8086/k6 \
    -e BASE_URL=http://api-gateway:8080 \
    grafana/k6:latest \
    run --out influxdb=http://influxdb:8086/k6 /scripts/load-test.js
```

### 3. View Results

Access Grafana dashboard to view real-time results:

- **URL:** http://localhost:3000
- **Username:** admin
- **Password:** admin

Navigate to: **Dashboards > k6 Load Testing Dashboard**

## Test Scripts

### 1. Smoke Test (`smoke-test.js`)
- **Duration:** 30 seconds
- **Virtual Users:** 1
- **Purpose:** Verify system works with minimal load
- **Tests:** Health endpoints of all services

### 2. Load Test (`load-test.js`)
- **Duration:** ~7 minutes
- **Virtual Users:** 0 → 10 → 50 → 100 → 50 → 0 (gradual ramp)
- **Purpose:** Test system under normal/expected load
- **Tests:**
  - User registration
  - User login
  - Profile management
  - Appointments (get, create)
- **Thresholds:**
  - 95% of requests < 500ms
  - Error rate < 10%

### 3. Stress Test (`stress-test.js`)
- **Duration:** ~20 minutes
- **Virtual Users:** 0 → 100 → 200 → 300 → 400 → 0
- **Purpose:** Push system to limits and find breaking point
- **Tests:** Random mix of registration, login, health checks
- **Thresholds:**
  - 95% of requests < 2000ms
  - Error rate < 30%

## Metrics Collected

The k6 tests collect and send the following metrics to InfluxDB:

### Standard Metrics
- `http_req_duration` - Total request time
- `http_req_waiting` - Time waiting for response
- `http_req_sending` - Time sending request
- `http_req_receiving` - Time receiving response
- `http_req_blocked` - Time blocked (DNS, TCP)
- `http_req_failed` - Failed request rate
- `http_reqs` - Total number of requests
- `vus` - Current number of virtual users
- `iterations` - Number of test iterations

### Custom Metrics
- `errors` - Custom error rate
- `login_duration` - Login request duration
- `registration_duration` - Registration request duration
- `appointment_duration` - Appointment creation duration
- `successful_logins` - Counter of successful logins
- `failed_logins` - Counter of failed logins

## Grafana Dashboards

The load testing dashboard includes:

1. **Virtual Users** - Real-time active users
2. **HTTP Requests per Second** - Request rate
3. **Response Time Percentiles** - p50, p90, p95, p99
4. **Error Rate** - Percentage of failed requests
5. **Checks Passed/Failed** - Test assertions
6. **Data Sent/Received** - Network throughput
7. **Summary Stats** - Total requests, iterations, avg response time, peak VUs

## Customizing Tests

### Modify Test Parameters

Edit the `options` object in any test script:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp to 10 users in 30s
    { duration: '1m', target: 50 },   // Ramp to 50 users in 1 min
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% < 500ms
    http_req_failed: ['rate<0.1'],    // < 10% failures
  },
};
```

### Add New Test Scenarios

Create a new file in `k6/scripts/` directory:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '1m',
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

export default function () {
  // Your test logic here
  const response = http.get(`${BASE_URL}/api/your-endpoint`);

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

## Monitoring Stack Components

- **InfluxDB** (http://localhost:8086) - Time-series database for k6 metrics
- **Grafana** (http://localhost:3000) - Visualization and dashboards
- **Prometheus** (http://localhost:9090) - Metrics collection from microservices
- **Node Exporter** (http://localhost:9100) - System metrics
- **cAdvisor** (http://localhost:8090) - Container metrics

## Troubleshooting

### k6 cannot connect to services

Make sure k6 is on the same network:
```bash
docker network ls
docker network inspect dentalhelp-2_microservices-network
```

### InfluxDB not receiving metrics

Check InfluxDB logs:
```bash
docker-compose -f docker-compose.monitoring.yml logs influxdb
```

Verify InfluxDB database exists:
```bash
docker exec -it influxdb influx -execute 'SHOW DATABASES'
```

### Grafana dashboard shows no data

1. Check InfluxDB datasource in Grafana
2. Verify k6 is writing to InfluxDB
3. Check time range in Grafana (use "Last 15 minutes")
4. Ensure load test has run at least once

### High error rates

- Check if all microservices are running: `docker-compose ps`
- Check service health: Visit http://localhost:8761 (Eureka)
- Review service logs: `docker-compose logs <service-name>`
- Reduce virtual user count in test script

## Best Practices

1. **Start Small:** Always run smoke test first
2. **Gradual Increase:** Use staged ramp-up for realistic load
3. **Monitor Resources:** Watch CPU/memory during tests
4. **Baseline First:** Run tests on stable system to establish baseline
5. **Consistent Environment:** Use same test environment for comparisons
6. **Clean Data:** Clear test data between runs if needed

## CI/CD Integration

You can integrate k6 tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
k6-load-test:
  runs-on: ubuntu-latest
  steps:
    - name: Run k6 smoke test
      run: |
        docker run --rm \
          --network host \
          -v $(pwd)/k6/scripts:/scripts \
          grafana/k6:latest \
          run /scripts/smoke-test.js
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [InfluxDB Documentation](https://docs.influxdata.com/)
