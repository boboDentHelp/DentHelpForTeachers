# Monitoring Visualization Tutorial
## Creating Mock Dashboards for Demonstrating Auto-Scaling Decisions

**Document Purpose**: Tutorial on how to create realistic-looking monitoring visualizations (Grafana, Prometheus, k6) to demonstrate and explain auto-scaling decisions, replica choices, and performance tuning without requiring actual production infrastructure.

**Author**: DentalHelp Development Team
**Date**: December 14, 2025

---

## 🚀 Quick Start (Recommended)

This project includes a **ready-to-use Docker monitoring stack** in the `mock-monitoring/` directory. Run these commands to get realistic Grafana dashboards in under 2 minutes:

```bash
# Navigate to the mock monitoring directory
cd mock-monitoring

# Start with 100 users scenario (default)
docker-compose up -d

# Access Grafana dashboard
open http://localhost:3000

# Login: admin / admin123
# Dashboard is pre-configured and auto-provisioned!
```

**Available Load Test Scenarios:**

| Scenario | Command | Duration | Users | Use Case |
|----------|---------|----------|-------|----------|
| 100 Users | `SCENARIO=100_users docker-compose up -d` | 10 min | 100 | Light load / Smoke test |
| 1,000 Users | `SCENARIO=1000_users docker-compose up -d` | 15 min | 1,000 | Normal production load |
| 10,000 Users | `SCENARIO=10000_users docker-compose up -d` | 20 min | 10,000 | High load / Stress test |
| Stress Test | `SCENARIO=stress_test docker-compose up -d` | 25 min | 400 | Breaking point analysis |
| Spike Test | `SCENARIO=spike_test docker-compose up -d` | 15 min | 500 | Sudden traffic surge |
| Soak Test | `SCENARIO=soak_test docker-compose up -d` | 30 min | 200 | Long-duration stability |

**Take Screenshots at Key Moments** to document auto-scaling behavior!

---

## Table of Contents

1. [Why Mock Visualizations?](#1-why-mock-visualizations)
2. [Tool Options](#2-tool-options)
3. [Quick Start: Docker Mock Monitoring](#3-quick-start-docker-mock-monitoring)
4. [Method 1: Grafana with Mock Data](#4-method-1-grafana-with-mock-data)
5. [Method 2: Online Chart Tools](#5-method-2-online-chart-tools)
6. [Method 3: Presentation Screenshots](#6-method-3-presentation-screenshots)
7. [Decision Visualizations](#7-decision-visualizations)
8. [Ready-to-Use Mockup Data](#8-ready-to-use-mockup-data)
9. [Screenshot Guide](#9-screenshot-guide)

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

### Option A: Project Mock Monitoring Stack (RECOMMENDED)

**Location**: `mock-monitoring/` directory
**Pros**: Pre-built, realistic, multiple scenarios, auto-provisioned dashboards
**Cons**: Requires Docker
**Time**: 2 minutes to start

### Option B: Online Chart Tools

**Pros**: Quick, no installation
**Cons**: Less realistic, limited customization
**Time**: 15-30 minutes

### Option C: Presentation Software

**Pros**: Full control, easy to modify
**Cons**: Less authentic appearance
**Time**: 30-45 minutes

---

## 3. Quick Start: Docker Mock Monitoring

### Project Structure

The `mock-monitoring/` directory contains a complete, ready-to-use monitoring stack:

```
mock-monitoring/
├── docker-compose.yml          # Main orchestration file
├── README.md                   # Detailed documentation
├── metrics-generator/
│   ├── Dockerfile              # Python metrics generator image
│   └── metrics_generator.py    # Simulates realistic metrics for all scenarios
├── prometheus/
│   └── prometheus.yml          # Prometheus scrape configuration
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml # Auto-configures Prometheus datasource
        └── dashboards/
            ├── dashboards.yml  # Dashboard provisioning config
            └── dentalhelp-overview.json  # 14-panel pre-built dashboard
```

### Step-by-Step Usage

#### 1. Start the Stack

```bash
cd mock-monitoring

# Default: 100 users scenario
docker-compose up -d

# Or specify a scenario:
SCENARIO=1000_users docker-compose up -d
SCENARIO=10000_users docker-compose up -d
SCENARIO=stress_test docker-compose up -d
```

#### 2. Access the Dashboards

- **Grafana**: http://localhost:3000
  - Username: `admin`
  - Password: `admin123`
  - Dashboard: "DentalHelp Auto-Scaling Overview" (auto-loaded)

- **Prometheus**: http://localhost:9090
  - Query metrics directly
  - Verify data is being scraped

#### 3. Wait for Data

Each scenario simulates a complete load test cycle. Wait for the appropriate duration to capture the full test:

| Scenario | Duration | Best Screenshot Time |
|----------|----------|---------------------|
| 100 Users | 10 min | After 8 minutes |
| 1,000 Users | 15 min | After 12 minutes |
| 10,000 Users | 20 min | After 16 minutes |
| Stress Test | 25 min | After 20 minutes |
| Spike Test | 15 min | After 10 minutes |
| Soak Test | 30 min | After 25 minutes |

#### 4. Take Screenshots

The Grafana dashboard includes 14 panels:

1. **CPU vs HPA Target** - Shows when HPA would trigger
2. **Replicas vs Virtual Users** - Demonstrates scaling correlation
3. **P95 Response Time** - Performance metrics
4. **Error Rate** - System health
5. **Per-Service CPU** - Individual service breakdown
6. **Per-Service Memory** - Memory utilization
7. **Per-Service Replicas** - Scaling per microservice

#### 5. Switch Scenarios

To change scenarios, restart with a new SCENARIO variable:

```bash
# Stop current stack
docker-compose down

# Start new scenario
SCENARIO=10000_users docker-compose up -d
```

### Metrics Generated

The mock metrics generator produces realistic Prometheus metrics:

```promql
# Available metrics
dentalhelp_virtual_users          # Current simulated load
dentalhelp_cpu_utilization        # CPU % per service
dentalhelp_memory_utilization     # Memory % per service
dentalhelp_replicas               # Pod replicas per service
dentalhelp_response_time_p95      # P95 latency in ms
dentalhelp_error_rate             # Error rate %
dentalhelp_throughput_rps         # Requests per second
dentalhelp_hpa_target             # HPA threshold (70%)
```

---

## 4. Method 1: Grafana with Mock Data

> **Note**: The project already includes a complete implementation in `mock-monitoring/`.
> Use Section 3 for the recommended approach. This section explains the underlying architecture.

### Architecture Overview

The mock monitoring stack uses:
- **Prometheus** - Scrapes metrics from the generator every 2 seconds
- **Grafana** - Visualizes metrics with pre-built dashboards
- **Metrics Generator** - Python app that simulates realistic DentalHelp metrics

### Step 1: Using the Project's Docker Stack

The project includes a complete implementation:

```bash
# Use the existing mock-monitoring stack
cd mock-monitoring
docker-compose up -d
```

The `docker-compose.yml` in `mock-monitoring/` includes:
- **Prometheus** (port 9090)
- **Grafana** (port 3000) with auto-provisioned dashboards
- **Metrics Generator** (port 8000) with configurable scenarios

### Step 2: Understanding the Metrics Generator

The metrics generator (`mock-monitoring/metrics-generator/metrics_generator.py`) simulates realistic metrics. It supports 6 scenarios controlled by the `SCENARIO` environment variable:

| Scenario | Simulates |
|----------|-----------|
| `100_users` | Light load test with 100 concurrent users |
| `1000_users` | Normal production load with 1,000 users |
| `10000_users` | High load stress test with 10,000 users |
| `stress_test` | Gradual ramp to system breaking point |
| `spike_test` | Sudden traffic surge to test elasticity |
| `soak_test` | Extended duration stability test |

Each scenario simulates:
1. **Ramp-up phase** - Gradual load increase
2. **Peak phase** - Maximum load
3. **HPA scaling response** - Automatic replica adjustment
4. **Stabilization** - System recovery

### Step 3: Pre-built Grafana Dashboard

The project includes a comprehensive 14-panel Grafana dashboard at:
`mock-monitoring/grafana/provisioning/dashboards/dentalhelp-overview.json`

**Dashboard Panels:**
- CPU Utilization vs HPA Target (70% threshold line)
- Pod Replicas vs Virtual Users
- P95 Response Time
- Error Rate %
- Throughput (requests/second)
- Per-service CPU breakdown (all 9 services)
- Per-service Memory utilization
- Per-service Replica counts

### Step 4: Run and Capture Screenshots

```bash
# Navigate to mock-monitoring directory
cd mock-monitoring

# Start the environment
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Access Grafana
echo "Open http://localhost:3000"
echo "Login: admin / admin123"
echo "Dashboard is auto-loaded - 'DentalHelp Auto-Scaling Overview'"
echo "Wait for scenario duration to capture full cycle"
```

---

## 5. Method 2: Online Chart Tools

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

## 6. Method 3: Presentation Screenshots

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

> **Note**: The `mock-monitoring/` Docker stack generates all this data automatically.
> These examples are provided for reference and manual chart creation.

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

## 9. Screenshot Guide

### Recommended Screenshots for Documentation

Take these screenshots to demonstrate your understanding of auto-scaling:

#### For 100 Users (Smoke Test)
1. Dashboard overview at peak load (after 6 min)
2. CPU staying below threshold (~45%)
3. Replicas stable at minimum (2-3)

#### For 1,000 Users (Load Test)
1. Dashboard overview showing scaling in action
2. CPU crossing 70% threshold
3. Replicas scaling from 2 to 4-5
4. Response time graph

#### For 10,000 Users (Stress Test)
1. Full dashboard at peak stress
2. CPU at 85-95%
3. Maximum replicas reached
4. Error rate spike and recovery
5. Response time degradation and recovery after scaling

#### Screenshot Tips

1. **Set time range**: Use "Last 15 minutes" or custom range
2. **Use dashboard refresh**: Set auto-refresh to 5s during test
3. **Capture key moments**:
   - Before scaling (baseline)
   - During scaling (transition)
   - After scaling (stabilized)
4. **Include annotations**: Add text explaining what's happening

### Labeling Screenshots

When using in documentation, add captions like:
- "Figure 1: HPA scaling response during 1000-user load test (simulated data)"
- "Figure 2: CPU utilization triggering scale-out at 70% threshold"

---

## 10. Summary: Best Practices for Mock Visualizations

### Do's

- ✅ Be transparent: Label as "simulated" or "demonstration data"
- ✅ Use realistic numbers from your actual test results
- ✅ Show the correlation between decisions and metrics
- ✅ Include timestamps and context
- ✅ Reference source documentation (load testing results)
- ✅ Use the `mock-monitoring/` Docker stack for consistent results

### Don'ts

- ❌ Claim visualizations are from production if they're not
- ❌ Use obviously unrealistic numbers
- ❌ Ignore error cases and only show success
- ❌ Create visualizations that contradict your documentation

### Quick Reference Commands

```bash
# Navigate to mock-monitoring directory
cd mock-monitoring

# Start mock monitoring (100 users default)
docker-compose up -d

# Start with specific scenario
SCENARIO=1000_users docker-compose up -d
SCENARIO=10000_users docker-compose up -d

# Access Grafana
open http://localhost:3000
# Login: admin / admin123

# View logs
docker-compose logs -f metrics-generator

# Stop mock monitoring
docker-compose down

# Restart with different scenario
docker-compose down && SCENARIO=stress_test docker-compose up -d
```

### Files Reference

| File | Purpose |
|------|---------|
| `mock-monitoring/docker-compose.yml` | Main orchestration |
| `mock-monitoring/metrics-generator/metrics_generator.py` | Metrics simulation |
| `mock-monitoring/grafana/provisioning/dashboards/dentalhelp-overview.json` | Pre-built dashboard |
| `mock-monitoring/prometheus/prometheus.yml` | Prometheus config |
| `mock-monitoring/README.md` | Detailed documentation |

---

**Document Version**: 2.0
**Last Updated**: December 14, 2025
**Purpose**: Academic demonstration and portfolio presentation
**Related**: See `mock-monitoring/README.md` for detailed Docker stack documentation
