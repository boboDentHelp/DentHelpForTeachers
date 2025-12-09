# Security Gap Analysis & Implementation Roadmap
## DentalHelp Healthcare Platform

**Created:** November 29, 2025
**Author:** Bogdan Calinescu
**Current Environment:** GKE 4-node cluster (us-central1-a)

---

## Current Status Overview

### What I Actually Have ✅
- JWT authentication with HS256
- BCrypt password hashing
- RBAC (ADMIN, RADIOLOGIST, PATIENT roles)
- API Gateway as single entry point
- Microservices running on GKE (4 nodes, e2-medium)
- Auto-scaling configured (HPA 1-10 replicas)
- MySQL databases with persistent storage
- Prometheus + Grafana monitoring stack (created, ready to deploy)

### What I DON'T Have ❌
- **NO HTTPS** - All traffic is HTTP (CRITICAL)
- **NO BACKUPS** - No automated database backups (CRITICAL)
- **NO HTTPS** monitoring deployed yet - Created but not running (HIGH)
- **NO CENTRALIZED LOGGING** - Only kubectl logs (HIGH)
- **NO DATABASE ENCRYPTION** at rest (MEDIUM)
- **NO MFA** for admin accounts (MEDIUM)
- **NO RATE LIMITING** (MEDIUM)
- **NO DISASTER RECOVERY PLAN** (HIGH)
- Data in US region (us-central1-a) - should be EU for GDPR (MEDIUM)

---

## CRITICAL Priority Fixes (Do These First!)

## 🔴 FIX #1: Implement HTTPS on LoadBalancer

### Why This is CRITICAL
**Current Risk:** ALL traffic is HTTP. This means:
- JWT tokens sent in clear text (anyone sniffing network sees them)
- Passwords visible during login (even though hashed in DB, clear during transmission)
- Medical data (CNP, diagnoses, x-rays) transmitted without encryption
- Man-in-the-middle attacks possible
- **GDPR violation** - Article 32 requires encryption in transit

**Current Score:** Confidentiality 6/10 → With HTTPS: 7-8/10

### Implementation Options

#### Option A: NGINX Ingress + Let's Encrypt (FREE) ⭐ RECOMMENDED

**Why I recommend this:**
- Completely FREE
- Automatic certificate renewal
- Ready in 2-5 minutes (vs 15-60 min for Google-managed)
- Works without domain name (can use nip.io for testing)
- You already have NGINX ingress files in `deployment/kubernetes/monitoring/07-ingress-nginx-https.yaml`

**Pros:**
✅ FREE (student budget friendly)
✅ Fast setup (minutes, not hours)
✅ Auto-renewal (set and forget)
✅ Can use with IP address initially (nip.io)
✅ Full control over configuration

**Cons:**
❌ Slightly more complex than Google-managed
❌ Need domain name eventually (but can start with nip.io)
❌ One more component to manage (cert-manager)

**Cost:** $0/month

**Time Estimate:** 1-2 hours

**Implementation Steps:**

```powershell
# Step 1: Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Step 2: Wait for LoadBalancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller --watch

# Step 3: Get the LoadBalancer IP
$LB_IP = kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
echo "LoadBalancer IP: $LB_IP"

# Step 4: Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Step 5: Wait for cert-manager to be ready
kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager
kubectl wait --for=condition=available --timeout=300s deployment/cert-manager-webhook -n cert-manager

# Step 6: Update ingress file with your domain or use nip.io
# Example: If LB_IP is 34.55.12.229, use: dentalhelp.34.55.12.229.nip.io

# Step 7: Deploy HTTPS ingress
kubectl apply -f deployment/kubernetes/https-ingress-dentalhelp.yaml

# Step 8: Wait for certificate (2-5 minutes)
kubectl get certificate -n dentalhelp --watch

# Step 9: Test HTTPS
curl -k https://dentalhelp.$LB_IP.nip.io/actuator/health
```

**Files to Create/Modify:**
1. Create: `deployment/kubernetes/https-ingress-dentalhelp.yaml` (I'll create this for you)
2. Modify: `deployment/kubernetes/21-api-gateway-production.yaml` (change service type)

**What Changes:**
- LoadBalancer service → ClusterIP service (NGINX handles external traffic)
- Ingress routes traffic to services
- cert-manager automatically provisions SSL certificate
- Traffic auto-redirects HTTP → HTTPS

#### Option B: Google-Managed SSL Certificate

**Why you might NOT want this:**
- Costs ~$20/month
- Takes 15-60 minutes to provision
- **REQUIRES** a real domain name (can't use IP)
- Must pay for domain ($10-15/year)

**Cost:** ~$20/month + domain cost = ~$25-30/month

**When to use:** Production with real domain and budget

**I don't recommend this for you because:**
- You're on student budget
- You don't have domain yet
- Let's Encrypt is just as good and FREE

---

## 🔴 FIX #2: Automated Database Backups

### Why This is CRITICAL
**Current Risk:**
- NO backups = If database corrupts, ALL DATA LOST
- Healthcare data = 7-year retention requirement in Romania
- Patient records, medical history, x-rays all gone
- Legal liability for data loss
- No way to recover from ransomware

**Current Score:** Availability 6/10 → With backups: 8/10

### Implementation: Kubernetes CronJob with mysqldump (FREE)

**Priority:** CRITICAL
**Complexity:** Easy
**Time:** 1-2 hours
**Cost:** FREE (uses existing storage)

**How it works:**
1. CronJob runs daily at 2 AM
2. Creates mysqldump of all databases
3. Compresses backup files
4. Stores in persistent volume
5. Keeps last 7 days, deletes older
6. Optional: Upload to Google Cloud Storage (paid)

**Implementation:**

```yaml
# Create: deployment/kubernetes/backup-cronjob.yaml

apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: dentalhelp
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mysql-backup
            image: mysql:8.0
            command:
            - /bin/sh
            - -c
            - |
              # Backup all databases
              for db in auth_db patient_db appointment_db; do
                mysqldump -h mysql -u root -p$MYSQL_ROOT_PASSWORD $db > /backup/$db-$(date +%Y%m%d).sql
                gzip /backup/$db-$(date +%Y%m%d).sql
              done

              # Delete backups older than 7 days
              find /backup -name "*.sql.gz" -mtime +7 -delete

              echo "Backup completed: $(date)"
            env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: root-password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

**Enhanced Version with Cloud Storage (Optional - $1-2/month):**

Add Google Cloud Storage upload for off-site backups:
```bash
# Upload to GCS after backup
gsutil cp /backup/*.sql.gz gs://dentalhelp-backups/$(date +%Y%m%d)/
```

**Cost:**
- Basic (local PVC): FREE
- With Cloud Storage: ~$1-2/month for 50GB

**Files to Create:**
1. `deployment/kubernetes/backup-cronjob.yaml`
2. `deployment/kubernetes/backup-pvc.yaml` (10GB storage)

---

## 🟠 HIGH Priority Fixes

## 🟠 FIX #3: Deploy Monitoring Stack (Prometheus + Grafana)

### Why This is HIGH Priority
**Current Risk:**
- Can't detect security breaches
- No visibility into performance issues
- Don't know if services are down until user reports
- Can't track unusual access patterns
- No alerts for database connection issues

**Current Score:** Overall 6.5/10 → With monitoring: 7.5/10

**GOOD NEWS: I ALREADY CREATED THIS FOR YOU!**

The monitoring stack is ready in `deployment/kubernetes/monitoring/`:
- Prometheus for metrics collection
- Grafana for dashboards
- kube-state-metrics for cluster monitoring
- Real dashboards from your docker-compose setup
- HTTPS support included

### Implementation: Deploy Existing Stack

**Priority:** HIGH
**Complexity:** Easy (already done!)
**Time:** 30 minutes
**Cost:** ~$2/month (15GB storage)

**Steps:**
```powershell
cd deployment/kubernetes/monitoring

# Deploy everything
./deploy-monitoring.sh

# Or manual:
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-prometheus-config.yaml
kubectl apply -f 02-grafana-config.yaml
kubectl apply -f 03-prometheus-rbac.yaml
kubectl apply -f 04-prometheus-deployment.yaml
kubectl apply -f 05-grafana-deployment.yaml
kubectl apply -f 08-kube-state-metrics.yaml

# Wait for pods
kubectl get pods -n monitoring --watch

# Access Grafana (temporary)
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Visit: http://localhost:3000
# Login: admin / admin123!
```

**After HTTPS is working, you can expose Grafana securely:**
```powershell
kubectl apply -f 07-ingress-nginx-https.yaml
# Access: https://grafana.your-domain.com
```

**What You Get:**
- ✅ Service health monitoring
- ✅ CPU/Memory/Network metrics
- ✅ Request rates and response times
- ✅ Error rate tracking
- ✅ Database connection pool status
- ✅ Alerts for critical issues
- ✅ Dashboards for all microservices

---

## 🟠 FIX #4: Centralized Logging

### Why This is HIGH Priority
**Current Risk:**
- Logs scattered across 20+ pods
- Can't correlate events across services
- Logs lost when pod restarts
- Hard to debug distributed issues
- Can't track security events
- GDPR audit trail incomplete

### Implementation Options

#### Option A: Google Cloud Logging (EASIEST)

**Priority:** HIGH
**Complexity:** Easy
**Time:** 30 minutes
**Cost:** ~$5-10/month

**How:**
GKE automatically sends logs to Cloud Logging. Just enable it:

```powershell
# Enable Cloud Logging
gcloud container clusters update dentalhelp-cluster \
  --enable-cloud-logging \
  --logging=SYSTEM,WORKLOAD

# View logs in Google Cloud Console
# Or use gcloud:
gcloud logging read "resource.type=k8s_container" --limit 50
```

**Pros:**
✅ Automatic (GKE does it)
✅ Easy to search and filter
✅ Integrated with GKE
✅ No maintenance

**Cons:**
❌ Costs money (~$5-10/month)
❌ Data leaves your cluster
❌ Vendor lock-in

#### Option B: Self-Hosted ELK/Loki (FREE but Complex)

**Priority:** MEDIUM
**Complexity:** Hard
**Time:** 4-6 hours
**Cost:** FREE (uses cluster resources)

**Recommendation:**
Skip this for now. Use Google Cloud Logging ($5-10/month is worth the simplicity).
Implement later if budget becomes issue.

---

## 🟡 MEDIUM Priority Fixes

## 🟡 FIX #5: Database Encryption at Rest

### Why This is MEDIUM (not HIGH)
**Reality Check:**
- Your data is already on Google's encrypted disks
- GKE persistent volumes are encrypted by default
- Main risk: Someone steals backup files

**Should you do additional encryption?**
- For learning: YES (good to understand)
- For real healthcare app: YES (compliance)
- For student project: OPTIONAL (already partially protected)

### Implementation: Field-Level Encryption

**Priority:** MEDIUM
**Complexity:** Medium-Hard
**Time:** 6-8 hours
**Cost:** FREE

**What to encrypt:**
- Patient CNP (most sensitive)
- Medical diagnosis text
- Doctor notes
- (Don't encrypt: patient name, dates - needed for queries)

**How:**
Use Spring Boot JPA `@Convert` annotation:

```java
@Entity
public class Patient {
    @Convert(converter = CNPEncryptionConverter.class)
    @Column(name = "cnp")
    private String cnp;
}

// Encryption converter
public class CNPEncryptionConverter implements AttributeConverter<String, String> {
    private final AESEncryption encryption = new AESEncryption();

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryption.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryption.decrypt(dbData);
    }
}
```

**My Recommendation:**
Do this LATER. You have bigger fish to fry (HTTPS, backups, monitoring).
Put it in Phase 2 (1-3 months from now).

---

## 🟡 FIX #6: Rate Limiting

### Why This is MEDIUM
**Current Risk:**
- API can be abused (spam requests)
- DDoS vulnerability
- Single user can overwhelm system
- Costs spike if attacked

**Current State:** No rate limiting

### Implementation: NGINX Ingress Rate Limiting

**Priority:** MEDIUM
**Complexity:** Easy
**Time:** 1 hour
**Cost:** FREE

**How:**
Add to your NGINX Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dentalhelp-ingress
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "10"  # 10 requests/sec per IP
    nginx.ingress.kubernetes.io/limit-connections: "20"  # Max 20 concurrent
```

**Recommendation:**
Implement this AFTER HTTPS is working. Easy win for security.

---

## 🟡 FIX #7: Move to EU Region (GDPR)

### Why This is MEDIUM (not HIGH)
**Current:** Data in us-central1-a (USA)
**GDPR Requirement:** Data should be in EU

**Reality Check:**
- For student project: US region is OK
- For real production: MUST be in EU
- Migration: 2-4 hours of work

### Implementation: Migrate to europe-west1

**Priority:** MEDIUM (defer to production)
**Complexity:** Medium
**Time:** 2-4 hours
**Cost:** Same ($0 for compute, small data egress fee one-time)

**How:**
1. Create new GKE cluster in europe-west1
2. Export databases from old cluster
3. Import to new cluster
4. Update DNS to new IP
5. Delete old cluster

**My Recommendation:**
Skip this for now. Focus on HTTPS and backups first.
For production deployment, create new cluster in EU region from scratch.

---

## 🟢 LOW Priority Fixes (Nice to Have)

## 🟢 FIX #8: Multi-Factor Authentication (MFA)

**Priority:** LOW
**Why:** Not critical for student project, important for production
**Time:** 4-6 hours
**Cost:** FREE (use Google Authenticator)

**Implementation:** Add TOTP (Time-based One-Time Password) to login

## 🟢 FIX #9: Disaster Recovery Plan

**Priority:** LOW
**Why:** With backups, you have 80% of DR covered
**Time:** 2-3 hours (documentation)
**Cost:** FREE

---

## Implementation Roadmap

### ⚡ Phase 1: Critical Security (This Session - 3-4 hours)

**DO THESE NOW:**

1. **Implement HTTPS** (1-2 hours)
   - Install NGINX Ingress
   - Install cert-manager
   - Deploy HTTPS ingress
   - Test with nip.io domain
   - **Result:** All traffic encrypted

2. **Deploy Monitoring** (30 minutes)
   - Already created, just deploy
   - Access Grafana
   - Verify metrics collection
   - **Result:** Visibility into system

3. **Set Up Automated Backups** (1 hour)
   - Create backup CronJob
   - Test manual backup
   - Verify backup files
   - **Result:** Data protected

**Expected Outcome:**
- CIA Score: 6.5/10 → 7.5/10
- OWASP Score: 65/100 → 75/100
- Sleep better knowing data is encrypted and backed up

---

### 🎯 Phase 2: High Priority Security (Next 1-2 weeks)

**DO THESE NEXT:**

1. **Centralized Logging** (30 min)
   - Enable Google Cloud Logging
   - Set up log queries
   - **Cost:** ~$5-10/month

2. **Rate Limiting** (1 hour)
   - Add to NGINX Ingress
   - Test with load testing
   - **Cost:** FREE

3. **Get Real Domain** (1 hour)
   - Buy domain ($10-15/year)
   - Update DNS
   - Re-issue SSL cert for real domain
   - **Cost:** $10-15/year

**Expected Outcome:**
- CIA Score: 7.5/10 → 8/10
- OWASP Score: 75/100 → 82/100
- Production-ready security baseline

---

### 📅 Phase 3: Medium Priority (1-3 months)

**DO THESE LATER:**

1. **Database Field Encryption** (6-8 hours)
2. **Move to EU Region** (2-4 hours)
3. **Enhanced Backup Strategy** (2 hours)
   - Off-site backups to Cloud Storage
   - Test restore procedures
4. **Security Audit** (4 hours)
   - Penetration testing
   - Vulnerability scanning

---

## Effort vs Impact Matrix

```
HIGH IMPACT, LOW EFFORT (DO FIRST):
┌─────────────────────────────┐
│ ⭐ HTTPS (Let's Encrypt)    │  ← 1-2 hours, HUGE security win
│ ⭐ Deploy Monitoring        │  ← 30 min, already done
│ ⭐ Automated Backups        │  ← 1 hour, critical protection
│ ⭐ Rate Limiting            │  ← 1 hour, easy DDoS protection
└─────────────────────────────┘

HIGH IMPACT, HIGH EFFORT (DO LATER):
┌─────────────────────────────┐
│ Database Encryption         │  ← 6-8 hours
│ Move to EU Region           │  ← 2-4 hours
│ MFA Implementation          │  ← 4-6 hours
└─────────────────────────────┘

LOW IMPACT, LOW EFFORT (NICE TO HAVE):
┌─────────────────────────────┐
│ Disaster Recovery Docs      │  ← 2 hours
│ Security Policies           │  ← 2 hours
└─────────────────────────────┘
```

---

## Specific Answers to Your Questions

### Q1: Google-managed cert or Let's Encrypt?

**Answer: Let's Encrypt (NGINX + cert-manager)**

**Why:**
- You don't have a domain yet
- Student budget (FREE vs $20/month)
- Faster setup (2-5 min vs 15-60 min)
- Can use nip.io for testing without domain
- Just as secure as Google-managed
- Industry standard (most companies use Let's Encrypt)

**You can always switch to Google-managed later if you want.**

---

### Q2: Will Prometheus/Grafana fit on my 4-node cluster?

**Answer: YES, but will be tight**

**Current Usage:** ~75% capacity
**Monitoring Resources:**
- Prometheus: 500m CPU, 1Gi RAM (requests)
- Grafana: 250m CPU, 512Mi RAM (requests)
- kube-state-metrics: 100m CPU, 128Mi RAM (requests)
- **Total: ~850m CPU, ~1.6Gi RAM**

**Your Cluster:**
- 4 x e2-medium = 4 x 2 vCPU = 8 vCPU total
- 4 x 4GB RAM = 16GB total
- At 75% usage: ~2 vCPU, ~4GB free

**Recommendation:**
✅ **Self-host Prometheus/Grafana** - You have room
✅ Monitor resource usage after deployment
✅ If too tight, switch to Google Cloud Monitoring ($30/month)

**Alternative:**
Use lightweight monitoring first, upgrade later if needed.

---

### Q3: Database Encryption - Now or Wait?

**Answer: WAIT**

**Reasons:**
1. GKE volumes already encrypted by default (Google's encryption)
2. You have bigger priorities (HTTPS, backups)
3. 6-8 hours of work for marginal gain
4. Still learning - better to nail basics first

**Do this in Phase 3** (1-3 months from now) when you have:
- HTTPS working ✓
- Backups automated ✓
- Monitoring running ✓
- Rate limiting ✓

**Then** add field-level encryption for extra security.

---

### Q4: Move to EU Region - How Hard?

**Answer: Not hard, but not urgent**

**Migration Steps:**
1. Create new cluster in europe-west1 (30 min)
2. Deploy all services to new cluster (1 hour)
3. Export databases from US cluster (30 min)
4. Import to EU cluster (30 min)
5. Test everything (30 min)
6. Update DNS (5 min)
7. Delete old cluster (5 min)

**Total Time:** 2-4 hours

**My Recommendation:**
- For student project: Stay in US (easier, works fine)
- For production: Create new cluster in EU from day 1
- Don't migrate now - do it when you go to production

**GDPR Reality:**
- For portfolio/demo: US is OK
- For real patients: MUST be EU
- Google's US datacenters are still GDPR-compliant (with proper DPA)

---

### Q5: Simplest Backup Solution?

**Answer: Kubernetes CronJob with mysqldump**

**Why:**
- Completely FREE
- Easy to understand (just bash script)
- Works out of the box
- Stores locally (no cloud costs)
- Can extend to Cloud Storage later ($1-2/month)

**Better than:**
- ❌ Cloud SQL Backups: Costs $$$, you're not using Cloud SQL
- ❌ Velero: Overkill for your use case, complex setup
- ❌ Manual backups: You'll forget, guaranteed

**Steps:**
1. Create CronJob YAML (I'll provide)
2. Apply to cluster
3. It runs daily at 2 AM
4. Keeps 7 days of backups
5. Deletes old backups automatically

**Done. Set and forget.**

---

## Cost Summary

| Item | Option | Monthly Cost |
|------|--------|--------------|
| **HTTPS** | Let's Encrypt | **$0** |
| | Google-managed | $20 |
| **Backups** | Local PVC | **$0** |
| | + Cloud Storage | $1-2 |
| **Monitoring** | Self-hosted | **$2** (storage) |
| | Google Cloud Monitoring | $30 |
| **Logging** | Google Cloud Logging | **$5-10** |
| | Self-hosted ELK | $0 (but complex) |
| **Domain** | Optional | $1/month ($10-15/year) |

**Recommended Setup Cost: $7-12/month**
- HTTPS: $0 (Let's Encrypt)
- Backups: $1-2 (with Cloud Storage)
- Monitoring: $2 (self-hosted)
- Logging: $5-10 (Google Cloud Logging)

**Total: Student-budget friendly!**

---

## Next Actions (What to Do Now)

### 1. Implement HTTPS (Start Here!)

I'll create the HTTPS configuration files for you. Then:
```powershell
# Install NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy HTTPS
kubectl apply -f deployment/kubernetes/https-ingress-dentalhelp.yaml

# Test
curl https://dentalhelp.<your-lb-ip>.nip.io/actuator/health
```

### 2. Deploy Monitoring

```powershell
cd deployment/kubernetes/monitoring
./deploy-monitoring.sh
```

### 3. Set Up Backups

```powershell
kubectl apply -f deployment/kubernetes/backup-cronjob.yaml
```

### 4. Update Documentation

Update CIA-TRIAD-SECURITY-ASSESSMENT.md to reflect HTTPS is now implemented.

---

## Conclusion

**You can make HUGE security improvements in 3-4 hours:**

✅ HTTPS: 1-2 hours → Encrypts all traffic
✅ Monitoring: 30 min → Visibility and alerts
✅ Backups: 1 hour → Data protection

**Result:**
- CIA Score: 6.5/10 → 7.5/10
- Production-ready baseline security
- Student budget (under $10/month)
- Real-world experience with security best practices

**Let's start with HTTPS!**
