# HOW TO COLLECT AND SHARE LOGS

## METHOD 1: Use the PowerShell script (EASIEST)

```powershell
.\collect-logs.ps1
```

This will create 10 text files with all logs.

---

## METHOD 2: Manual collection

### Get ALL logs at once:
```powershell
docker-compose logs > all-logs.txt 2>&1
```

### Get specific service logs:
```powershell
docker-compose logs eureka-server > logs-eureka.txt
docker-compose logs api-gateway > logs-api-gateway.txt
docker-compose logs auth-service > logs-auth.txt
docker-compose logs patient-service > logs-patient.txt
docker-compose logs appointment-service > logs-appointment.txt
docker-compose logs notification-service > logs-notification.txt
docker-compose logs dental-records-service > logs-dental-records.txt
docker-compose logs xray-service > logs-xray.txt
docker-compose logs treatment-service > logs-treatment.txt
docker-compose logs rabbitmq > logs-rabbitmq.txt
```

---

## METHOD 3: Check service status

```powershell
docker-compose ps
```

This shows which services are running/stopped/crashed.

---

## METHOD 4: Follow logs in real-time

```powershell
# Watch all services
docker-compose logs -f

# Watch specific service
docker-compose logs -f auth-service
```

Press Ctrl+C to stop.

---

## HOW TO SHARE LOGS WITH ME:

### Option A: Copy and paste into chat
Open any log file (e.g., `logs-auth.txt`) and paste the contents

### Option B: Show me specific errors
Search for "ERROR" in the files and paste those lines

### Option C: Check which services failed
```powershell
docker-compose ps | findstr "Exit"
```

---

## QUICK ERROR CHECK:

```powershell
# Find all ERROR lines
Select-String -Path logs-*.txt -Pattern "ERROR" | Select-Object -First 20

# Find all Exception lines
Select-String -Path logs-*.txt -Pattern "Exception" | Select-Object -First 20

# Find connection issues
Select-String -Path logs-*.txt -Pattern "refused|timeout" | Select-Object -First 20
```

---

## WHAT TO LOOK FOR:

❌ **Connection refused** - Service can't connect to another service
❌ **Exception** - Something crashed
❌ **Failed to** - Operation didn't complete
❌ **Exit 1** - Service crashed
❌ **Unhealthy** - Health check failing

✅ **Started** - Service started successfully
✅ **Ready** - Service is ready to accept requests

