@echo off
echo ========================================
echo   Starting Monitoring Stack
echo ========================================
echo.
echo Starting Prometheus, Grafana, InfluxDB...
echo.

docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

echo.
echo ========================================
echo   Monitoring Stack Started!
echo ========================================
echo.
echo Grafana Dashboard: http://localhost:3000
echo   Username: admin
echo   Password: admin
echo.
echo Prometheus: http://localhost:9090
echo.
echo Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo Services are ready! You can now run k6 tests.
echo.
echo To run load test:
echo   cd k6
echo   run-test.bat load
echo.
pause
