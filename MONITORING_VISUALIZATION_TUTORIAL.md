# Monitoring Visualization Tutorial
## Creating Mock Dashboards for Demonstrating Auto-Scaling Decisions

**Document Purpose**: Tutorial on how to create realistic-looking monitoring visualizations (Grafana, Prometheus, k6) to demonstrate and explain auto-scaling decisions, replica choices, and performance tuning without requiring actual production infrastructure.

**Author**: DentalHelp Development Team
**Date**: December 14, 2025

---

## Table of Contents

1. [Why Mock Visualizations?](#1-why-mock-visualizations)
2. [Tool Options](#2-tool-options)
3. [Method 1: Grafana with Mock Data](#3-method-1-grafana-with-mock-data)
4. [Method 2: Online Chart Tools](#4-method-2-online-chart-tools)
5. [Method 3: Presentation Screenshots](#5-method-3-presentation-screenshots)
6. [Method 4: Docker-Based Demo Environment](#6-method-4-docker-based-demo-environment)
7. [Decision Visualizations](#7-decision-visualizations)
8. [Ready-to-Use Mockup Data](#8-ready-to-use-mockup-data)

---

## 1. Why Mock Visualizations?

### The Challenge

When presenting architectural decisions for academic or portfolio purposes, you often need to show:
- **Why** specific replica counts were chosen
- **How** auto-scaling responds to load
- **What** metrics drove performance tuning decisions

However:
- Production clusters cost money ($350/month for GKE)
- Real load tests require infrastructure
- Screenshots from live systems may not be available

### The Solution

Create **realistic mock visualizations** that:
- Accurately represent the data you would see
- Demonstrate understanding of metrics and their relationships
- Show the reasoning behind your decisions
- Are ethically transparent (label as "simulated" or "example")

**Important**: Always be transparent that these are simulated/example visualizations for demonstration purposes.

---

## 2. Tool Options

### Option A: Local Grafana with Mock Data (Recommended)

**Pros**: Most realistic, reusable, professional
**Cons**: Requires Docker setup
**Time**: 30-60 minutes

### Option B: Online Chart Tools

**Pros**: Quick, no installation
**Cons**: Less realistic, limited customization
**Time**: 15-30 minutes

### Option C: Presentation Software

**Pros**: Full control, easy to modify
**Cons**: Less authentic appearance
**Time**: 30-45 minutes

### Option D: Docker Demo Environment

**Pros**: Fully functional, reusable
**Cons**: More complex setup
**Time**: 1-2 hours

---

## 3. Method 1: Grafana with Mock Data

### Step 1: Start Local Grafana

```bash
# Create docker-compose for mock monitoring
cat > docker-compose.mockdata.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./mock-prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
    volumes:
      - ./mock-dashboards:/etc/grafana/provisioning/dashboards
      - ./mock-datasources:/etc/grafana/provisioning/datasources

  # Mock metrics generator
  metrics-generator:
    image: python:3.9-slim
    volumes:
      - ./mock-metrics.py:/app/mock-metrics.py
    command: python /app/mock-metrics.py
    ports:
      - "8000:8000"
EOF
```

### Step 2: Create Mock Metrics Generator

```python
# mock-metrics.py - Generates realistic metrics for demo purposes
from http.server import HTTPServer, BaseHTTPRequestHandler
import time
import math
import random

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()

        # Current time for simulation
        t = time.time()

        # Simulate load test scenario
        # Phase 1: Baseline (0-5 min)
        # Phase 2: Ramp up (5-10 min)
        # Phase 3: Peak (10-15 min)
        # Phase 4: Scale response (15-20 min)
        # Phase 5: Stabilization (20-25 min)

        cycle = (t % 1500) / 60  # 25 minute cycle

        if cycle < 5:
            # Baseline
            vus = 50 + random.randint(-5, 5)
            cpu = 35 + random.randint(-3, 3)
            replicas = 2
            response_time = 145 + random.randint(-10, 10)
            error_rate = 0.2 + random.random() * 0.1
        elif cycle < 10:
            # Ramp up
            progress = (cycle - 5) / 5
            vus = int(50 + 350 * progress)
            cpu = int(35 + 45 * progress)
            replicas = 2 + int(progress * 2)
            response_time = int(145 + 500 * progress)
            error_rate = 0.2 + 3 * progress
        elif cycle < 15:
            # Peak load
            vus = 400 + random.randint(-20, 20)
            cpu = 85 + random.randint(-5, 5)
            replicas = 4 + int((cycle - 10) / 2.5)  # HPA scaling
            response_time = 1200 + random.randint(-100, 100)
            error_rate = 3.5 + random.random() * 0.5
        elif cycle < 20:
            # Scale response
            progress = (cycle - 15) / 5
            vus = 400 + random.randint(-20, 20)
            cpu = int(85 - 25 * progress)
            replicas = 6 + int(progress * 2)
            response_time = int(1200 - 600 * progress)
            error_rate = 3.5 - 2 * progress
        else:
            # Stabilization
            vus = 400 + random.randint(-20, 20)
            cpu = 55 + random.randint(-5, 5)
            replicas = 8
            response_time = 485 + random.randint(-30, 30)
            error_rate = 1.5 + random.random() * 0.3

        metrics = f"""# HELP dentalhelp_vus Current virtual users
# TYPE dentalhelp_vus gauge
dentalhelp_vus {vus}

# HELP dentalhelp_cpu_percent CPU utilization percentage
# TYPE dentalhelp_cpu_percent gauge
dentalhelp_cpu_percent{{service="api-gateway"}} {cpu}
dentalhelp_cpu_percent{{service="auth-service"}} {cpu * 0.7}
dentalhelp_cpu_percent{{service="patient-service"}} {cpu * 0.6}

# HELP dentalhelp_replicas Number of pod replicas
# TYPE dentalhelp_replicas gauge
dentalhelp_replicas{{service="api-gateway"}} {replicas}
dentalhelp_replicas{{service="auth-service"}} {max(2, replicas - 2)}
dentalhelp_replicas{{service="patient-service"}} {max(2, replicas - 2)}

# HELP dentalhelp_response_time_ms P95 response time in milliseconds
# TYPE dentalhelp_response_time_ms gauge
dentalhelp_response_time_ms {response_time}

# HELP dentalhelp_error_rate Error rate percentage
# TYPE dentalhelp_error_rate gauge
dentalhelp_error_rate {error_rate:.2f}

# HELP dentalhelp_throughput_rps Requests per second
# TYPE dentalhelp_throughput_rps gauge
dentalhelp_throughput_rps {int(vus * 2.5)}

# HELP dentalhelp_memory_mb Memory usage in MB
# TYPE dentalhelp_memory_mb gauge
dentalhelp_memory_mb{{service="api-gateway"}} {450 + cpu * 3}
dentalhelp_memory_mb{{service="auth-service"}} {380 + cpu * 2}
dentalhelp_memory_mb{{service="patient-service"}} {350 + cpu * 2}
"""
        self.wfile.write(metrics.encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), MetricsHandler)
    print("Mock metrics server running on port 8000")
    server.serve_forever()
```

### Step 3: Create Prometheus Config

```yaml
# mock-prometheus.yml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'mock-metrics'
    static_configs:
      - targets: ['metrics-generator:8000']
```

### Step 4: Create Grafana Dashboard JSON

Create `mock-dashboards/auto-scaling-demo.json`:

```json
{
  "dashboard": {
    "title": "DentalHelp Auto-Scaling Demo",
    "panels": [
      {
        "title": "HPA Replica Scaling vs CPU Utilization",
        "type": "timeseries",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
        "targets": [
          {
            "expr": "dentalhelp_replicas{service=\"api-gateway\"}",
            "legendFormat": "Replicas"
          },
          {
            "expr": "dentalhelp_cpu_percent{service=\"api-gateway\"}",
            "legendFormat": "CPU %"
          }
        ]
      },
      {
        "title": "Response Time vs Virtual Users",
        "type": "timeseries",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
        "targets": [
          {
            "expr": "dentalhelp_response_time_ms",
            "legendFormat": "P95 Response Time (ms)"
          },
          {
            "expr": "dentalhelp_vus",
            "legendFormat": "Virtual Users"
          }
        ]
      },
      {
        "title": "Error Rate During Scaling",
        "type": "timeseries",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
        "targets": [
          {
            "expr": "dentalhelp_error_rate",
            "legendFormat": "Error Rate %"
          }
        ]
      },
      {
        "title": "Service Memory Usage",
        "type": "timeseries",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8},
        "targets": [
          {
            "expr": "dentalhelp_memory_mb",
            "legendFormat": "{{service}}"
          }
        ]
      }
    ]
  }
}
```

### Step 5: Run and Capture Screenshots

```bash
# Start the mock environment
docker-compose -f docker-compose.mockdata.yml up -d

# Wait for services to start
sleep 30

# Access Grafana
echo "Open http://localhost:3000 (admin/admin)"
echo "Import the dashboard JSON"
echo "Wait for the simulation cycle (25 minutes) to see full data"
echo "Take screenshots at key moments"
```

---

## 4. Method 2: Online Chart Tools

### Using Chart.js Playground (Quick Method)

1. Go to https://www.chartjs.org/docs/latest/samples/
2. Use the "Line Chart" sample
3. Paste this data:

```javascript
// Auto-Scaling Decision Visualization Data
const data = {
  labels: ['T+0', 'T+5', 'T+10', 'T+12', 'T+15', 'T+17', 'T+20'],
  datasets: [
    {
      label: 'CPU Utilization %',
      data: [45, 78, 85, 85, 72, 52, 35],
      borderColor: 'rgb(255, 99, 132)',
      yAxisID: 'y'
    },
    {
      label: 'Pod Replicas',
      data: [2, 4, 6, 8, 8, 8, 4],
      borderColor: 'rgb(54, 162, 235)',
      yAxisID: 'y1'
    }
  ]
};

const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'CPU %' },
        max: 100
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Replicas' },
        max: 10
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'HPA Auto-Scaling Response to Load (Simulated Data)'
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 70,
            yMax: 70,
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            label: { content: 'HPA Target 70%' }
          }
        }
      }
    }
  }
};
```

### Using Google Sheets (Easiest Method)

1. Create a new Google Sheet
2. Enter this data:

```
Time    CPU%    Replicas    Response(ms)    ErrorRate%    VUs
T+0     45      2           285             0.2           100
T+5     78      4           1800            3.2           200
T+7     82      6           1400            2.8           300
T+10    85      8           1200            2.5           400
T+12    72      8           980             1.8           400
T+15    52      8           450             0.5           200
T+20    35      4           285             0.2           100
```

3. Select data → Insert → Chart
4. Choose "Line chart" or "Combo chart"
5. Customize with titles:
   - Chart title: "Kubernetes HPA Auto-Scaling Response"
   - Subtitle: "DentalHelp API Gateway - Stress Test Simulation"
6. Download as PNG

---

## 5. Method 3: Presentation Screenshots

### Creating Mock Grafana Panels in PowerPoint/Slides

**Template for HPA Scaling Panel**:

```
┌─────────────────────────────────────────────────────────────────┐
│  HPA Replica Scaling vs CPU Utilization                     [⟳] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  100% ┤                    ┌─────┐                              │
│       │                   /│     │\                             │
│   80% ┼──────────────────/─│─────│─\────── Target: 70%         │
│       │                 /  │     │  \                           │
│   60% ┤               /    │     │    \                         │
│       │             /      │     │      \                       │
│   40% ┤           /        │     │        \                     │
│       │         /          │     │          \                   │
│   20% ┤        │           │     │            │                 │
│       │        │           │     │            │                 │
│    0% ┴────────┴───────────┴─────┴────────────┴─────────────   │
│       T+0    T+5   T+10  T+12  T+15  T+17   T+20               │
│                                                                  │
│   ── CPU %    ── Replicas (scaled to %)                         │
│                                                                  │
│   📊 Replicas: 2→4→6→8→8→4 (matched CPU demand)                 │
│   ⚡ Scaling triggered when CPU > 70%                            │
│   🎯 66% response time improvement after scaling                 │
└─────────────────────────────────────────────────────────────────┘
```

### Grafana-Style Color Scheme

- Background: #181B1F (dark mode) or #F4F5F5 (light mode)
- Panel background: #1F2025 (dark) or #FFFFFF (light)
- Green (success): #73BF69
- Yellow (warning): #FADE2A
- Red (critical): #F2495C
- Blue (info): #5794F2
- Purple (replicas): #B877D9

---

## 6. Method 4: Docker-Based Demo Environment

### Complete Demo Stack

Use the existing `docker-compose.monitoring.yml` from the project:

```bash
# Start full monitoring stack
cd /home/user/DentHelpForTeachers
docker-compose -f docker-compose.monitoring.yml up -d

# Generate load with k6 to get real metrics
docker run --rm -i --network=host grafana/k6 run - <<EOF
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 400 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 50 },
  ],
};

export default function () {
  const res = http.get('http://localhost:8080/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
EOF
```

---

## 7. Decision Visualizations

### 7.1 Why These Replica Numbers?

**Visual Explanation for Replica Count Decisions**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REPLICA COUNT DECISION MATRIX                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Service              Min   Max   Reasoning                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  API Gateway          2     10    • Entry point for all traffic             │
│                              │     • Highest CPU usage during load           │
│                              │     • Stress test needed 8 replicas at 400 VUs│
│                              └──→ Max=10 provides 25% headroom               │
│                                                                              │
│  Auth Service         2     5     • Handles authentication only              │
│                              │     • Lower CPU than gateway                  │
│                              │     • Load test showed max 4 needed           │
│                              └──→ Max=5 is cost-effective                    │
│                                                                              │
│  Patient Service      2     5     • CRUD operations, moderate load           │
│  Appointment Service  2     5     • Similar traffic pattern                  │
│  Dental Records       2     5     • Database-bound, less CPU-intensive       │
│  X-Ray Service        2     5     • File operations, burst traffic           │
│  Treatment Service    2     5     • Low frequency operations                 │
│                                                                              │
│  Notification Service 1     3     • Async, not user-facing                   │
│                              │     • RabbitMQ handles buffering              │
│                              └──→ Can tolerate brief delays                  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  📊 Data Source: LOAD_TESTING_COMPREHENSIVE.md (stress test @ 400 VUs)       │
│  📈 Validation: AUTO_SCALING_IMPLEMENTATION.md (HPA behavior observed)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 HPA Target Selection Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     HPA TARGET SELECTION RATIONALE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CPU Target: 70%                                                             │
│  ──────────────────────────────────────────────────────────────────────     │
│                                                                              │
│    0%        50%       70%        85%       100%                             │
│    ├──────────┼─────────┼──────────┼─────────┤                              │
│    │  Idle    │ Normal  │▓▓▓Target▓│ Critical│                              │
│    │          │         │    ↑     │         │                              │
│    │          │         │    │     │         │                              │
│    │          │         │    │     │         │                              │
│                               │                                              │
│    WHY 70%?                   │                                              │
│    ┌─────────────────────────┴──────────────────────────────────────┐       │
│    │ • 30% headroom for traffic spikes                              │       │
│    │ • HPA has 20-90s delay (metrics + pod startup)                 │       │
│    │ • At 70%, response time still <200ms (acceptable)              │       │
│    │ • Higher targets (80-90%) risk degradation before scaling      │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  Memory Target: 80%                                                          │
│  ──────────────────────────────────────────────────────────────────────     │
│                                                                              │
│    WHY 80% (higher than CPU)?                                                │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │ • Memory usage more stable than CPU (less fluctuation)         │       │
│    │ • JVM heap grows gradually, not spikey                         │       │
│    │ • Lower threshold causes unnecessary scaling (thrashing)       │       │
│    │ • 20% headroom prevents OOMKilled                              │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Performance Improvement Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE IMPROVEMENT SUMMARY                           │
│              Before vs After Auto-Scaling (400 VUs Stress Test)              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  P95 RESPONSE TIME                                                           │
│  ─────────────────                                                           │
│                                                                              │
│  Local (No HPA):     ████████████████████████████████████████  3.5s         │
│  K8s + HPA:          ████████████████  1.2s                                 │
│                                                                              │
│                      └─────────────────────────────────────────┘             │
│                                 66% IMPROVEMENT                              │
│                                                                              │
│  ERROR RATE                                                                  │
│  ──────────                                                                  │
│                                                                              │
│  Local (No HPA):     ████████████████████████████████  32.68%               │
│  K8s + HPA:          ███  2.85%                                             │
│                                                                              │
│                      └─────────────────────────────────────────┘             │
│                                 91% REDUCTION                                │
│                                                                              │
│  CONCURRENT USER CAPACITY                                                    │
│  ────────────────────────                                                    │
│                                                                              │
│  Local (No HPA):     █████████████████████████  250 users (breaking point)  │
│  K8s + HPA:          █████████████████████████████████████████  400+ users  │
│                                                                              │
│                      └─────────────────────────────────────────┘             │
│                                 60% INCREASE                                 │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  📊 Data Source: LOAD_TESTING_COMPREHENSIVE.md                               │
│  🎯 Conclusion: Auto-scaling essential for production healthcare app         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Ready-to-Use Mockup Data

### 8.1 k6 Output Simulation

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: stress-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 400 max VUs, 17m30s max duration (incl. graceful stop):
           * default: Up to 400 looping VUs for 17m0s over 6 stages (gracefulRampDown: 30s, gracefulStop: 30s)


running (17m00.0s), 000/400 VUs, 17937 complete and 0 interrupted iterations
default ✓ [======================================] 000/400 VUs  17m0s

     ✓ registration status is 200 or 201
     ✓ login status is 200
     ✓ login response has token
     ✓ get profile status is 200
     ✓ create appointment status is 201

     checks.........................: 97.15% ✓ 121980    ✗ 3580
     data_received..................: 428 MB  420 kB/s
     data_sent......................: 145 MB  142 kB/s
     http_req_blocked...............: avg=2.15ms   min=1µs      med=3µs      max=1.2s     p(90)=6µs      p(95)=8µs
     http_req_connecting............: avg=2.1ms    min=0s       med=0s       max=1.2s     p(90)=0s       p(95)=0s
     http_req_duration..............: avg=485.43ms min=42.18ms  med=385.2ms  max=3.2s     p(90)=985.4ms  p(95)=1.2s
       { expected_response:true }...: avg=412.8ms  min=42.18ms  med=345.1ms  max=2.1s     p(90)=785.3ms  p(95)=985.4ms
     http_req_failed................: 2.85%   ✓ 3580      ✗ 121980
     http_req_receiving.............: avg=145.2µs  min=12µs     med=85µs     max=125.3ms  p(90)=185µs    p(95)=285µs
     http_req_sending...............: avg=35.4µs   min=5µs      med=25µs     max=85.2ms   p(90)=45µs     p(95)=65µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=485.25ms min=42.05ms  med=385ms    max=3.2s     p(90)=985.2ms  p(95)=1.2s
     http_reqs......................: 125560  123.098/s
     iteration_duration.............: avg=2.85s    min=1.25s    med=2.45s    max=12.5s    p(90)=4.85s    p(95)=5.85s
     iterations.....................: 17937   17.585/s
     vus............................: 1       min=1       max=400
     vus_max........................: 400     min=400     max=400
```

### 8.2 kubectl HPA Output Simulation

```bash
$ kubectl get hpa -n dentalhelp -w

NAME              REFERENCE                  TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
api-gateway-hpa   Deployment/api-gateway     45%/70%         2         10        2          45d
api-gateway-hpa   Deployment/api-gateway     78%/70%         2         10        2          45d
api-gateway-hpa   Deployment/api-gateway     78%/70%         2         10        4          45d
api-gateway-hpa   Deployment/api-gateway     82%/70%         2         10        4          45d
api-gateway-hpa   Deployment/api-gateway     82%/70%         2         10        6          45d
api-gateway-hpa   Deployment/api-gateway     85%/70%         2         10        6          45d
api-gateway-hpa   Deployment/api-gateway     85%/70%         2         10        8          45d
api-gateway-hpa   Deployment/api-gateway     72%/70%         2         10        8          45d
api-gateway-hpa   Deployment/api-gateway     52%/70%         2         10        8          45d
api-gateway-hpa   Deployment/api-gateway     35%/70%         2         10        4          45d
api-gateway-hpa   Deployment/api-gateway     28%/70%         2         10        2          45d
```

### 8.3 Prometheus Query Examples

```promql
# CPU Utilization by Service
rate(container_cpu_usage_seconds_total{namespace="dentalhelp"}[5m]) * 100

# Memory Usage
container_memory_usage_bytes{namespace="dentalhelp"} / 1024 / 1024

# Request Rate
rate(http_requests_total{namespace="dentalhelp"}[5m])

# Error Rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# P95 Response Time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

## 9. Summary: Best Practices for Mock Visualizations

### Do's

- ✅ Be transparent: Label as "simulated" or "demonstration data"
- ✅ Use realistic numbers from your actual test results
- ✅ Show the correlation between decisions and metrics
- ✅ Include timestamps and context
- ✅ Reference source documentation (load testing results)

### Don'ts

- ❌ Claim visualizations are from production if they're not
- ❌ Use obviously unrealistic numbers
- ❌ Ignore error cases and only show success
- ❌ Create visualizations that contradict your documentation

### Quick Reference Commands

```bash
# Start mock monitoring
docker-compose -f docker-compose.mockdata.yml up -d

# Access Grafana
open http://localhost:3000

# Stop mock monitoring
docker-compose -f docker-compose.mockdata.yml down
```

---

**Document Version**: 1.0
**Last Updated**: December 14, 2025
**Purpose**: Academic demonstration and portfolio presentation
