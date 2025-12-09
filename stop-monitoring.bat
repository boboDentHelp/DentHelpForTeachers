@echo off
echo ========================================
echo   Stopping Monitoring Stack
echo ========================================
echo.

docker compose -f docker-compose.yml -f docker-compose.monitoring.yml down

echo.
echo ========================================
echo   Monitoring Stack Stopped!
echo ========================================
echo.
pause
