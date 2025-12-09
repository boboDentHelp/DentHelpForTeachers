# Kubernetes Deployment Fix Guide

## Problem Summary
Your Kubernetes cluster had duplicate deployments causing pods with both InvalidImageName errors and Pending/CrashLoopBackOff states. This was because:
1. Old deployments with `${DOCKERHUB_USERNAME}` placeholders weren't cleaned up
2. New deployments with actual usernames were created alongside them
3. The 4-node GKE cluster didn't have enough resources for all services

## Solution
The `complete-fix.ps1` script performs a complete cleanup and redeploys ONLY essential services optimized for your 4-node cluster.

## What the Fix Does

### 1. Fixes All YAML Files
- Replaces `${DOCKERHUB_USERNAME}` with `bogdanelcucoditadepurcel` in all YAML files
- Ensures no placeholder remains

### 2. Complete Cleanup
- **Deletes the entire namespace** (removes ALL resources: deployments, pods, services, secrets, etc.)
- Waits 30 seconds for complete cleanup
- This is the only way to ensure no duplicate deployments remain

### 3. Optimized Deployment
Deploys ONLY these services with reduced resources:

**Infrastructure:**
- Redis (cache)
- RabbitMQ (messaging)
- MySQL Auth (database)
- MySQL Patient (database)

**Core Services:**
- Eureka Server (service discovery)
- API Gateway (with HPA: 2-10 replicas)
- Auth Service (with HPA: 1-3 replicas)
- Patient Service (with HPA: 1-3 replicas)

**NOT Deployed (to save resources):**
- ❌ Appointment Service
- ❌ Dental Records Service
- ❌ X-Ray Service
- ❌ Treatment Service
- ❌ Notification Service

## How to Run the Fix

### Step 1: Navigate to Kubernetes Directory
```powershell
cd deployment/kubernetes
```

### Step 2: Run the Fix Script
```powershell
.\complete-fix.ps1
```

### Step 3: Wait for Completion
The script will:
- Fix YAML files (5 seconds)
- Delete namespace (30 seconds)
- Deploy infrastructure (60 seconds)
- Deploy MySQL (90 seconds)
- Deploy Eureka (30 seconds)
- Deploy API Gateway (30 seconds)
- Deploy microservices (60 seconds)

**Total time: ~5-7 minutes**

## Expected Results

### Successful Deployment Shows:
```
Nodes: 4/4 (all Ready)

Pods:
- api-gateway-xxxxxxxxxx        1/1 Running
- auth-service-xxxxxxxxxx       1/1 Running
- patient-service-xxxxxxxxxx    1/1 Running
- eureka-server-xxxxxxxxxx      1/1 Running
- mysql-auth-0                  1/1 Running
- mysql-patient-0               1/1 Running
- rabbitmq-xxxxxxxxxx           1/1 Running
- redis-xxxxxxxxxx              1/1 Running
```

### Accessing Your Services

#### API Gateway (External Access)
```powershell
# Get the LoadBalancer IP
kubectl get svc api-gateway -n dentalhelp

# If IP is available:
# Open: http://<EXTERNAL-IP>:8080

# If pending, use port-forward:
kubectl port-forward svc/api-gateway 8080:8080 -n dentalhelp
# Open: http://localhost:8080
```

#### Eureka Dashboard
```powershell
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
# Open: http://localhost:8761
```

#### RabbitMQ Management
```powershell
kubectl port-forward svc/rabbitmq 15672:15672 -n dentalhelp
# Open: http://localhost:15672
# Login: guest / guest
```

## Resource Allocation (4-Node Cluster)

### Cluster Capacity
- **Nodes:** 4x e2-medium
- **Total CPU:** ~8 vCPU (2 per node)
- **Total RAM:** ~16GB (4GB per node)

### Resource Usage (Optimized)
| Service | Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|----------|-------------|----------------|-----------|--------------|
| API Gateway | 2 | 500m x2 = 1000m | 768Mi x2 = 1.5GB | 1000m x2 = 2000m | 1536Mi x2 = 3GB |
| Auth Service | 1 | 200m | 384Mi | 500m | 768Mi |
| Patient Service | 1 | 200m | 384Mi | 500m | 768Mi |
| Eureka Server | 1 | 250m | 512Mi | 500m | 768Mi |
| MySQL Auth | 1 | 200m | 384Mi | 400m | 768Mi |
| MySQL Patient | 1 | 200m | 384Mi | 400m | 768Mi |
| RabbitMQ | 1 | 250m | 512Mi | 500m | 1Gi |
| Redis | 1 | 100m | 128Mi | 200m | 256Mi |
| **TOTAL** | **9 pods** | **~2.9 vCPU** | **~4.8GB** | **~6 vCPU** | **~9.3GB** |

**Cluster Utilization:**
- CPU Requests: ~36% (2.9/8)
- Memory Requests: ~30% (4.8/16)
- Leaves room for HPA to scale up when needed

## Troubleshooting

### If Pods Stay in Pending
```powershell
# Check node resources
kubectl top nodes

# Check pod details
kubectl describe pod <pod-name> -n dentalhelp

# Look for: "Insufficient cpu" or "Insufficient memory"
```

**Solution:** Scale down replicas further or use larger nodes

### If MySQL Takes Too Long
```powershell
# Check MySQL logs
kubectl logs mysql-auth-0 -n dentalhelp
kubectl logs mysql-patient-0 -n dentalhelp

# MySQL can take 2-3 minutes to fully initialize
```

### If Auth Service is CrashLoopBackOff
```powershell
# Check logs
kubectl logs auth-service-<pod-id> -n dentalhelp

# Common causes:
# 1. MySQL not ready yet - wait 1-2 minutes
# 2. Database connection error - check secrets
# 3. Missing environment variables - check ConfigMap
```

### If API Gateway Can't Find Services
```powershell
# Check Eureka Dashboard
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
# Open: http://localhost:8761

# All services should register within 1-2 minutes
```

## Scaling Up (When You Need More Services)

### To Add Appointment Service:
1. Ensure cluster has capacity (check `kubectl top nodes`)
2. Deploy appointment MySQL:
```powershell
# Add to 12-mysql-essential.yaml or apply full 12-mysql.yaml
kubectl apply -f <mysql-file>
```
3. Deploy appointment service from production file
4. Update HPA if needed

### To Scale Existing Services:
```powershell
# Scale manually
kubectl scale deployment auth-service --replicas=2 -n dentalhelp

# Or let HPA handle it automatically based on CPU/Memory
```

## Clean Up Everything (Start Fresh)
```powershell
# Delete namespace (removes everything)
kubectl delete namespace dentalhelp

# Delete persistent volumes
kubectl get pv | grep dentalhelp
kubectl delete pv <pv-name>
```

## Next Steps After Successful Deployment

1. ✅ Verify all pods are Running
2. ✅ Check Eureka Dashboard - all services registered
3. ✅ Test API Gateway endpoints
4. ✅ Monitor resource usage: `kubectl top nodes`
5. ✅ Set up monitoring (optional): Prometheus + Grafana
6. ✅ Configure Ingress for custom domain (optional)

## Cost Optimization

**Current Setup:**
- 4x e2-medium nodes = ~$100/month (standard pricing)
- With Google Cloud $300 free credits = **FREE for 3 months**

**To Reduce Costs Further:**
1. Use preemptible nodes (80% cheaper, but can be interrupted)
2. Scale down to 3 nodes if utilization allows
3. Use smaller node types (e2-small) with fewer services
4. Stop cluster when not in use:
```powershell
gcloud container clusters resize dentalhelp-cluster --num-nodes=0 --zone=us-central1-a
# Restart: --num-nodes=4
```

## Summary

This fix completely removes the duplicate deployment issue by:
1. **Deleting everything** (namespace deletion)
2. **Redeploying with correct image names** (no placeholders)
3. **Using optimized resources** (fits in 4-node cluster)
4. **Enabling auto-scaling** (HPA for API Gateway and services)

The result is a clean, working Kubernetes deployment optimized for your cluster size.
