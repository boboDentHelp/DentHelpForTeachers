# Custom Grafana Dashboards

## Overview

This directory contains custom Grafana dashboards for monitoring the DentalHelp microservices application.

## Dashboards

### 1. DentalHelp System Overview (`dentalhelp-overview.json`)

**Purpose:** High-level overview of entire system health

**Metrics:**
- Request rate (requests/second) per service
- Response time (p50, p95, p99) per service
- Error rate (%) per service
- JVM memory usage per service
- Service health status
- Database connection pool usage

**Use cases:**
- Quick system health check
- Identifying performance bottlenecks
- Monitoring service availability
- Detecting anomalies

### 2. Service-Specific Dashboard (dentalhelp-service-details.json)

**Purpose:** Detailed metrics for individual microservices

**Metrics:**
- HTTP request metrics (rate, duration, status codes)
- JVM metrics (heap, non-heap, GC)
- Thread pool metrics
- Database metrics (connections, query time)
- API endpoint performance
- Custom business metrics

**Use cases:**
- Deep-diving into service performance
- Troubleshooting specific services
- Capacity planning
- Performance optimization

## Importing Dashboards

### Option 1: Automatic Import (Provisioning)

Dashboards in this directory are automatically loaded when using docker-compose with the monitoring stack:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

The dashboards will be available at: http://localhost:3000

### Option 2: Manual Import

1. Open Grafana: http://localhost:3000
2. Login (admin/admin)
3. Click "+" → "Import"
4. Upload JSON file or paste JSON content
5. Select Prometheus data source
6. Click "Import"

### Option 3: API Import

```bash
# Using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d @dentalhelp-overview.json \
  http://admin:admin@localhost:3000/api/dashboards/db
```

## Key Metrics Explained

### Request Metrics

**Request Rate:**
```promql
sum(rate(http_server_requests_seconds_count[5m])) by (application)
```
Shows requests per second for each service.

**Response Time (p95):**
```promql
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (application, le))
```
95% of requests complete faster than this time.

**Error Rate:**
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application) /
sum(rate(http_server_requests_seconds_count[5m])) by (application) * 100
```
Percentage of 5xx errors.

### JVM Metrics

**Heap Memory Usage:**
```promql
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```
Percentage of heap memory used.

**GC Pause Time:**
```promql
rate(jvm_gc_pause_seconds_sum[5m])
```
Time spent in garbage collection.

### Database Metrics

**Connection Pool Usage:**
```promql
hikaricp_connections_active / hikaricp_connections_max * 100
```
Percentage of database connections in use.

## Creating Custom Dashboards

### 1. Create in Grafana UI

1. Login to Grafana
2. Create new dashboard
3. Add panels with desired metrics
4. Configure visualization
5. Save dashboard
6. Export JSON: Settings → JSON Model → Copy

### 2. Add to Repository

```bash
# Save exported JSON to this directory
cp ~/Downloads/dashboard.json monitoring/grafana/dashboards/my-dashboard.json

# Commit
git add monitoring/grafana/dashboards/my-dashboard.json
git commit -m "Add custom dashboard"
```

## Best Practices

### Dashboard Design

1. **Keep it focused** - One dashboard per concern
2. **Use consistent colors** - Red for errors, green for success
3. **Set appropriate time ranges** - Default to last 1 hour
4. **Add descriptions** - Help others understand metrics
5. **Use variables** - Make dashboards flexible

### Metric Selection

1. **Start with the four golden signals:**
   - Latency (response time)
   - Traffic (request rate)
   - Errors (error rate)
   - Saturation (resource usage)

2. **Add business metrics:**
   - User registrations
   - Appointments created
   - Email notifications sent

3. **Include SLO metrics:**
   - Availability (uptime percentage)
   - Error budget

### Alert Configuration

Add alerts to critical panels:

```json
{
  "alert": {
    "name": "High Error Rate",
    "conditions": [
      {
        "evaluator": {
          "params": [5],
          "type": "gt"
        },
        "query": {
          "params": ["A", "5m", "now"]
        },
        "type": "query"
      }
    ],
    "frequency": "60s",
    "handler": 1,
    "message": "Error rate is above 5%",
    "notifications": []
  }
}
```

## Dashboard Variables

Use variables to make dashboards dynamic:

```json
{
  "templating": {
    "list": [
      {
        "name": "service",
        "type": "query",
        "query": "label_values(up{job=~\".*-service\"}, job)",
        "current": {
          "text": "All",
          "value": "$__all"
        },
        "options": [],
        "includeAll": true
      }
    ]
  }
}
```

Use in queries:
```promql
rate(http_server_requests_seconds_count{job="$service"}[5m])
```

## Useful Queries

### Application Performance

```promql
# Request rate by endpoint
sum(rate(http_server_requests_seconds_count[5m])) by (uri)

# Slowest endpoints (p99)
topk(10, histogram_quantile(0.99,
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
))

# 5xx errors by endpoint
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (uri)
```

### JVM Performance

```promql
# Memory usage trend
jvm_memory_used_bytes{area="heap"}

# GC frequency
rate(jvm_gc_pause_seconds_count[5m])

# Thread count
jvm_threads_live
```

### Database Performance

```promql
# Active connections
hikaricp_connections_active

# Connection wait time
hikaricp_connections_acquire_seconds

# Query execution time
mysql_global_status_slow_queries
```

### System Resources

```promql
# CPU usage
process_cpu_usage

# Disk I/O
node_disk_io_time_seconds_total

# Network traffic
rate(node_network_receive_bytes_total[5m])
```

## Dashboard Maintenance

### Regular Tasks

- **Weekly**: Review dashboards, update as needed
- **Monthly**: Clean up unused dashboards
- **Quarterly**: Optimize queries for performance
- **Yearly**: Redesign based on new requirements

### Version Control

All dashboards are version controlled in Git:

```bash
# Track changes
git log -- monitoring/grafana/dashboards/

# Compare versions
git diff HEAD~1 monitoring/grafana/dashboards/dentalhelp-overview.json

# Restore previous version
git checkout HEAD~1 -- monitoring/grafana/dashboards/dentalhelp-overview.json
```

## Troubleshooting

### Dashboard Not Loading

1. Check Grafana logs:
```bash
docker-compose -f docker-compose.monitoring.yml logs grafana
```

2. Verify Prometheus datasource:
```bash
curl http://localhost:3000/api/datasources
```

3. Test Prometheus query:
```bash
curl http://localhost:9090/api/v1/query?query=up
```

### No Data Showing

1. **Check metric exists:**
```bash
curl 'http://localhost:9090/api/v1/label/__name__/values'
```

2. **Verify time range** - Adjust dashboard time range

3. **Check Prometheus scraping:**
```
http://localhost:9090/targets
```
All targets should be "UP"

4. **Verify service exposes metrics:**
```bash
curl http://localhost:8081/actuator/prometheus
```

### Slow Queries

1. **Reduce time range** - Use smaller intervals
2. **Simplify queries** - Avoid complex aggregations
3. **Use recording rules** - Pre-compute expensive queries
4. **Increase Prometheus memory** - Edit docker-compose.monitoring.yml

## Examples

### Create Alert for High Memory Usage

```json
{
  "alert": {
    "conditions": [
      {
        "evaluator": {
          "params": [90],
          "type": "gt"
        },
        "query": {
          "model": {
            "expr": "jvm_memory_used_bytes{area=\"heap\"} / jvm_memory_max_bytes{area=\"heap\"} * 100"
          }
        }
      }
    ],
    "executionErrorState": "alerting",
    "frequency": "1m",
    "handler": 1,
    "message": "JVM heap memory usage is above 90%",
    "name": "High Memory Usage",
    "noDataState": "no_data"
  }
}
```

### Create Business Metric Panel

```json
{
  "title": "Appointments Created Today",
  "targets": [
    {
      "expr": "sum(increase(appointments_created_total[24h]))"
    }
  ],
  "type": "singlestat",
  "valueName": "current"
}
```

## Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
