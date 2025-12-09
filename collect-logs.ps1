# Save all service logs to files
Write-Host "Collecting logs from all services..." -ForegroundColor Green

docker-compose logs eureka-server > logs-eureka.txt 2>&1
docker-compose logs api-gateway > logs-api-gateway.txt 2>&1
docker-compose logs auth-service > logs-auth.txt 2>&1
docker-compose logs patient-service > logs-patient.txt 2>&1
docker-compose logs appointment-service > logs-appointment.txt 2>&1
docker-compose logs notification-service > logs-notification.txt 2>&1
docker-compose logs dental-records-service > logs-dental-records.txt 2>&1
docker-compose logs xray-service > logs-xray.txt 2>&1
docker-compose logs treatment-service > logs-treatment.txt 2>&1
docker-compose logs rabbitmq > logs-rabbitmq.txt 2>&1

Write-Host "`nLogs saved! Check these files:" -ForegroundColor Yellow
Write-Host "  - logs-eureka.txt"
Write-Host "  - logs-api-gateway.txt"
Write-Host "  - logs-auth.txt"
Write-Host "  - logs-patient.txt"
Write-Host "  - logs-appointment.txt"
Write-Host "  - logs-notification.txt"
Write-Host "  - logs-dental-records.txt"
Write-Host "  - logs-xray.txt"
Write-Host "  - logs-treatment.txt"
Write-Host "  - logs-rabbitmq.txt"

Write-Host "`nSearching for ERRORS..." -ForegroundColor Red
Select-String -Path logs-*.txt -Pattern "ERROR|Exception|Failed|refused" | Select-Object -First 50
