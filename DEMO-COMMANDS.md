# Commands to Demonstrate Cloud Deployment

Run these commands on your PC to show your services running on Google Cloud.

---

## 1. Show Kubernetes Cluster Information

```powershell
# Show my cluster details
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://XX.XX.XX.XX
# GLBCDefaultBackend is running at https://XX.XX.XX.XX/...
# KubeDNS is running at https://XX.XX.XX.XX/...
```

```powershell
# Show my nodes (4 servers on Google Cloud)
kubectl get nodes -o wide

# Expected output: 4 nodes with EXTERNAL-IP showing Google Cloud IPs
```

---

## 2. Show All Running Services

```powershell
# Show all my pods running on cloud
kubectl get pods -n dentalhelp

# Expected output:
# NAME                                   READY   STATUS    RESTARTS   AGE
# api-gateway-xxxxx                      1/1     Running   0          Xh
# appointment-service-xxxxx              1/1     Running   0          Xh
# auth-service-xxxxx                     1/1     Running   0          Xh
# patient-service-xxxxx                  1/1     Running   0          Xh
# eureka-server-xxxxx                    1/1     Running   0          Xh
# mysql-auth-0                           1/1     Running   0          Xh
# mysql-patient-0                        1/1     Running   0          Xh
# mysql-appointment-0                    1/1     Running   0          Xh
# redis-xxxxx                            1/1     Running   0          Xh
# rabbitmq-xxxxx                         0/1     Running   0          Xh
```

---

## 3. Show External IP (Proof it's on Cloud)

```powershell
# Show my API Gateway with public IP
kubectl get svc api-gateway -n dentalhelp

# Expected output:
# NAME          TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)
# api-gateway   LoadBalancer   34.118.238.154   34.55.12.229     8080:30620/TCP
#                                               ↑ This is Google Cloud IP!
```

```powershell
# Show all my services
kubectl get svc -n dentalhelp -o wide
```

---

## 4. Show Cloud Resources (CPU/Memory Usage)

```powershell
# Show my node resource usage
kubectl top nodes

# Expected output:
# NAME                                    CPU(cores)   CPU%    MEMORY(bytes)   MEMORY%
# gke-dentalhelp-cluster-default-pool-... 143m         15%     1576Mi          56%
# gke-dentalhelp-cluster-default-pool-... 537m         57%     1151Mi          41%
# gke-dentalhelp-cluster-default-pool-... 94m          10%     1920Mi          68%
# gke-dentalhelp-cluster-default-pool-... 119m         12%     1891Mi          67%
```

```powershell
# Show my pod resource usage
kubectl top pods -n dentalhelp

# Expected output shows CPU and memory for each pod
```

---

## 5. Show Auto-Scaling Configuration

```powershell
# Show my Horizontal Pod Autoscalers
kubectl get hpa -n dentalhelp

# Expected output:
# NAME                      REFERENCE                    TARGETS              MINPODS   MAXPODS   REPLICAS
# api-gateway-hpa           Deployment/api-gateway       cpu: 1%/70%          1         10        1
# auth-service-hpa          Deployment/auth-service      cpu: 6%/70%          1         3         1
# patient-service-hpa       Deployment/patient-service   cpu: 1%/70%          1         3         1
# appointment-service-hpa   Deployment/appointment-...   cpu: <unknown>/70%   1         2         1
```

```powershell
# Describe auto-scaling details for API Gateway
kubectl describe hpa api-gateway-hpa -n dentalhelp
```

---

## 6. Show Persistent Storage (Cloud Disks)

```powershell
# Show my persistent volume claims
kubectl get pvc -n dentalhelp

# Expected output:
# NAME                              STATUS   VOLUME                                     CAPACITY
# mysql-data-mysql-appointment-0    Bound    pvc-xxxxx                                  5Gi
# mysql-data-mysql-auth-0           Bound    pvc-xxxxx                                  5Gi
# mysql-data-mysql-patient-0        Bound    pvc-xxxxx                                  5Gi
# rabbitmq-pvc                      Bound    pvc-xxxxx                                  2Gi
# redis-pvc                         Bound    pvc-xxxxx                                  1Gi
```

```powershell
# Show actual persistent volumes (Google Cloud Disks)
kubectl get pv | findstr dentalhelp
```

---

## 7. Show Service Discovery (Eureka)

```powershell
# Port-forward to Eureka dashboard
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp

# Then open in browser: http://localhost:8761
# Shows all registered services with their IPs
```

---

## 8. Test API from Command Line

```powershell
# Test health endpoint
curl http://34.55.12.229:8080/actuator/health

# Expected output:
# {"status":"UP"}
```

```powershell
# Test login (get JWT token)
curl -X POST http://34.55.12.229:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@denthelp.ro\",\"password\":\"password123\"}'

# Expected output: JSON with token
```

```powershell
# Test clinic endpoint
curl http://34.55.12.229:8080/patient/clinic `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected output: Clinic information JSON
```

---

## 9. Show Live Logs from Cloud

```powershell
# Show API Gateway logs in real-time
kubectl logs -f deployment/api-gateway -n dentalhelp

# Press Ctrl+C to stop
```

```powershell
# Show Auth Service logs
kubectl logs -f deployment/auth-service -n dentalhelp
```

```powershell
# Show last 50 lines from MySQL
kubectl logs mysql-auth-0 -n dentalhelp --tail=50
```

---

## 10. Show Database Contents (Proof Data Exists)

```powershell
# Connect to MySQL and show users
kubectl exec mysql-auth-0 -n dentalhelp -- mysql -uroot -prootpassword123 -e "USE auth_db; SELECT email, user_role FROM patient;"

# Expected output: 4 users (admin, radiologist, 2 patients)
```

```powershell
# Show clinic information
kubectl exec mysql-patient-0 -n dentalhelp -- mysql -uroot -prootpassword123 -e "USE patient_db; SELECT name, address_city FROM clinic_info;"

# Expected output: DentHelp Dental Clinic, Timișoara
```

```powershell
# Count services
kubectl exec mysql-patient-0 -n dentalhelp -- mysql -uroot -prootpassword123 -e "USE patient_db; SELECT COUNT(*) AS total_services FROM clinic_services;"

# Expected output: 10 services
```

---

## 11. Show Secrets (Encrypted in Kubernetes)

```powershell
# List my secrets
kubectl get secrets -n dentalhelp

# Expected output:
# NAME                  TYPE                                  DATA   AGE
# dentalhelp-secrets    Opaque                                4      Xh
# mysql-secrets         Opaque                                1      Xh
```

```powershell
# Show secret structure (values are base64 encoded)
kubectl describe secret dentalhelp-secrets -n dentalhelp
```

---

## 12. Show ConfigMap (Application Configuration)

```powershell
# Show my application config
kubectl get configmap dentalhelp-config -n dentalhelp -o yaml

# Shows Eureka URL, RabbitMQ host, etc.
```

---

## 13. Show Deployment History

```powershell
# Show rollout history for Auth Service
kubectl rollout history deployment/auth-service -n dentalhelp

# Expected output: Shows revision history
```

---

## 14. Show Google Cloud Integration

```powershell
# Show node details (proves it's Google Cloud)
kubectl get nodes -o jsonpath='{.items[*].spec.providerID}'

# Expected output: gce://dentalhelp-demo/us-central1-a/...
```

```powershell
# Show node labels (contains GCE metadata)
kubectl get nodes --show-labels
```

---

## 15. Performance Test (Show Auto-Scaling in Action)

```powershell
# Generate load on API Gateway
# Note: This will trigger auto-scaling if sustained

# Simple load test (run in loop)
for ($i=1; $i -le 100; $i++) {
    curl http://34.55.12.229:8080/actuator/health
    Write-Host "Request $i"
}

# Watch HPA scale up
kubectl get hpa api-gateway-hpa -n dentalhelp --watch
```

---

## 16. Full System Status Report

```powershell
# Comprehensive status check
Write-Host "=== NODES ===" -ForegroundColor Cyan
kubectl get nodes

Write-Host "`n=== PODS ===" -ForegroundColor Cyan
kubectl get pods -n dentalhelp

Write-Host "`n=== SERVICES ===" -ForegroundColor Cyan
kubectl get svc -n dentalhelp

Write-Host "`n=== AUTO-SCALING ===" -ForegroundColor Cyan
kubectl get hpa -n dentalhelp

Write-Host "`n=== STORAGE ===" -ForegroundColor Cyan
kubectl get pvc -n dentalhelp

Write-Host "`n=== RESOURCE USAGE ===" -ForegroundColor Cyan
kubectl top nodes
kubectl top pods -n dentalhelp
```

---

## 17. Proof of High Availability

```powershell
# Delete a pod (Kubernetes will auto-restart it)
kubectl delete pod -n dentalhelp -l app=auth-service

# Watch it recreate automatically
kubectl get pods -n dentalhelp --watch

# Expected: Old pod terminates, new pod starts within 30 seconds
```

---

## 18. Show DNS Resolution (Service Discovery)

```powershell
# Run a temporary pod to test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -n dentalhelp -- sh

# Inside the pod, test DNS:
nslookup auth-service
nslookup mysql-auth
nslookup eureka-server

# Expected: Resolves to internal cluster IPs
# Type 'exit' to leave
```

---

## 19. Access RabbitMQ Management UI

```powershell
# Port-forward to RabbitMQ
kubectl port-forward svc/rabbitmq 15672:15672 -n dentalhelp

# Open browser: http://localhost:15672
# Login: guest / guest
# Shows queues, exchanges, connections
```

---

## 20. Monitor in Real-Time (Dashboard View)

```powershell
# Watch everything update in real-time
kubectl get pods -n dentalhelp --watch

# Or use a separate terminal for each:
# Terminal 1: kubectl get pods -n dentalhelp --watch
# Terminal 2: kubectl get hpa -n dentalhelp --watch
# Terminal 3: kubectl logs -f deployment/api-gateway -n dentalhelp
```

---

## Bonus: Create a Demo Script

Save this as `demo.ps1` and run it to show everything at once:

```powershell
# demo.ps1 - Complete Cloud Deployment Demo

Write-Host "=== MY CLOUD INFRASTRUCTURE ===" -ForegroundColor Green
Write-Host "`nCluster Information:" -ForegroundColor Yellow
kubectl cluster-info | Select-String "Kubernetes"

Write-Host "`nMy 4 Cloud Nodes:" -ForegroundColor Yellow
kubectl get nodes

Write-Host "`n`n=== RUNNING SERVICES ===" -ForegroundColor Green
kubectl get pods -n dentalhelp

Write-Host "`n`n=== PUBLIC API ===" -ForegroundColor Green
kubectl get svc api-gateway -n dentalhelp
Write-Host "`nMy API: http://34.55.12.229:8080" -ForegroundColor Cyan

Write-Host "`n`n=== AUTO-SCALING ===" -ForegroundColor Green
kubectl get hpa -n dentalhelp

Write-Host "`n`n=== RESOURCE USAGE ===" -ForegroundColor Green
kubectl top nodes

Write-Host "`n`n=== TESTING API ===" -ForegroundColor Green
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
curl http://34.55.12.229:8080/actuator/health

Write-Host "`n`n=== DATABASE VERIFICATION ===" -ForegroundColor Green
Write-Host "Checking user accounts..." -ForegroundColor Yellow
kubectl exec mysql-auth-0 -n dentalhelp -- mysql -uroot -prootpassword123 -e "USE auth_db; SELECT COUNT(*) AS total_users FROM patient;"

Write-Host "`nChecking clinic data..." -ForegroundColor Yellow
kubectl exec mysql-patient-0 -n dentalhelp -- mysql -uroot -prootpassword123 -e "USE patient_db; SELECT name FROM clinic_info;"

Write-Host "`n`n=== DEMO COMPLETE ===" -ForegroundColor Green
Write-Host "All services running on Google Cloud!" -ForegroundColor Cyan
```

---

**Run `demo.ps1` to show everything in one command!**
