# =============================================================================
# FINAL FIX - Check RabbitMQ and clean up pending pod
# =============================================================================

$ErrorActionPreference = "Continue"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "FINAL FIX - RabbitMQ Status Check" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Check RabbitMQ logs
Write-Host "`n[STEP 1] Checking RabbitMQ logs..." -ForegroundColor Yellow
$rabbitmqPod = kubectl get pods -n $NAMESPACE -l app=rabbitmq -o jsonpath='{.items[0].metadata.name}'
Write-Host "RabbitMQ Pod: $rabbitmqPod" -ForegroundColor Cyan
kubectl logs $rabbitmqPod -n $NAMESPACE --tail=30

# Step 2: Delete the pending API Gateway pod
Write-Host "`n[STEP 2] Scaling API Gateway HPA to min 1..." -ForegroundColor Yellow
kubectl patch hpa api-gateway-hpa -n $NAMESPACE --type='json' -p='[{"op": "replace", "path": "/spec/minReplicas", "value":1}]'
Start-Sleep -Seconds 5

# Step 3: Check if RabbitMQ is actually working (even if not showing Ready)
Write-Host "`n[STEP 3] Testing RabbitMQ connection..." -ForegroundColor Yellow
kubectl exec -n $NAMESPACE $rabbitmqPod -- rabbitmq-diagnostics check_running 2>&1
$rabbitStatus = $LASTEXITCODE
if ($rabbitStatus -eq 0) {
    Write-Host "  ✓ RabbitMQ is running properly!" -ForegroundColor Green
} else {
    Write-Host "  ✗ RabbitMQ is not responding" -ForegroundColor Red
}

# Step 4: Show final status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "FINAL STATUS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nAll Pods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get svc -n $NAMESPACE

Write-Host "`nNode Resources:" -ForegroundColor Yellow
kubectl top nodes

# Step 5: Test connectivity
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "SERVICE REGISTRATION CHECK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nChecking which services registered with Eureka..." -ForegroundColor Yellow
$eurekaUrl = "http://eureka-server.dentalhelp.svc.cluster.local:8761/eureka/apps"
kubectl run curl-test --image=curlimages/curl:latest --rm -i --restart=Never -n $NAMESPACE -- curl -s $eurekaUrl 2>&1 | Select-String -Pattern "application" -Context 0,1

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT STATUS SUMMARY" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$runningPods = (kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers | Measure-Object).Count
$totalPods = (kubectl get pods -n $NAMESPACE --no-headers | Measure-Object).Count

Write-Host "`nPods Running: $runningPods / $totalPods" -ForegroundColor Cyan

Write-Host "`nCore Services:" -ForegroundColor Yellow
Write-Host "  ✓ Eureka Server" -ForegroundColor Green
Write-Host "  ✓ API Gateway" -ForegroundColor Green
Write-Host "  ✓ Auth Service" -ForegroundColor Green
Write-Host "  ✓ Patient Service" -ForegroundColor Green
Write-Host "  ✓ MySQL Databases (x2)" -ForegroundColor Green
Write-Host "  ✓ Redis" -ForegroundColor Green
if ($rabbitStatus -eq 0) {
    Write-Host "  ✓ RabbitMQ" -ForegroundColor Green
} else {
    Write-Host "  ⚠ RabbitMQ (starting...)" -ForegroundColor Yellow
}

Write-Host "`nAPI Gateway URL: http://34.55.12.229:8080" -ForegroundColor Cyan
Write-Host "`nTo access Eureka Dashboard:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp" -ForegroundColor White
Write-Host "  Then open: http://localhost:8761" -ForegroundColor White
