@echo off
cd ..
echo ========================================
echo   DentalHelp k6 Load Testing
echo ========================================
echo.

set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=load

if "%TEST_TYPE%"=="smoke" (
    echo Running SMOKE test...
    set SCRIPT=/scripts/smoke-test.js
) else if "%TEST_TYPE%"=="load" (
    echo Running LOAD test...
    set SCRIPT=/scripts/load-test.js
) else if "%TEST_TYPE%"=="stress" (
    echo Running STRESS test...
    set SCRIPT=/scripts/stress-test.js
) else (
    echo Invalid test type: %TEST_TYPE%
    echo Usage: run-test.bat [smoke^|load^|stress]
    cd k6
    exit /b 1
)

echo.
echo Checking if InfluxDB is running...
docker ps | findstr influxdb >nul
if errorlevel 1 (
    echo ERROR: InfluxDB is not running!
    echo.
    echo Please start monitoring services first:
    echo   docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
    echo.
    pause
    exit /b 1
)

echo InfluxDB is running!
echo.
echo Starting k6 test...
echo.

docker run --rm ^
    --network dentalhelp-2_microservices-network ^
    -v "%cd%\k6\scripts:/scripts" ^
    -v "%cd%\k6\results:/var/k6" ^
    -e K6_OUT=influxdb=http://influxdb:8086/k6 ^
    -e BASE_URL=http://api-gateway:8080 ^
    grafana/k6:latest ^
    run --out influxdb=http://influxdb:8086/k6 %SCRIPT%

echo.
echo ========================================
echo   Test completed!
echo ========================================
echo.
echo View results in Grafana:
echo   http://localhost:3000
echo   Username: admin
echo   Password: admin
echo.
echo Dashboard: k6 Load Testing Dashboard
echo.
cd k6
pause
