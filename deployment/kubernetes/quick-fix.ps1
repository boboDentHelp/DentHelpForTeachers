# =============================================================================
# QUICK FIX - Fix RabbitMQ and scale down to free resources
# =============================================================================

$ErrorActionPreference = "Continue"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "QUICK FIX - RabbitMQ and Resources" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Delete broken RabbitMQ pod
Write-Host "`n[STEP 1] Deleting broken RabbitMQ..." -ForegroundColor Yellow
kubectl delete deployment rabbitmq -n $NAMESPACE
Start-Sleep -Seconds 10

# Step 2: Deploy fixed RabbitMQ (no secrets required)
Write-Host "`n[STEP 2] Deploying fixed RabbitMQ..." -ForegroundColor Yellow
kubectl apply -f 10-rabbitmq-fixed.yaml
Start-Sleep -Seconds 20

# Step 3: Scale down API Gateway to free resources
Write-Host "`n[STEP 3] Scaling down API Gateway to 1 replica..." -ForegroundColor Yellow
kubectl scale deployment api-gateway --replicas=1 -n $NAMESPACE
Start-Sleep -Seconds 10

# Step 4: Wait for RabbitMQ to be ready
Write-Host "`n[STEP 4] Waiting for RabbitMQ to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=rabbitmq -n $NAMESPACE --timeout=180s

# Step 5: Check status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "STATUS AFTER FIX" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nPods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host "`nNode Resources:" -ForegroundColor Yellow
kubectl top nodes

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "QUICK FIX COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Wait 1-2 minutes for patient-service pod to start" -ForegroundColor White
Write-Host "2. Check: kubectl get pods -n dentalhelp" -ForegroundColor White
Write-Host "3. If still pending, check: kubectl describe pod patient-service-<id> -n dentalhelp" -ForegroundColor White
