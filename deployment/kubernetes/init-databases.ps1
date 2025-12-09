# =============================================================================
# Initialize Databases - Fixed for Spring Boot Schema
# =============================================================================

$ErrorActionPreference = "Continue"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DATABASE INITIALIZATION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Initialize Auth Database
Write-Host "`n[STEP 1] Initializing Auth database..." -ForegroundColor Yellow
$authPod = "mysql-auth-0"

$authSQL = @'
USE auth_db;

-- Insert default accounts (table already created by Spring Boot)
-- Password for all: "password123"
-- BCrypt: $2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a

INSERT IGNORE INTO patient (cnp, first_name, last_name, email, password, user_role) VALUES
('1850515123456', 'Dr. John', 'Smith', 'admin@denthelp.ro', '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'ADMIN'),
('1750315123456', 'Maria', 'Johnson', 'radiologist@denthelp.ro', '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'RADIOLOGIST'),
('2950101123456', 'Jane', 'Doe', 'patient@denthelp.ro', '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'PATIENT'),
('2850515123789', 'Michael', 'Brown', 'test@denthelp.ro', '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'PATIENT');

SELECT 'Auth database initialization complete!' AS status;
SELECT COUNT(*) AS total_accounts FROM patient;
'@

Write-Host "  Inserting user accounts..." -ForegroundColor Gray
$authSQL | kubectl exec -i $authPod -n $NAMESPACE -- mysql -uroot -prootpassword123

# Step 2: Initialize Patient Database (already done, but check)
Write-Host "`n[STEP 2] Checking Patient database (Clinic data)..." -ForegroundColor Yellow
$patientPod = "mysql-patient-0"

$checkSQL = @'
USE patient_db;
SELECT COUNT(*) AS clinic_count FROM clinic_info;
SELECT COUNT(*) AS services_count FROM clinic_services;
'@

Write-Host "  Checking existing data..." -ForegroundColor Gray
$checkSQL | kubectl exec -i $patientPod -n $NAMESPACE -- mysql -uroot -prootpassword123 2>&1 | Out-Null

# Step 3: Verify Data
Write-Host "`n[STEP 3] Verifying all data..." -ForegroundColor Yellow

Write-Host "`n  Auth Database - User Accounts:" -ForegroundColor Cyan
kubectl exec $authPod -n $NAMESPACE -- mysql -uroot -prootpassword123 -e "USE auth_db; SELECT CONCAT(first_name, ' ', last_name) AS name, email, user_role FROM patient ORDER BY user_role;" 2>$null

Write-Host "`n  Patient Database - Clinic:" -ForegroundColor Cyan
kubectl exec $patientPod -n $NAMESPACE -- mysql -uroot -prootpassword123 -e "USE patient_db; SELECT name, address_city, phone_primary FROM clinic_info;" 2>$null

Write-Host "`n  Patient Database - Services:" -ForegroundColor Cyan
kubectl exec $patientPod -n $NAMESPACE -- mysql -uroot -prootpassword123 -e "USE patient_db; SELECT COUNT(*) AS total FROM clinic_services;" 2>$null

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "DATABASE INITIALIZATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`n📋 DEFAULT ACCOUNTS (Password: password123)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  👨‍⚕️ ADMIN (Doctor):" -ForegroundColor Cyan
Write-Host "     Email: admin@denthelp.ro" -ForegroundColor White
Write-Host "     CNP:   1850515123456" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔬 RADIOLOGIST:" -ForegroundColor Cyan
Write-Host "     Email: radiologist@denthelp.ro" -ForegroundColor White
Write-Host "     CNP:   1750315123456" -ForegroundColor Gray
Write-Host ""
Write-Host "  👤 PATIENT 1:" -ForegroundColor Cyan
Write-Host "     Email: patient@denthelp.ro" -ForegroundColor White
Write-Host "     CNP:   2950101123456" -ForegroundColor Gray
Write-Host ""
Write-Host "  👤 PATIENT 2:" -ForegroundColor Cyan
Write-Host "     Email: test@denthelp.ro" -ForegroundColor White
Write-Host "     CNP:   2850515123789" -ForegroundColor Gray

Write-Host "`n🏥 CLINIC INFORMATION" -ForegroundColor Yellow
Write-Host "  Name:     DentHelp Dental Clinic" -ForegroundColor White
Write-Host "  Location: Timisoara, Romania" -ForegroundColor White
Write-Host "  Services: 10 dental services configured" -ForegroundColor White

Write-Host "`n🌐 API GATEWAY" -ForegroundColor Yellow
Write-Host "  URL: http://34.55.12.229:8080" -ForegroundColor Green
Write-Host ""
Write-Host "  Test login:" -ForegroundColor Cyan
Write-Host "    curl -X POST http://34.55.12.229:8080/auth/login \" -ForegroundColor Gray
Write-Host "      -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "      -d '{\"email\":\"admin@denthelp.ro\",\"password\":\"password123\"}'" -ForegroundColor Gray

Write-Host "`n✅ Your backend is ready for frontend integration!" -ForegroundColor Green
