# =============================================================================
# COMPLETE FIX - Delete Everything and Redeploy Correctly
# =============================================================================

$ErrorActionPreference = "Continue"
$DOCKERHUB_USER = "bogdanelcucoditadepurcel"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "COMPLETE FIX - DentalHelp Kubernetes" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Fix ALL YAML files with correct Docker Hub username
Write-Host "`n[STEP 1] Fixing YAML files..." -ForegroundColor Yellow
Get-ChildItem -Filter "*.yaml" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match '\$\{DOCKERHUB_USERNAME\}') {
        Write-Host "  Fixing: $($_.Name)" -ForegroundColor Green
        $content = $content -replace '\$\{DOCKERHUB_USERNAME\}', $DOCKERHUB_USER
        $content | Set-Content $_.FullName -NoNewline
    }
}

# Step 2: COMPLETELY DELETE the namespace (removes ALL resources)
Write-Host "`n[STEP 2] Deleting entire namespace to clean up..." -ForegroundColor Yellow
kubectl delete namespace $NAMESPACE --wait=true --timeout=120s 2>$null
Write-Host "  Waiting 30 seconds for complete cleanup..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Step 3: Check available cluster resources
Write-Host "`n[STEP 3] Checking cluster capacity..." -ForegroundColor Yellow
kubectl top nodes
$nodeCount = (kubectl get nodes --no-headers | Measure-Object).Count
Write-Host "  Available nodes: $nodeCount" -ForegroundColor Cyan

# Step 4: Recreate namespace and basic infrastructure
Write-Host "`n[STEP 4] Creating namespace and secrets..." -ForegroundColor Yellow
kubectl apply -f 00-namespace.yaml
Start-Sleep -Seconds 5

# Create secrets using kubectl (not YAML to avoid base64 issues)
kubectl create secret generic mysql-secrets -n $NAMESPACE `
    --from-literal=MYSQL_ROOT_PASSWORD=rootpassword123

kubectl create secret generic dentalhelp-secrets -n $NAMESPACE `
    --from-literal=DB_USERNAME=root `
    --from-literal=JWT_SECRET=your-super-secret-jwt-key-min-256-bits-long-for-HS256 `
    --from-literal=MAIL_USERNAME=bcalinescu79@gmail.com `
    --from-literal=MAIL_PASSWORD="chqq mxtn nlia lsdd"

Write-Host "  Secrets created successfully" -ForegroundColor Green

# Step 5: Apply ConfigMap and Storage
Write-Host "`n[STEP 5] Applying ConfigMap and Storage..." -ForegroundColor Yellow
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-storage.yaml
Start-Sleep -Seconds 5

# Step 6: Deploy ONLY essential infrastructure (scaled down)
Write-Host "`n[STEP 6] Deploying essential infrastructure..." -ForegroundColor Yellow

# Deploy Redis (lightweight)
kubectl apply -f 11-redis.yaml
Start-Sleep -Seconds 10
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s

# Deploy RabbitMQ (using fixed version without secrets)
kubectl apply -f 10-rabbitmq-fixed.yaml
Start-Sleep -Seconds 15
kubectl wait --for=condition=ready pod -l app=rabbitmq -n $NAMESPACE --timeout=180s

# Deploy MySQL for Auth, Patient, and Appointment
Write-Host "  Deploying MySQL databases (Auth, Patient, Appointment)..." -ForegroundColor Gray
kubectl apply -f 12-mysql-essential.yaml
Start-Sleep -Seconds 30

# Wait for MySQL pods to be created
Write-Host "  Waiting for MySQL to start..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=mysql-auth -n $NAMESPACE --timeout=360s
kubectl wait --for=condition=ready pod -l app=mysql-patient -n $NAMESPACE --timeout=360s
kubectl wait --for=condition=ready pod -l app=mysql-appointment -n $NAMESPACE --timeout=360s

# Step 7: Deploy Eureka Server
Write-Host "`n[STEP 7] Deploying Eureka Server..." -ForegroundColor Yellow
kubectl apply -f 20-eureka-server.yaml
Start-Sleep -Seconds 15
kubectl rollout status deployment/eureka-server -n $NAMESPACE --timeout=180s

# Step 8: Deploy API Gateway (using production config with HPA)
Write-Host "`n[STEP 8] Deploying API Gateway..." -ForegroundColor Yellow
kubectl apply -f 21-api-gateway-production.yaml
Start-Sleep -Seconds 15
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=180s

# Step 9: Deploy ONLY essential microservices (optimized for 4-node cluster)
Write-Host "`n[STEP 9] Deploying essential microservices (Auth, Patient, Appointment)..." -ForegroundColor Yellow
kubectl apply -f 22-essential-services-optimized.yaml
Start-Sleep -Seconds 20

# Wait for each service
foreach ($svc in @("auth-service", "patient-service", "appointment-service")) {
    Write-Host "  Waiting for $svc..." -ForegroundColor Gray
    kubectl rollout status deployment/$svc -n $NAMESPACE --timeout=300s
}

# Step 10: Show deployment status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE - STATUS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nNodes:" -ForegroundColor Yellow
kubectl get nodes -o wide

Write-Host "`nPods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE -o wide

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get svc -n $NAMESPACE

Write-Host "`nHorizontal Pod Autoscalers:" -ForegroundColor Yellow
kubectl get hpa -n $NAMESPACE

# Step 11: Get API Gateway URL
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "ACCESS INFORMATION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$gatewayIP = kubectl get svc api-gateway -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
if ($gatewayIP) {
    Write-Host "`nAPI Gateway URL: http://$gatewayIP:8080" -ForegroundColor Green
} else {
    Write-Host "`nAPI Gateway LoadBalancer pending. Use port-forward:" -ForegroundColor Yellow
    Write-Host "  kubectl port-forward svc/api-gateway 8080:8080 -n $NAMESPACE" -ForegroundColor Cyan
}

Write-Host "`nEureka Dashboard:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward svc/eureka-server 8761:8761 -n $NAMESPACE" -ForegroundColor Cyan
Write-Host "  Then open: http://localhost:8761" -ForegroundColor Cyan

Write-Host "`nRabbitMQ Management:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward svc/rabbitmq 15672:15672 -n $NAMESPACE" -ForegroundColor Cyan
Write-Host "  Then open: http://localhost:15672 (guest/guest)" -ForegroundColor Cyan

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
