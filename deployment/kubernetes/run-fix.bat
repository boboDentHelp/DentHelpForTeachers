@echo off
echo ============================================
echo Running Kubernetes Complete Fix
echo ============================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0complete-fix.ps1"
pause
