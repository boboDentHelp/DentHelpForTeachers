# Load Testing with k6

This directory contains k6 load testing scripts for the DentalHelp microservices application.

## Test Scripts

### 1. load-test.js
**Purpose:** Standard load testing with realistic user behavior

**What it tests:**
- User registration
- User login
- Appointment viewing
- Profile access
- Health checks

**Load pattern:**
```
 Users
  100 ┤     ╭─────────╮
   50 ┤  ╭──╯         ╰──╮
   10 ┤╭─╯               ╰─╮
    0 ┴───────────────────────> Time
      0   1   2   3   4   5 min
```

**Thresholds:**
- 95% of requests < 500ms
- Error rate < 5%
- Success rate > 90%

**Run:**
```bash
k6 run load-test.js
```

### 2. stress-test.js
**Purpose:** Find the breaking point of your system

**Load pattern:**
```
 Users
  300 ┤           ╭────────╮
  200 ┤      ╭────╯        │
  100 ┤  ╭───╯             │
   50 ┤╭─╯                 ╰─╮
    0 ┴──────────────────────────> Time
      0   5   10   15   20 min
```

**Thresholds:**
- 95% of requests < 1000ms (relaxed for stress)
- Error rate < 10% (allows for overload)

**Run:**
```bash
k6 run stress-test.js
```

### 3. spike-test.js
**Purpose:** Test system recovery from sudden traffic spikes

**Load pattern:**
```
 Users
  500 ┤   ╭──────╮
   50 ┤───╯      ╰────╮
    0 ┴─────────────────> Time
      0  1  2  3  4  5 min
```

**Thresholds:**
- 95% of requests < 2000ms (during spike)
- Error rate < 15% (some failures expected during spike)

**Run:**
```bash
k6 run spike-test.js
```

## Installation

### macOS
```bash
brew install k6
```

### Ubuntu/Debian
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```bash
choco install k6
```

### Docker
```bash
docker pull grafana/k6:latest
docker run --rm -i grafana/k6 run - <load-test.js
```

## Usage

### Basic Run
```bash
# From project root
k6 run tests/load/load-test.js
```

### With Environment Variables
```bash
# Custom duration and users
K6_DURATION=5m K6_VUS=100 k6 run tests/load/load-test.js

# Custom target URL
TARGET_URL=https://your-production-url.com k6 run tests/load/load-test.js
```

### Output to File
```bash
# JSON output
k6 run --out json=results.json tests/load/load-test.js

# CSV output
k6 run --out csv=results.csv tests/load/load-test.js
```

### Run All Tests
```bash
#!/bin/bash
echo "Running all load tests..."

echo "1. Load Test"
k6 run tests/load/load-test.js

echo "2. Stress Test"
k6 run tests/load/stress-test.js

echo "3. Spike Test"
k6 run tests/load/spike-test.js

echo "All tests completed!"
```

## Understanding Results

### Sample Output
```
📊 Load Test Summary
==================================================

Total Requests: 15,234
Request Rate: 50.78 req/s

Response Times:
  Average: 142.35ms
  Min: 23.12ms
  Max: 1,234.56ms
  p(90): 256.78ms
  p(95): 342.12ms      ← Important: 95% under 500ms = good!
  p(99): 567.89ms

Failed Requests: 2.34%   ← Should be < 5%

Error Rate: 2.34%
Success Rate: 97.66%     ← Should be > 90%
==================================================
```

### What to Look For

#### 🟢 Good Performance
- p(95) < 500ms
- Error rate < 5%
- No timeouts
- Consistent response times

#### 🟡 Warning Signs
- p(95) between 500-1000ms
- Error rate between 5-10%
- Increasing response times over test duration
- Memory usage climbing

#### 🔴 Poor Performance
- p(95) > 1000ms
- Error rate > 10%
- Frequent timeouts
- Crashes or service failures

### Common Issues and Solutions

#### High Error Rate (>10%)

**Possible causes:**
1. Database connection pool exhausted
2. Memory leaks
3. Too many concurrent requests
4. Services not scaled properly

**Solutions:**
```yaml
# Increase connection pool (application.yml)
spring:
  datasource:
    hikari:
      maximum-pool-size: 20  # Increase from 10

# Increase JVM memory (Dockerfile)
ENV JAVA_OPTS="-Xmx512m -Xms256m"
```

#### Slow Response Times (p95 >500ms)

**Possible causes:**
1. Slow database queries
2. N+1 query problem
3. No caching
4. Synchronous I/O operations

**Solutions:**
- Add database indexes
- Enable query logging to find slow queries
- Implement caching (Redis)
- Use async processing for long operations

#### Memory Issues

**Symptoms:**
- Performance degrades over time
- Out of memory errors
- High GC pause time

**Solutions:**
```bash
# Monitor with Prometheus/Grafana
# Check JVM metrics:
- jvm_memory_used_bytes
- jvm_gc_pause_seconds

# Increase heap size
ENV JAVA_OPTS="-Xmx1024m"

# Enable GC logging
ENV JAVA_OPTS="-Xlog:gc*"
```

## Customizing Tests

### Add New Endpoints

Edit `load-test.js`:
```javascript
// Add new test
let newResponse = http.get(`${BASE_URL}/api/new-endpoint`, authParams);

check(newResponse, {
  'new endpoint status is 200': (r) => r.status === 200,
});
```

### Adjust Load Pattern

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Slow ramp up
    { duration: '3m', target: 100 }, // Moderate load
    { duration: '1m', target: 200 }, // Peak load
    { duration: '1m', target: 0 },   // Ramp down
  ],
};
```

### Add Custom Metrics

```javascript
import { Counter, Trend } from 'k6/metrics';

const myCounter = new Counter('my_custom_counter');
const myTrend = new Trend('my_custom_duration');

export default function() {
  myCounter.add(1);
  myTrend.add(response.timings.duration);
}
```

### Change Thresholds

```javascript
export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // Relaxed: 1 second
    'http_req_failed': ['rate<0.01'],     // Stricter: 1% errors
  },
};
```

## Integration with CI/CD

These tests run automatically via GitHub Actions:

1. **On-demand:**
   ```
   GitHub → Actions → Load Testing → Run workflow
   ```

2. **Scheduled:** Every Sunday at 2 AM

3. **Results:** Download from workflow artifacts
   - `k6-results/results.json`
   - `performance-report/report.html`

## Best Practices

### Before Running Tests

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for services to be ready:**
   ```bash
   # Wait at least 60 seconds
   sleep 60

   # Or check health
   curl http://localhost:8080/actuator/health
   ```

3. **Ensure database is populated:**
   ```bash
   # Create test users if needed
   ```

### During Tests

1. **Monitor with Grafana:**
   - Open http://localhost:3000
   - Watch metrics in real-time
   - Look for bottlenecks

2. **Watch logs:**
   ```bash
   docker-compose logs -f api-gateway
   ```

3. **Monitor system resources:**
   ```bash
   docker stats
   ```

### After Tests

1. **Review results carefully**
2. **Check Grafana for anomalies**
3. **Document performance baselines**
4. **Create issues for problems found**
5. **Retest after optimizations**

## Tips

### 1. Gradual Load Increase
Don't start with 1000 users. Ramp up gradually to find where problems start.

### 2. Realistic User Behavior
Simulate actual user flows with think time:
```javascript
sleep(Math.random() * 3 + 1); // 1-4 seconds
```

### 3. Data Cleanup
Reset test data between runs for consistent results.

### 4. Baseline Performance
Run tests on a clean system to establish baselines.

### 5. Monitor Everything
Use Grafana during tests to correlate load with system metrics.

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/performance-testing/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

## Need Help?

- Check the main documentation: `../../CI_CD_MONITORING_GUIDE.md`
- k6 Community: https://community.k6.io/
- GitHub Issues: Create an issue in this repository

Happy load testing! 🚀
