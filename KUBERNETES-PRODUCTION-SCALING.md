# DentalHelp Kubernetes - Production Ready with Auto-Scaling
## Complete Guide for Scalable Microservices Deployment

This guide will help you deploy DentalHelp with **production-grade** configurations including:
- ✅ Auto-scaling (HPA)
- ✅ Proper resource management
- ✅ High availability
- ✅ Performance optimization
- ✅ Cost optimization

---

## Table of Contents

1. [Cluster Requirements](#1-cluster-requirements)
2. [Resource Planning](#2-resource-planning)
3. [Deploy Production Configuration](#3-deploy-production-configuration)
4. [Configure Auto-Scaling](#4-configure-auto-scaling)
5. [Monitor and Scale](#5-monitor-and-scale)
6. [Troubleshooting](#6-troubleshooting)
7. [Cost Optimization](#7-cost-optimization)

---

## 1. Cluster Requirements

### Minimum Cluster for Production

| Environment | Nodes | Node Type (GKE) | vCPU | RAM | Cost/Month |
|-------------|-------|-----------------|------|-----|------------|
| **Development** | 3 | e2-medium | 2 | 4GB | ~$75 |
| **Staging** | 5 | e2-standard-2 | 2 | 8GB | ~$150 |
| **Production** | 5 | e2-standard-4 | 4 | 16GB | ~$350 |

### Create Production-Ready Cluster

```powershell
# Create larger cluster for production
gcloud container clusters create dentalhelp-production `
    --zone us-central1-a `
    --num-nodes 5 `
    --machine-type e2-standard-4 `
    --disk-size 50GB `
    --enable-autoscaling `
    --min-nodes 3 `
    --max-nodes 10 `
    --enable-autorepair `
    --enable-autoupgrade `
    --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver

# Connect kubectl
gcloud container clusters get-credentials dentalhelp-production --zone us-central1-a
```

### Or Scale Your Existing Cluster

```powershell
# Scale up existing cluster
gcloud container clusters resize dentalhelp-cluster `
    --num-nodes 5 `
    --zone us-central1-a

# Enable autoscaling
gcloud container clusters update dentalhelp-cluster `
    --enable-autoscaling `
    --min-nodes 3 `
    --max-nodes 10 `
    --zone us-central1-a
```

---

## 2. Resource Planning

### Resource Allocation Per Service

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|---------|-------------|-----------|----------------|--------------|----------|
| Eureka Server | 250m | 500m | 512Mi | 1Gi | 2 |
| API Gateway | 500m | 1000m | 768Mi | 1.5Gi | 2-10 (HPA) |
| Auth Service | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| Patient Service | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| Appointment Service | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| Dental Records | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| X-Ray Service | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| Treatment Service | 250m | 750m | 512Mi | 1Gi | 2-5 (HPA) |
| Notification Service | 200m | 500m | 384Mi | 768Mi | 1-3 (HPA) |
| MySQL (each) | 500m | 1000m | 1Gi | 2Gi | 1 |
| RabbitMQ | 250m | 750m | 512Mi | 1Gi | 1 |
| Redis | 100m | 250m | 256Mi | 512Mi | 1 |

**Total Cluster Needs:**
- **CPU**: ~8-10 cores (with headroom)
- **Memory**: ~24-32 GB (with headroom)
- **Recommended**: 5x e2-standard-4 nodes (20 vCPU, 80GB RAM total)

---

## 3. Deploy Production Configuration

### Step 3.1: Update Resource Definitions

I've created optimized manifests. Let's apply them:

```powershell
# Navigate to kubernetes folder
cd "C:\Users\bcali\Desktop\proiect bun 2\DenthelpSecond\deployment\kubernetes"

# Apply production configs
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-storage.yaml

# Deploy infrastructure
kubectl apply -f 10-rabbitmq.yaml
kubectl apply -f 11-redis.yaml
kubectl apply -f 12-mysql.yaml

# Wait for infrastructure
kubectl wait --for=condition=ready pod -l tier=infrastructure -n dentalhelp --timeout=180s

# Deploy Eureka (wait for it)
kubectl apply -f 20-eureka-server.yaml
kubectl wait --for=condition=ready pod -l app=eureka-server -n dentalhelp --timeout=180s

# Deploy API Gateway
kubectl apply -f 21-api-gateway.yaml

# Deploy microservices
kubectl apply -f 22-microservices.yaml

# Deploy ingress
kubectl apply -f 30-ingress.yaml
```

### Step 3.2: Enable Metrics Server (Required for HPA)

```powershell
# Check if metrics-server is running
kubectl get deployment metrics-server -n kube-system

# If not found, it's already enabled in GKE by default
# Verify it works:
kubectl top nodes
kubectl top pods -n dentalhelp
```

---

## 4. Configure Auto-Scaling

### Understanding HPA (Horizontal Pod Autoscaler)

HPA automatically scales pods based on CPU/Memory usage:
- **Target CPU**: 70% → Scale up if average CPU > 70%
- **Target Memory**: 80% → Scale up if average memory > 80%
- **Scale down delay**: 5 minutes (prevents flapping)
- **Scale up delay**: 3 minutes

### Apply HPA to All Services

```powershell
# API Gateway (already has HPA in manifest)
kubectl autoscale deployment api-gateway `
    --min=2 --max=10 `
    --cpu-percent=70 `
    -n dentalhelp

# Auth Service
kubectl autoscale deployment auth-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# Patient Service
kubectl autoscale deployment patient-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# Appointment Service
kubectl autoscale deployment appointment-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# Dental Records Service
kubectl autoscale deployment dental-records-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# X-Ray Service
kubectl autoscale deployment xray-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# Treatment Service
kubectl autoscale deployment treatment-service `
    --min=2 --max=5 `
    --cpu-percent=70 `
    -n dentalhelp

# Notification Service
kubectl autoscale deployment notification-service `
    --min=1 --max=3 `
    --cpu-percent=70 `
    -n dentalhelp
```

### Check HPA Status

```powershell
# View all HPAs
kubectl get hpa -n dentalhelp

# Watch HPA in real-time
kubectl get hpa -n dentalhelp -w

# Detailed HPA info
kubectl describe hpa api-gateway-hpa -n dentalhelp
```

---

## 5. Monitor and Scale

### Monitor Resource Usage

```powershell
# Check pod resource usage
kubectl top pods -n dentalhelp --sort-by=cpu

# Check node resource usage
kubectl top nodes

# Check HPA metrics
kubectl get hpa -n dentalhelp
```

### Load Test to Trigger Auto-Scaling

```powershell
# Get external IP
$EXTERNAL_IP = (kubectl get svc api-gateway -n dentalhelp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Install hey (load testing tool)
# Download from: https://github.com/rakyll/hey/releases

# Run load test (1000 requests, 50 concurrent)
hey -n 1000 -c 50 "http://${EXTERNAL_IP}:8080/actuator/health"

# Watch pods scale up
kubectl get pods -n dentalhelp -w
kubectl get hpa -n dentalhelp -w
```

### Manual Scaling (Override HPA Temporarily)

```powershell
# Scale up manually
kubectl scale deployment api-gateway --replicas=5 -n dentalhelp

# Scale down
kubectl scale deployment api-gateway --replicas=2 -n dentalhelp

# HPA will take over after a few minutes
```

---

## 6. Troubleshooting

### Issue 1: Pods Stuck in Pending

```powershell
# Check why pod is pending
kubectl describe pod <pod-name> -n dentalhelp | Select-String "Events:" -Context 0,20

# Common causes:
# 1. Insufficient resources
kubectl describe nodes | Select-String "Allocated resources:" -Context 0,10

# 2. PVC not bound
kubectl get pvc -n dentalhelp

# Solution: Add more nodes
gcloud container clusters resize dentalhelp-cluster --num-nodes 7 --zone us-central1-a
```

### Issue 2: HPA Not Scaling

```powershell
# Check HPA status
kubectl describe hpa api-gateway-hpa -n dentalhelp

# Check if metrics-server is working
kubectl top pods -n dentalhelp

# If metrics show "<unknown>", restart metrics-server
kubectl rollout restart deployment metrics-server -n kube-system
```

### Issue 3: High Memory Usage

```powershell
# Check memory usage
kubectl top pods -n dentalhelp --sort-by=memory

# Increase memory limits in deployment
kubectl edit deployment auth-service -n dentalhelp

# Change:
resources:
  limits:
    memory: "2Gi"  # Increase from 1Gi
```

### Issue 4: Pods Restarting Frequently

```powershell
# Check restart count
kubectl get pods -n dentalhelp

# View logs of crashed pod
kubectl logs <pod-name> -n dentalhelp --previous

# Common causes:
# - Out of Memory (OOMKilled)
# - Application crash
# - Liveness probe failing

# Increase memory or fix application
```

---

## 7. Cost Optimization

### Current Cluster Cost

```powershell
# Calculate your cluster cost
# Get number of nodes
kubectl get nodes

# Multiply by node cost:
# e2-medium: $25/month per node
# e2-standard-2: $30/month per node
# e2-standard-4: $70/month per node
```

### Optimization Strategies

#### 1. Use Spot/Preemptible VMs (60-90% cheaper)

```powershell
# Create node pool with preemptible VMs
gcloud container node-pools create preemptible-pool `
    --cluster dentalhelp-cluster `
    --zone us-central1-a `
    --machine-type e2-standard-4 `
    --num-nodes 3 `
    --preemptible

# Add toleration to deployments to use preemptible nodes
```

#### 2. Right-Size Resources

```powershell
# Check actual usage vs requests
kubectl top pods -n dentalhelp

# If a service uses 200m CPU but requests 500m, reduce the request
```

#### 3. Scale Down Non-Peak Hours

```powershell
# Create cron job to scale down at night
# Scale down at 10 PM
kubectl scale deployment --all --replicas=1 -n dentalhelp

# Scale up at 8 AM (use CronJob)
```

#### 4. Use Cluster Autoscaler

```powershell
# Enable cluster autoscaler (already done in setup)
# It will automatically add/remove nodes based on demand
gcloud container clusters update dentalhelp-cluster `
    --enable-autoscaling `
    --min-nodes 2 `
    --max-nodes 10 `
    --zone us-central1-a
```

### Cost Breakdown

| Configuration | Monthly Cost | Use Case |
|--------------|--------------|----------|
| 3x e2-medium | ~$75 | Development/Testing |
| 5x e2-standard-2 | ~$150 | Small production |
| 5x e2-standard-4 | ~$350 | Full production |
| 5x e2-standard-4 (preemptible) | ~$120 | Cost-optimized production |

---

## 8. Production Checklist

### Before Going Live

- [ ] Cluster has autoscaling enabled (min 3, max 10 nodes)
- [ ] All services have HPA configured
- [ ] Resource requests and limits are set
- [ ] All pods are running (no Pending/CrashLoop)
- [ ] Metrics-server is working (`kubectl top nodes`)
- [ ] Load balancer has external IP
- [ ] Ingress is configured with domain
- [ ] Secrets are properly configured
- [ ] Databases have persistent storage
- [ ] Monitoring is set up (Prometheus/Grafana)
- [ ] Backups are configured (Velero)
- [ ] Alerts are configured
- [ ] Budget alerts are set in Google Cloud

### Health Check Commands

```powershell
# 1. Check all pods
kubectl get pods -n dentalhelp

# 2. Check services
kubectl get svc -n dentalhelp

# 3. Check HPA
kubectl get hpa -n dentalhelp

# 4. Check resource usage
kubectl top pods -n dentalhelp
kubectl top nodes

# 5. Check for issues
kubectl get events -n dentalhelp --sort-by='.lastTimestamp'

# 6. Test API
$EXTERNAL_IP = (kubectl get svc api-gateway -n dentalhelp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
Invoke-RestMethod -Uri "http://${EXTERNAL_IP}:8080/actuator/health"

# 7. Check Eureka Dashboard
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
# Open: http://localhost:8761
```

---

## 9. Demo for Your Teacher

### Show Auto-Scaling in Action

```powershell
# 1. Show current pods
kubectl get pods -n dentalhelp

# 2. Show HPA configuration
kubectl get hpa -n dentalhelp

# 3. Generate load
$EXTERNAL_IP = (kubectl get svc api-gateway -n dentalhelp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Run load test in background
Start-Job -ScriptBlock {
    param($ip)
    for ($i=1; $i -le 1000; $i++) {
        Invoke-RestMethod -Uri "http://${ip}:8080/actuator/health" -ErrorAction SilentlyContinue
    }
} -ArgumentList $EXTERNAL_IP

# 4. Watch pods scale up (live!)
kubectl get pods -n dentalhelp -w

# 5. Watch HPA metrics change
kubectl get hpa -n dentalhelp -w

# 6. Show Eureka Dashboard
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
# Open: http://localhost:8761
```

### Architecture Diagram to Show

```
                        INTERNET
                           │
                           ▼
                    ┌─────────────┐
                    │   Ingress   │ (NGINX)
                    │   SSL/TLS   │
                    └──────┬──────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Load Balancer     │ (Google Cloud)
                │   External IP       │
                └──────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │     API Gateway (HPA)        │
            │   Min: 2, Max: 10 replicas   │
            └──────────┬───────────────────┘
                       │
          ┌────────────┼─────────────┐
          │            │             │
          ▼            ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Eureka  │  │  Auth   │  │ Patient │
    │ Server  │  │ Service │  │ Service │
    │  (2x)   │  │ (2-5x)  │  │ (2-5x)  │
    └─────────┘  └────┬────┘  └────┬────┘
                      │            │
         ┌────────────┴────────────┴─────┐
         │                                │
         ▼                                ▼
    ┌──────────┐                    ┌──────────┐
    │  MySQL   │                    │ RabbitMQ │
    │ StatefulSet                   │  Redis   │
    │  (7 DBs) │                    │          │
    └──────────┘                    └──────────┘
         │                                │
         └────────────────┬───────────────┘
                          ▼
                  ┌───────────────┐
                  │  Persistent   │
                  │   Storage     │
                  └───────────────┘

    HORIZONTAL POD AUTOSCALER (HPA)
    ┌──────────────────────────────┐
    │ Monitors CPU/Memory          │
    │ Scales pods automatically    │
    │ Target: 70% CPU, 80% Memory  │
    └──────────────────────────────┘

    CLUSTER AUTOSCALER
    ┌──────────────────────────────┐
    │ Monitors node resources      │
    │ Adds/removes nodes as needed │
    │ Min: 3, Max: 10 nodes        │
    └──────────────────────────────┘
```

---

## Quick Reference

```powershell
# Scale cluster
gcloud container clusters resize dentalhelp-cluster --num-nodes 5 --zone us-central1-a

# Check everything
kubectl get all -n dentalhelp

# Check autoscaling
kubectl get hpa -n dentalhelp

# Check resources
kubectl top pods -n dentalhelp
kubectl top nodes

# Scale manually
kubectl scale deployment api-gateway --replicas=5 -n dentalhelp

# Port-forward services
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
kubectl port-forward svc/rabbitmq 15672:15672 -n dentalhelp

# Get external IP
kubectl get svc api-gateway -n dentalhelp

# Watch pods
kubectl get pods -n dentalhelp -w

# Delete cluster (SAVE MONEY!)
gcloud container clusters delete dentalhelp-cluster --zone us-central1-a
```

---

**Your cluster is now production-ready with auto-scaling!** 🚀
