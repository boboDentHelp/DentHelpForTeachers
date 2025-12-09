Write-Host "=== DENTAL HELP MICROSERVICES DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n2. Checking for crashed services..." -ForegroundColor Yellow
$crashed = docker-compose ps | Select-String "Exit"
if ($crashed) {
    Write-Host "CRASHED SERVICES FOUND:" -ForegroundColor Red
    Write-Host $crashed
} else {
    Write-Host "No crashed services" -ForegroundColor Green
}

Write-Host "`n3. Checking for recent errors..." -ForegroundColor Yellow
docker-compose logs --tail=50 2>&1 | Select-String "ERROR|Exception|Failed|refused" | Select-Object -First 20

Write-Host "`n4. Checking RabbitMQ..." -ForegroundColor Yellow
docker-compose logs rabbitmq --tail=20

Write-Host "`n5. Checking Eureka..." -ForegroundColor Yellow
docker-compose logs eureka-server --tail=20

Write-Host "`n=== END DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host "`nTo get full logs, run: .\collect-logs.ps1" -ForegroundColor Yellow
