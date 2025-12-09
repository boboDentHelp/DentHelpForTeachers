# PowerShell script for running k6 load tests on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("smoke", "load", "stress")]
    [string]$TestType = "load"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DentalHelp k6 Load Testing" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    exit 1
}

$Script = switch ($TestType) {
    "smoke" {
        Write-Host "Running smoke test (minimal load)..." -ForegroundColor Yellow
        "/scripts/smoke-test.js"
    }
    "load" {
        Write-Host "Running load test (normal load)..." -ForegroundColor Yellow
        "/scripts/load-test.js"
    }
    "stress" {
        Write-Host "Running stress test (high load)..." -ForegroundColor Yellow
        "/scripts/stress-test.js"
    }
}

Write-Host ""
Write-Host "Checking if InfluxDB is running..." -ForegroundColor Yellow

$influxRunning = docker ps | Select-String "influxdb"
if (-not $influxRunning) {
    Write-Host "InfluxDB is not running. Please start monitoring services first:" -ForegroundColor Red
    Write-Host "  docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "InfluxDB is running" -ForegroundColor Green
Write-Host ""

# Get current directory
$currentDir = Get-Location

# Run the k6 test
Write-Host "Starting k6 test..." -ForegroundColor Yellow
Write-Host ""

docker run --rm `
    --network dentalhelp-2_microservices-network `
    -v "${currentDir}/k6/scripts:/scripts" `
    -v "${currentDir}/k6/results:/var/k6" `
    -e K6_OUT=influxdb=http://influxdb:8086/k6 `
    -e BASE_URL=http://api-gateway:8080 `
    grafana/k6:latest `
    run --out influxdb=http://influxdb:8086/k6 $Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "View results in Grafana:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000"
Write-Host "  Username: admin"
Write-Host "  Password: admin"
Write-Host ""
Write-Host "Dashboard: k6 Load Testing Dashboard" -ForegroundColor Yellow
Write-Host ""
