# PowerShell script to generate self-signed SSL certificate for localhost

Write-Host "Generating self-signed SSL certificate for localhost..." -ForegroundColor Green
Write-Host ""

# Check if OpenSSL is available
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host "ERROR: OpenSSL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install OpenSSL:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    Write-Host "2. Install the 'Win64 OpenSSL v3.x.x Light' version" -ForegroundColor Yellow
    Write-Host "3. Add to PATH: C:\Program Files\OpenSSL-Win64\bin" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OR use Git Bash (comes with Git for Windows):" -ForegroundColor Yellow
    Write-Host "  git-bash generate-ssl-cert.sh" -ForegroundColor Yellow
    exit 1
}

# Generate certificate
openssl req -x509 -newkey rsa:2048 `
  -keyout localhost-key.pem `
  -out localhost.pem `
  -days 365 `
  -nodes `
  -subj "/C=RO/ST=Romania/L=Bucharest/O=DentalHelp Dev/CN=localhost"

Write-Host ""
Write-Host "SUCCESS: SSL certificate generated!" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - localhost.pem (certificate)" -ForegroundColor White
Write-Host "  - localhost-key.pem (private key)" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: This is a self-signed certificate." -ForegroundColor Yellow
Write-Host "Your browser will show a security warning - this is normal for development." -ForegroundColor Yellow
Write-Host "Click Advanced and Proceed to localhost to continue." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: Run 'npm run dev' to start HTTPS dev server" -ForegroundColor Cyan
