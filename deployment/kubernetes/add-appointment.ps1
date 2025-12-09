# =============================================================================
# ADD APPOINTMENT SERVICE - Without restarting existing services
# =============================================================================

$ErrorActionPreference = "Continue"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "ADDING APPOINTMENT SERVICE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Check current status
Write-Host "`n[STEP 1] Current deployment status..." -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

# Step 1.5: Apply database initialization ConfigMap
Write-Host "`n[STEP 1.5] Applying database initialization scripts..." -ForegroundColor Yellow
kubectl apply -f 04-database-init.yaml

# Step 2: Deploy MySQL Appointment
Write-Host "`n[STEP 2] Deploying MySQL Appointment database..." -ForegroundColor Yellow
kubectl apply -f 12-mysql-essential.yaml
Start-Sleep -Seconds 20

Write-Host "  Waiting for MySQL Appointment to be ready..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=mysql-appointment -n $NAMESPACE --timeout=300s

# Step 3: Deploy Appointment Service
Write-Host "`n[STEP 3] Deploying Appointment Service..." -ForegroundColor Yellow
kubectl apply -f 22-essential-services-optimized.yaml
Start-Sleep -Seconds 15

Write-Host "  Waiting for Appointment Service to be ready..." -ForegroundColor Gray
kubectl rollout status deployment/appointment-service -n $NAMESPACE --timeout=300s

# Step 4: Show final status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nAll Pods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host "`nAll Services:" -ForegroundColor Yellow
kubectl get svc -n $NAMESPACE

Write-Host "`nHorizontal Pod Autoscalers:" -ForegroundColor Yellow
kubectl get hpa -n $NAMESPACE

Write-Host "`nNode Resources:" -ForegroundColor Yellow
kubectl top nodes

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "APPOINTMENT SERVICE ADDED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nDeployed Services:" -ForegroundColor Cyan
Write-Host "  ✓ Eureka Server" -ForegroundColor Green
Write-Host "  ✓ API Gateway" -ForegroundColor Green
Write-Host "  ✓ Auth Service" -ForegroundColor Green
Write-Host "  ✓ Patient Service" -ForegroundColor Green
Write-Host "  ✓ Appointment Service (NEW)" -ForegroundColor Green
Write-Host "  ✓ MySQL Databases (3)" -ForegroundColor Green
Write-Host "  ✓ Redis" -ForegroundColor Green
Write-Host "  ✓ RabbitMQ" -ForegroundColor Green

Write-Host "`nAPI Gateway: http://34.55.12.229:8080" -ForegroundColor Cyan
