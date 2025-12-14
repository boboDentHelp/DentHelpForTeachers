# DentalHelp Mock Monitoring Stack

Generate **realistic Grafana dashboards** to demonstrate Kubernetes auto-scaling decisions for different load test scenarios.

## 🚀 Quick Start

```bash
# Navigate to mock-monitoring directory
cd mock-monitoring

# Start the stack (default: stress_test scenario)
docker-compose up -d

# Open Grafana
# URL: http://localhost:3000
# Login: admin / admin
```

## 📊 Available Scenarios

Run different test scenarios by setting the `SCENARIO` environment variable:

### 1. Light Load Test (100 Users)
```bash
SCENARIO=100_users docker-compose up -d
```
- Duration: 10 minutes (looped)
- Peak VUs: 100
- Expected replicas: 2-3
- Use for: Baseline performance screenshots

### 2. Medium Load Test (1,000 Users)
```bash
SCENARIO=1000_users docker-compose up -d
```
- Duration: 15 minutes (looped)
- Peak VUs: 1,000
- Expected replicas: 2-6
- Use for: Normal production load screenshots

### 3. Heavy Load Test (10,000 Users)
```bash
SCENARIO=10000_users docker-compose up -d
```
- Duration: 20 minutes (looped)
- Peak VUs: 10,000
- Expected replicas: 2-10
- Use for: High traffic/scaling screenshots

### 4. Stress Test with HPA Scaling (Default)
```bash
SCENARIO=stress_test docker-compose up -d
# or just:
docker-compose up -d
```
- Duration: 17 minutes (looped)
- Peak VUs: 400 (ramps up gradually)
- Expected replicas: 2→4→6→8→4→2
- Use for: **HPA auto-scaling demonstration**

### 5. Spike Test (Sudden Traffic Burst)
```bash
SCENARIO=spike_test docker-compose up -d
```
- Duration: 8 minutes (looped)
- Peak VUs: 50→500 (instant spike)
- Expected replicas: 2→8 (rapid scaling)
- Use for: Spike handling demonstration

### 6. Soak Test (Long-term Stability)
```bash
SCENARIO=soak_test docker-compose up -d
```
- Duration: 3 hours (compressed, looped)
- Peak VUs: 50 (steady)
- Expected replicas: 2 (stable)
- Use for: Memory leak / stability screenshots

## 📸 Taking Screenshots

### Best Practices

1. **Wait for data to accumulate** - Let the scenario run for at least 5-10 minutes before taking screenshots

2. **Recommended time ranges**:
   - `Last 15 minutes` - Shows full test cycle
   - `Last 30 minutes` - Shows multiple cycles
   - `Last 5 minutes` - Shows recent detail

3. **Key panels to capture**:
   - **CPU vs HPA Target** - Shows when scaling triggers
   - **Replicas vs Virtual Users** - Shows auto-scaling response
   - **P95 Response Time** - Shows performance impact
   - **Error Rate** - Shows system stability

### Screenshot Workflow

```bash
# 1. Start desired scenario
SCENARIO=stress_test docker-compose up -d

# 2. Wait for metrics to accumulate (5-10 minutes)

# 3. Open Grafana
open http://localhost:3000

# 4. Login: admin / admin

# 5. Dashboard auto-loads "DentalHelp - Auto-Scaling Dashboard"

# 6. Set time range to "Last 15 minutes"

# 7. Take screenshots (use browser or Grafana's share feature)

# 8. Stop when done
docker-compose down
```

## 📈 What Each Panel Shows

### Top Row
| Panel | Description | Key Insight |
|-------|-------------|-------------|
| **CPU vs HPA Target** | API Gateway CPU with 70% threshold line | Shows when HPA triggers scaling |
| **Replicas vs VUs** | Pod count vs concurrent users | Shows auto-scaling response |

### Second Row
| Panel | Description | Key Insight |
|-------|-------------|-------------|
| **P95 Response Time** | 95th percentile latency | Shows performance impact of load |
| **Error Rate** | Percentage of failed requests | Shows system stability |

### Stats Row
Quick overview of: Virtual Users, Total Replicas, Avg CPU, Throughput, Response Time, Error Rate

### Bottom Rows
Detailed per-service metrics for CPU, Memory, Replicas, and Requests/Second

## 🎯 Recommended Screenshots for Documentation

### For Load Testing Documentation

1. **100 Users Test**
   - Run `SCENARIO=100_users`
   - Screenshot at stable state (5 min)
   - Shows: Low CPU (~35%), 2 replicas, fast response (~125ms)

2. **1,000 Users Test**
   - Run `SCENARIO=1000_users`
   - Screenshot at peak (8 min)
   - Shows: Medium CPU (~60%), 4-6 replicas, acceptable response (~185ms)

3. **10,000 Users Test**
   - Run `SCENARIO=10000_users`
   - Screenshot at peak (10 min)
   - Shows: High CPU (~85%), 8-10 replicas, stressed response (~500ms+)

### For Auto-Scaling Documentation

1. **Scaling Up**
   - Run `SCENARIO=stress_test`
   - Screenshot at T+8 min (during ramp up)
   - Shows: CPU crossing 70%, replicas increasing

2. **Peak Load**
   - Run `SCENARIO=stress_test`
   - Screenshot at T+12 min (sustained peak)
   - Shows: 8 replicas handling 400 VUs

3. **Scaling Down**
   - Run `SCENARIO=stress_test`
   - Screenshot at T+16 min (during ramp down)
   - Shows: CPU dropping, replicas decreasing after cooldown

### For Spike Test Documentation

1. **Before Spike**
   - Run `SCENARIO=spike_test`
   - Screenshot at T+1 min
   - Shows: Baseline state (50 VUs, 2 replicas)

2. **During Spike**
   - Screenshot at T+3 min
   - Shows: 500 VUs, CPU spike, replicas scaling up

3. **Recovery**
   - Screenshot at T+6 min
   - Shows: VUs dropped, system recovering

## 🔧 Troubleshooting

### Grafana shows "No data"
```bash
# Check if metrics generator is running
docker logs mock-metrics-generator

# Check Prometheus targets
open http://localhost:9090/targets

# Restart the stack
docker-compose down && docker-compose up -d
```

### Change scenario without restart
```bash
# Stop and remove containers
docker-compose down

# Start with new scenario
SCENARIO=1000_users docker-compose up -d
```

### View metrics directly
```bash
# Prometheus UI
open http://localhost:9090

# Query example
# dentalhelp_virtual_users
# dentalhelp_cpu_percent{service="api-gateway"}
# dentalhelp_replicas
```

## 🛑 Stopping the Stack

```bash
# Stop containers (preserves data)
docker-compose stop

# Stop and remove containers + volumes
docker-compose down -v
```

## 📁 Directory Structure

```
mock-monitoring/
├── docker-compose.yml           # Main compose file
├── README.md                    # This file
├── prometheus/
│   └── prometheus.yml           # Prometheus config
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasources.yml  # Prometheus datasource
│       └── dashboards/
│           ├── dashboards.yml   # Dashboard provisioning
│           └── dentalhelp-overview.json  # Main dashboard
└── metrics-generator/
    ├── Dockerfile               # Python container
    └── metrics_generator.py     # Metrics simulation
```

## 📝 Note on Data Authenticity

These dashboards display **simulated data** based on realistic patterns from the actual DentalHelp load tests. The metrics generator simulates:

- HPA scaling behavior (scale up at 70% CPU, scale down after 5 min cooldown)
- Realistic response time curves under load
- Error rates that increase with system stress
- Memory growth patterns typical of JVM applications

This is for **demonstration and documentation purposes** to explain architecture decisions when production infrastructure is not available.
