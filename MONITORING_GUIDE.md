# Prometheus & Grafana Monitoring Guide - DentalHelp

## Overview
This guide explains how to access, configure, and use Prometheus and Grafana for monitoring the DentalHelp microservices architecture. The system monitors all 9 services independently with custom dashboards for performance, health, and resource utilization.

**Monitoring Stack:**
- **Prometheus:** Metrics collection and storage
- **Grafana:** Visualization and dashboards
- **Spring Boot Actuator:** Metrics exposure from each microservice
- **cAdvisor:** Container metrics (optional)

**Target Monitoring Level:** ✅ **PROFICIENT** - All containers independently monitored

---

## Quick Access Commands

### Access Grafana Dashboard
```bash
# If running in Kubernetes
kubectl port-forward -n dentalhelp svc/grafana 3000:3000

# If running with Docker Compose
# Grafana is already exposed on port 3000
```

Then open in browser:
```
http://localhost:3000
```

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin` (change on first login)

---

### Access Prometheus Dashboard
```bash
# If running in Kubernetes
kubectl port-forward -n dentalhelp svc/prometheus 9090:9090

# If running with Docker Compose
# Prometheus is already exposed on port 9090
```

Then open in browser:
```
http://localhost:9090
```

---

### Check Service Metrics Endpoints
Each microservice exposes metrics at `/actuator/prometheus`:

```bash
# Auth Service
curl http://localhost:8081/actuator/prometheus

# Patient Service
curl http://localhost:8082/actuator/prometheus

# Appointment Service
curl http://localhost:8083/actuator/prometheus

# Dental Records Service
curl http://localhost:8084/actuator/prometheus

# X-Ray Service
curl http://localhost:8085/actuator/prometheus

# Treatment Service
curl http://localhost:8086/actuator/prometheus

# Notification Service
curl http://localhost:8087/actuator/prometheus

# API Gateway
curl http://localhost:8080/actuator/prometheus

# Eureka Server
curl http://localhost:8761/actuator/prometheus
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Grafana (Port 3000)                    │
│              Visualization & Dashboards                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Queries
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Prometheus (Port 9090)                    │
│              Metrics Collection & Storage                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Scrapes /actuator/prometheus every 15s
                      │
        ┌─────────────┼─────────────┬─────────────┬──────────┐
        ▼             ▼             ▼             ▼          ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ...
  │  Auth    │  │ Patient  │  │Appointment│  │ Records  │  (9 services)
  │ Service  │  │ Service  │  │ Service   │  │ Service  │
  │ :8081    │  │ :8082    │  │ :8083     │  │ :8084    │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                    │
            Spring Boot Actuator
         Exposes: /actuator/prometheus
                /actuator/health
                /actuator/metrics
```

---

## Setup Prometheus + Grafana

### Option 1: Docker Compose (Local Development)

#### 1.1 Create `monitoring/docker-compose-monitoring.yml`

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: dentalhelp-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - dentalhelp-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:10.1.5
    container_name: dentalhelp-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=http://localhost:3000
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    networks:
      - dentalhelp-network
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:

networks:
  dentalhelp-network:
    external: true
```

#### 1.2 Create `monitoring/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'dentalhelp'
    environment: 'development'

scrape_configs:
  # Auth Service
  - job_name: 'auth-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['auth-service:8081']
        labels:
          service: 'auth-service'
          team: 'backend'

  # Patient Service
  - job_name: 'patient-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['patient-service:8082']
        labels:
          service: 'patient-service'
          team: 'backend'

  # Appointment Service
  - job_name: 'appointment-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['appointment-service:8083']
        labels:
          service: 'appointment-service'
          team: 'backend'

  # Dental Records Service
  - job_name: 'dental-records-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['dental-records-service:8084']
        labels:
          service: 'dental-records-service'
          team: 'backend'

  # X-Ray Service
  - job_name: 'xray-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['xray-service:8085']
        labels:
          service: 'xray-service'
          team: 'backend'

  # Treatment Service
  - job_name: 'treatment-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['treatment-service:8086']
        labels:
          service: 'treatment-service'
          team: 'backend'

  # Notification Service
  - job_name: 'notification-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['notification-service:8087']
        labels:
          service: 'notification-service'
          team: 'backend'

  # API Gateway
  - job_name: 'api-gateway'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['api-gateway:8080']
        labels:
          service: 'api-gateway'
          team: 'gateway'

  # Eureka Server
  - job_name: 'eureka-server'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['eureka-server:8761']
        labels:
          service: 'eureka-server'
          team: 'infrastructure'

  # MySQL Database (optional - requires mysqld_exporter)
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
        labels:
          service: 'mysql'
          team: 'database'

  # RabbitMQ (optional - built-in metrics)
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15692']
        labels:
          service: 'rabbitmq'
          team: 'messaging'
```

#### 1.3 Start Monitoring Stack

```bash
# Navigate to monitoring directory
cd monitoring

# Start Prometheus and Grafana
docker-compose -f docker-compose-monitoring.yml up -d

# Check status
docker-compose -f docker-compose-monitoring.yml ps

# View logs
docker-compose -f docker-compose-monitoring.yml logs -f grafana
docker-compose -f docker-compose-monitoring.yml logs -f prometheus
```

Expected output:
```
Creating dentalhelp-prometheus ... done
Creating dentalhelp-grafana    ... done

Name                      State    Ports
----------------------------------------------------------------
dentalhelp-prometheus     Up       0.0.0.0:9090->9090/tcp
dentalhelp-grafana        Up       0.0.0.0:3000->3000/tcp
```

---

### Option 2: Kubernetes (Production)

#### 2.1 Deploy Prometheus

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace dentalhelp \
  --set alertmanager.enabled=false \
  --set pushgateway.enabled=false \
  --set nodeExporter.enabled=true \
  --set server.persistentVolume.size=20Gi
```

#### 2.2 Deploy Grafana

```bash
# Add Grafana Helm repository
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Grafana
helm install grafana grafana/grafana \
  --namespace dentalhelp \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=admin123
```

#### 2.3 Verify Installation

```bash
# Check pods
kubectl get pods -n dentalhelp | grep -E "prometheus|grafana"

# Expected output:
# prometheus-server-xxxxx          1/1     Running   0          2m
# grafana-xxxxx                    1/1     Running   0          1m
```

#### 2.4 Access Services

```bash
# Get Grafana admin password
kubectl get secret --namespace dentalhelp grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Port forward Grafana
kubectl port-forward -n dentalhelp svc/grafana 3000:80

# Port forward Prometheus
kubectl port-forward -n dentalhelp svc/prometheus-server 9090:80
```

---

## Verify Prometheus is Scraping Metrics

### Check Targets in Prometheus

1. Open Prometheus: http://localhost:9090
2. Navigate to **Status** → **Targets**
3. Verify all 9 services are **UP**

Expected view:
```
Endpoint                                          State    Last Scrape
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
http://auth-service:8081/actuator/prometheus      UP      2.3s ago
http://patient-service:8082/actuator/prometheus   UP      1.8s ago
http://appointment-service:8083/actuator/...      UP      3.1s ago
http://dental-records-service:8084/actuator/...   UP      2.7s ago
http://xray-service:8085/actuator/prometheus      UP      1.5s ago
http://treatment-service:8086/actuator/...        UP      2.9s ago
http://notification-service:8087/actuator/...     UP      1.2s ago
http://api-gateway:8080/actuator/prometheus       UP      3.4s ago
http://eureka-server:8761/actuator/prometheus     UP      2.1s ago
```

@[SCREENSHOT] Prometheus Targets page showing all 9 services UP

### Query Metrics in Prometheus

Try these sample queries in the Prometheus query interface:

```promql
# Total HTTP requests across all services
sum(http_server_requests_seconds_count)

# HTTP requests per service
sum by (application) (http_server_requests_seconds_count)

# Average response time (last 5 minutes)
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])

# CPU usage per service
process_cpu_usage

# Memory usage per service
jvm_memory_used_bytes{area="heap"}

# Database connection pool status
hikaricp_connections_active{pool="dentalHelpHikariCP"}

# Error rate (4xx and 5xx responses)
sum(rate(http_server_requests_seconds_count{status=~"4..|5.."}[5m])) by (application)
```

@[SCREENSHOT] Prometheus query interface showing sample metrics

---

## Configure Grafana Dashboards

### First-Time Grafana Setup

1. **Open Grafana:** http://localhost:3000
2. **Login:**
   - Username: `admin`
   - Password: `admin`
3. **Change Password** when prompted
4. **Add Prometheus Data Source:**
   - Click **Configuration** (gear icon) → **Data Sources**
   - Click **Add data source**
   - Select **Prometheus**
   - Set URL: `http://prometheus:9090` (Docker) or `http://prometheus-server` (Kubernetes)
   - Click **Save & Test**
   - Should show: ✅ **Data source is working**

@[SCREENSHOT] Grafana data source configuration showing Prometheus connected

---

## Pre-Configured Dashboards

### Dashboard 1: Microservices Overview

**Import ID:** 4701 (Spring Boot 2.1+ Actuator)

**Steps to Import:**
1. Click **+** → **Import**
2. Enter ID: **4701**
3. Click **Load**
4. Select Prometheus data source
5. Click **Import**

**Metrics Displayed:**
- ✅ Request rate (req/s) per service
- ✅ Response time (p50, p95, p99)
- ✅ Error rate (%)
- ✅ JVM heap memory usage
- ✅ CPU usage
- ✅ Garbage collection statistics
- ✅ Thread count

@[SCREENSHOT] Grafana dashboard showing all 9 microservices overview

---

### Dashboard 2: JVM Metrics (Micrometer)

**Import ID:** 11955 (JVM Micrometer Dashboard)

**Metrics Displayed:**
- Heap memory usage (used vs max)
- Non-heap memory usage
- GC pause duration
- GC count
- Thread states (runnable, blocked, waiting)
- Class loader statistics

@[SCREENSHOT] Grafana JVM metrics dashboard

---

### Dashboard 3: Database Connection Pool

**Custom Dashboard JSON:**

```json
{
  "dashboard": {
    "title": "HikariCP Database Connection Pool",
    "panels": [
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "hikaricp_connections_active",
            "legendFormat": "{{application}}"
          }
        ]
      },
      {
        "title": "Idle Connections",
        "targets": [
          {
            "expr": "hikaricp_connections_idle",
            "legendFormat": "{{application}}"
          }
        ]
      },
      {
        "title": "Connection Timeout",
        "targets": [
          {
            "expr": "rate(hikaricp_connections_timeout_total[5m])",
            "legendFormat": "{{application}}"
          }
        ]
      },
      {
        "title": "Connection Acquisition Time",
        "targets": [
          {
            "expr": "hikaricp_connections_acquire_seconds_sum / hikaricp_connections_acquire_seconds_count",
            "legendFormat": "{{application}}"
          }
        ]
      }
    ]
  }
}
```

@[SCREENSHOT] Grafana HikariCP connection pool dashboard

---

### Dashboard 4: HTTP Performance

**Panels:**

#### Request Rate
```promql
sum(rate(http_server_requests_seconds_count[5m])) by (application)
```

#### Average Response Time
```promql
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])
```

#### P95 Response Time
```promql
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (application, le))
```

#### Error Rate (4xx, 5xx)
```promql
sum(rate(http_server_requests_seconds_count{status=~"4..|5.."}[5m])) by (application, status)
```

#### Top 10 Slowest Endpoints
```promql
topk(10,
  rate(http_server_requests_seconds_sum[5m]) /
  rate(http_server_requests_seconds_count[5m])
) by (uri, application)
```

@[SCREENSHOT] Grafana HTTP performance dashboard

---

### Dashboard 5: System Resources

**Panels:**

#### CPU Usage
```promql
process_cpu_usage{application=~".*"}
```

#### Memory Usage
```promql
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

#### Disk I/O
```promql
rate(process_disk_reads_total[5m])
rate(process_disk_writes_total[5m])
```

#### Network Traffic
```promql
rate(process_network_receive_bytes_total[5m])
rate(process_network_transmit_bytes_total[5m])
```

@[SCREENSHOT] Grafana system resources dashboard

---

## Kubernetes-Specific Monitoring

### Check Pod Metrics

```bash
# View pod resource usage
kubectl top pods -n dentalhelp

# Expected output:
NAME                               CPU(cores)   MEMORY(bytes)
auth-service-7c8f9d5b4-abc12      127m         412Mi
patient-service-6d9e8c4a3-def34   95m          387Mi
appointment-service-5b7d6a2-gh56  103m         395Mi
...
```

### Monitor HPA Scaling

```bash
# Watch HPA in real-time
kubectl get hpa -n dentalhelp -w

# Detailed HPA metrics
kubectl describe hpa api-gateway-hpa -n dentalhelp

# Expected output:
Name:                                           api-gateway-hpa
Namespace:                                      dentalhelp
Reference:                                      Deployment/api-gateway
Metrics:                                        ( current / target )
  resource cpu on pods (as a percentage of request): 45% (90m) / 70%
Min replicas:                                   2
Max replicas:                                   10
Deployment pods:                                3 current / 3 desired
```

### View Logs with Metrics Context

```bash
# Tail logs for a specific service
kubectl logs -f -n dentalhelp deployment/auth-service

# View logs with timestamps
kubectl logs -n dentalhelp deployment/auth-service --timestamps=true

# Filter logs for errors
kubectl logs -n dentalhelp deployment/auth-service | grep -i error
```

---

## Alert Configuration (Optional but Recommended)

### Prometheus Alerting Rules

Create `monitoring/prometheus/alerts.yml`:

```yaml
groups:
  - name: dentalhelp_alerts
    interval: 30s
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application) /
          sum(rate(http_server_requests_seconds_count[5m])) by (application) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.application }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.application }}"

      # High Response Time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_server_requests_seconds_bucket[5m])) by (application, le)
          ) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.application }}"
          description: "P95 response time is {{ $value }}s on {{ $labels.application }}"

      # Service Down
      - alert: ServiceDown
        expr: up{job=~".*-service|api-gateway|eureka-server"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 2 minutes"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: |
          (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.application }}"
          description: "Heap memory usage is {{ $value | humanizePercentage }} on {{ $labels.application }}"

      # Database Connection Pool Exhaustion
      - alert: ConnectionPoolExhaustion
        expr: |
          (hikaricp_connections_active / hikaricp_connections_max) > 0.9
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "Connection pool near exhaustion on {{ $labels.application }}"
          description: "{{ $value | humanizePercentage }} of connections in use"
```

Update `prometheus.yml` to include alerts:

```yaml
rule_files:
  - 'alerts.yml'
```

---

## Common Monitoring Commands

### Docker Compose Environment

```bash
# Start monitoring stack
docker-compose -f monitoring/docker-compose-monitoring.yml up -d

# Stop monitoring stack
docker-compose -f monitoring/docker-compose-monitoring.yml down

# Restart Prometheus (reload config)
docker-compose -f monitoring/docker-compose-monitoring.yml restart prometheus

# View Prometheus logs
docker logs dentalhelp-prometheus -f

# View Grafana logs
docker logs dentalhelp-grafana -f

# Check Prometheus config validity
docker exec dentalhelp-prometheus promtool check config /etc/prometheus/prometheus.yml

# Backup Grafana data
docker cp dentalhelp-grafana:/var/lib/grafana ./grafana-backup-$(date +%Y%m%d)
```

### Kubernetes Environment

```bash
# List monitoring pods
kubectl get pods -n dentalhelp | grep -E "prometheus|grafana"

# Port forward Grafana (access at http://localhost:3000)
kubectl port-forward -n dentalhelp svc/grafana 3000:80

# Port forward Prometheus (access at http://localhost:9090)
kubectl port-forward -n dentalhelp svc/prometheus-server 9090:80

# Check Prometheus config
kubectl exec -n dentalhelp prometheus-server-xxxxx -- promtool check config /etc/prometheus/prometheus.yml

# View Prometheus logs
kubectl logs -n dentalhelp prometheus-server-xxxxx -f

# View Grafana logs
kubectl logs -n dentalhelp grafana-xxxxx -f

# Restart Prometheus
kubectl rollout restart deployment/prometheus-server -n dentalhelp

# Restart Grafana
kubectl rollout restart deployment/grafana -n dentalhelp

# Get Grafana admin password (if installed via Helm)
kubectl get secret --namespace dentalhelp grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

---

## Verify Spring Boot Actuator Configuration

Each microservice must have Actuator and Prometheus dependencies configured:

### Check `pom.xml` (Maven)

```xml
<dependencies>
    <!-- Spring Boot Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Micrometer Prometheus -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```

### Check `application.yml` (Configuration)

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
```

### Test Actuator Endpoint

```bash
# Health check
curl http://localhost:8081/actuator/health

# Prometheus metrics
curl http://localhost:8081/actuator/prometheus | head -20

# Expected output:
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
# jvm_memory_used_bytes{application="auth-service",area="heap",id="G1 Eden Space",} 4.2991616E7
# jvm_memory_used_bytes{application="auth-service",area="heap",id="G1 Old Gen",} 1.8874368E7
# ...
# HELP http_server_requests_seconds
# TYPE http_server_requests_seconds summary
# http_server_requests_seconds_count{application="auth-service",exception="None",method="POST",outcome="SUCCESS",status="200",uri="/api/auth/login",} 127.0
# http_server_requests_seconds_sum{application="auth-service",exception="None",method="POST",outcome="SUCCESS",status="200",uri="/api/auth/login",} 3.452
```

---

## Key Metrics to Monitor

### Application Performance Metrics

| Metric | Prometheus Query | What to Monitor |
|--------|------------------|-----------------|
| **Request Rate** | `rate(http_server_requests_seconds_count[5m])` | Sudden drops or spikes |
| **Response Time (avg)** | `rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])` | Should be <500ms |
| **Response Time (P95)** | `histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))` | Should be <1s |
| **Error Rate** | `rate(http_server_requests_seconds_count{status=~"5.."}[5m])` | Should be <1% |
| **Success Rate** | `rate(http_server_requests_seconds_count{status=~"2.."}[5m])` | Should be >99% |

### JVM Metrics

| Metric | Prometheus Query | What to Monitor |
|--------|------------------|-----------------|
| **Heap Usage** | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}` | Should be <80% |
| **GC Pause Time** | `rate(jvm_gc_pause_seconds_sum[5m])` | Should be <100ms |
| **GC Count** | `rate(jvm_gc_pause_seconds_count[5m])` | Frequency of GC |
| **Thread Count** | `jvm_threads_live_threads` | Watch for thread leaks |

### Database Metrics

| Metric | Prometheus Query | What to Monitor |
|--------|------------------|-----------------|
| **Active Connections** | `hikaricp_connections_active` | Should be <max pool size |
| **Idle Connections** | `hikaricp_connections_idle` | Pool efficiency |
| **Connection Timeout** | `rate(hikaricp_connections_timeout_total[5m])` | Should be 0 |
| **Acquire Time** | `hikaricp_connections_acquire_seconds` | Should be <50ms |

### System Metrics

| Metric | Prometheus Query | What to Monitor |
|--------|------------------|-----------------|
| **CPU Usage** | `process_cpu_usage` | Should be <80% |
| **Uptime** | `process_uptime_seconds` | Service stability |
| **File Descriptors** | `process_open_fds` | Watch for leaks |

---

## Performance Baselines (DentalHelp Project)

Based on load testing results (see @LOAD_TESTING_COMPREHENSIVE.md):

### Expected Metrics Under Normal Load (100 users)

| Service | Avg Response Time | P95 Response Time | CPU Usage | Memory Usage |
|---------|-------------------|-------------------|-----------|--------------|
| Auth Service | 127ms | 245ms | 35% | 412 MB |
| Patient Service | 98ms | 187ms | 28% | 387 MB |
| Appointment Service | 112ms | 223ms | 31% | 395 MB |
| Dental Records Service | 134ms | 267ms | 37% | 428 MB |
| X-Ray Service | 156ms | 312ms | 42% | 456 MB |
| Treatment Service | 108ms | 214ms | 29% | 391 MB |
| Notification Service | 89ms | 174ms | 25% | 368 MB |
| API Gateway | 145ms | 289ms | 40% | 441 MB |
| Eureka Server | 67ms | 132ms | 18% | 298 MB |

### Alerting Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| High response time | P95 > 1s for 10 min | Investigate slow queries |
| High error rate | >5% for 5 min | Check logs, rollback if needed |
| High memory | >90% heap for 5 min | Investigate memory leaks, scale up |
| High CPU | >85% for 10 min | Scale horizontally (HPA) |
| Connection pool exhaustion | >90% active for 3 min | Increase pool size or scale |
| Service down | Down for 2 min | Auto-restart, check health |

---

## Troubleshooting

### Issue 1: Prometheus Not Scraping Targets

**Symptom:** Targets show as "DOWN" in Prometheus

**Solutions:**
```bash
# Check if service is reachable
curl http://auth-service:8081/actuator/prometheus

# Check Prometheus logs
docker logs dentalhelp-prometheus | grep error

# Verify network connectivity
docker exec dentalhelp-prometheus wget -O- http://auth-service:8081/actuator/health

# Check Prometheus config
docker exec dentalhelp-prometheus cat /etc/prometheus/prometheus.yml
```

### Issue 2: No Data in Grafana

**Symptom:** Dashboards show "No data"

**Solutions:**
1. **Verify Prometheus data source:**
   - Grafana → Configuration → Data Sources → Prometheus
   - Click **Test** → Should show "Data source is working"

2. **Check Prometheus has data:**
   - Open Prometheus: http://localhost:9090
   - Run query: `up`
   - Should show all services

3. **Verify time range:**
   - Check dashboard time range (top right)
   - Set to "Last 15 minutes"

### Issue 3: High Memory Usage in Grafana

**Solution:**
```bash
# Restart Grafana
docker-compose -f monitoring/docker-compose-monitoring.yml restart grafana

# Or in Kubernetes
kubectl rollout restart deployment/grafana -n dentalhelp
```

### Issue 4: Metrics Not Showing for Specific Service

**Check Actuator configuration:**
```bash
# Verify actuator dependency in pom.xml
grep -A3 "actuator" microservices/auth-service/pom.xml

# Check application.yml
grep -A10 "management:" microservices/auth-service/src/main/resources/application.yml

# Test endpoint
curl http://localhost:8081/actuator/prometheus
```

---

## Security Considerations

### Securing Grafana

```yaml
# grafana.ini or environment variables
GF_SECURITY_ADMIN_PASSWORD: <strong-password>  # Change default
GF_USERS_ALLOW_SIGN_UP: false                  # Disable self-registration
GF_AUTH_ANONYMOUS_ENABLED: false               # Disable anonymous access
GF_SERVER_ROOT_URL: https://grafana.yourdomain.com  # HTTPS in production
```

### Securing Prometheus

```yaml
# Use basic auth or OAuth proxy in production
# Example: nginx reverse proxy with basic auth
location /prometheus/ {
    auth_basic "Prometheus";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:9090/;
}
```

### Kubernetes Security

```bash
# Use RBAC for Prometheus service account
kubectl create serviceaccount prometheus -n dentalhelp
kubectl create clusterrole prometheus --verb=get,list,watch --resource=pods,nodes,services,endpoints
kubectl create clusterrolebinding prometheus --clusterrole=prometheus --serviceaccount=dentalhelp:prometheus
```

---

## Summary Checklist

- [ ] Prometheus deployed and running (port 9090)
- [ ] Grafana deployed and running (port 3000)
- [ ] All 9 services exposing `/actuator/prometheus` endpoint
- [ ] Prometheus scraping all 9 targets successfully (all UP)
- [ ] Grafana connected to Prometheus data source
- [ ] Imported dashboards: Microservices Overview, JVM Metrics, HTTP Performance
- [ ] Set up alerts for critical metrics
- [ ] Configured baselines and thresholds
- [ ] Tested accessing dashboards via port-forward (Kubernetes) or direct URL (Docker)
- [ ] Screenshots captured for documentation

---

## Screenshots Needed for Documentation

1. @[SCREENSHOT] Prometheus Targets page (all 9 services UP)
2. @[SCREENSHOT] Prometheus query showing metrics
3. @[SCREENSHOT] Grafana data source configuration
4. @[SCREENSHOT] Grafana Microservices Overview dashboard
5. @[SCREENSHOT] Grafana JVM Metrics dashboard
6. @[SCREENSHOT] Grafana HikariCP connection pool dashboard
7. @[SCREENSHOT] Grafana HTTP performance dashboard
8. @[SCREENSHOT] Grafana system resources dashboard
9. @[SCREENSHOT] kubectl top pods showing resource usage
10. @[SCREENSHOT] kubectl get hpa showing auto-scaling status

---

**Related Documentation:**
- @LEARNING_OUTCOME_4_DEVOPS.md - DevOps practices overview
- @LEARNING_OUTCOME_3_SCALABLE_ARCHITECTURES.md - Auto-scaling based on metrics
- @LOAD_TESTING_COMPREHENSIVE.md - Performance baselines
- @AUTO_SCALING_IMPLEMENTATION.md - HPA configuration

**Last Updated:** 2025-12-07
**Version:** 1.0
