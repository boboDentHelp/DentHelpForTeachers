# HTTPS Deployment Guide for DentalHelp
## Implementing FREE SSL with NGINX Ingress + Let's Encrypt

**Created:** November 29, 2025
**Author:** Bogdan Calinescu
**Estimated Time:** 1-2 hours
**Cost:** $0/month (completely FREE)

---

## What This Does

Transforms your HTTP-only deployment into HTTPS with:
- ✅ FREE SSL certificate from Let's Encrypt
- ✅ Automatic certificate renewal (never expires)
- ✅ Force HTTPS redirect (HTTP → HTTPS)
- ✅ Rate limiting (10 req/sec per IP)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ CORS enabled (for frontend)

**Before:** `http://34.55.12.229:8080` (insecure)
**After:** `https://dentalhelp.34.55.12.229.nip.io` (encrypted)

---

## Prerequisites

- ✅ GKE cluster running
- ✅ kubectl configured
- ✅ API Gateway deployed in `dentalhelp` namespace
- ✅ ~10 minutes for setup

---

## Step-by-Step Implementation

### Step 1: Install NGINX Ingress Controller (2 minutes)

```powershell
# Install NGINX Ingress for GKE
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Wait for deployment
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Get the LoadBalancer IP (this is your new external IP)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Wait for EXTERNAL-IP to appear (takes 1-2 minutes)
kubectl get svc -n ingress-nginx ingress-nginx-controller --watch
# Press Ctrl+C when EXTERNAL-IP shows up
```

**Expected Output:**
```
NAME                       TYPE           EXTERNAL-IP      PORT(S)
ingress-nginx-controller   LoadBalancer   34.55.12.229     80:30080/TCP,443:30443/TCP
```

**Save this IP address!** This is your new entry point.

---

### Step 2: Install cert-manager (3 minutes)

```powershell
# Install cert-manager (manages SSL certificates)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=available --timeout=300s \
  deployment/cert-manager -n cert-manager

kubectl wait --for=condition=available --timeout=300s \
  deployment/cert-manager-webhook -n cert-manager

kubectl wait --for=condition=available --timeout=300s \
  deployment/cert-manager-cainjector -n cert-manager

# Verify cert-manager is running
kubectl get pods -n cert-manager
```

**Expected Output:**
```
NAME                                      READY   STATUS    RESTARTS   AGE
cert-manager-xxxxx                        1/1     Running   0          1m
cert-manager-cainjector-xxxxx             1/1     Running   0          1m
cert-manager-webhook-xxxxx                1/1     Running   0          1m
```

---

### Step 3: Configure Your Domain

You have 2 options:

#### Option A: Use nip.io (NO domain needed - FREE)

**Best for:** Testing, development, student projects

```powershell
# Get your LoadBalancer IP
$LB_IP = kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
echo "Your LoadBalancer IP: $LB_IP"

# Your domain will be: dentalhelp.$LB_IP.nip.io
# Example: dentalhelp.34.55.12.229.nip.io
```

**How nip.io works:**
- `dentalhelp.34.55.12.229.nip.io` automatically resolves to 34.55.12.229
- No DNS configuration needed
- FREE and instant
- Valid SSL certificate

#### Option B: Use Real Domain (Costs $10-15/year)

**Best for:** Production, portfolio projects

1. Buy domain from Namecheap, Google Domains, etc. ($10-15/year)
2. Add A record pointing to your LoadBalancer IP:
   ```
   Type: A
   Name: dentalhelp
   Value: 34.55.12.229
   TTL: 300
   ```
3. Wait 5-10 minutes for DNS propagation

---

### Step 4: Update Configuration Files

#### Update Email in ClusterIssuer

Edit `00-cert-manager-clusterissuer.yaml`:
```yaml
spec:
  acme:
    email: YOUR-ACTUAL-EMAIL@example.com  # Change this!
```

#### Update Domain in Ingress

Edit `01-https-ingress-dentalhelp.yaml`:

```yaml
# If using nip.io:
tls:
  - hosts:
      - dentalhelp.34.55.12.229.nip.io  # Replace with your LB IP
    secretName: dentalhelp-tls

rules:
  - host: dentalhelp.34.55.12.229.nip.io  # Same as above

# If using real domain:
tls:
  - hosts:
      - dentalhelp.yourdomain.com  # Your actual domain
    secretName: dentalhelp-tls

rules:
  - host: dentalhelp.yourdomain.com  # Same as above
```

---

### Step 5: Deploy HTTPS Configuration

```powershell
# Navigate to https-setup directory
cd deployment/kubernetes/https-setup

# Deploy ClusterIssuers (Let's Encrypt config)
kubectl apply -f 00-cert-manager-clusterissuer.yaml

# Verify ClusterIssuers are ready
kubectl get clusterissuer

# Expected output:
# NAME                  READY   AGE
# letsencrypt-prod      True    10s
# letsencrypt-staging   True    10s

# Update API Gateway service (LoadBalancer → ClusterIP)
kubectl apply -f 02-update-api-gateway-for-ingress.yaml

# Deploy HTTPS Ingress
kubectl apply -f 01-https-ingress-dentalhelp.yaml

# Watch certificate provisioning (takes 2-5 minutes)
kubectl get certificate -n dentalhelp --watch
```

**Expected Output:**
```
NAME             READY   SECRET           AGE
dentalhelp-tls   True    dentalhelp-tls   2m
```

When `READY` shows `True`, your SSL certificate is active!

---

### Step 6: Verify HTTPS is Working

```powershell
# Get your HTTPS URL
$LB_IP = kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
$HTTPS_URL = "https://dentalhelp.$LB_IP.nip.io"

echo "Your HTTPS URL: $HTTPS_URL"

# Test HTTPS endpoint
curl $HTTPS_URL/actuator/health

# Test that HTTP redirects to HTTPS
curl -I "http://dentalhelp.$LB_IP.nip.io/actuator/health"
# Should see: HTTP/1.1 308 Permanent Redirect
# Location: https://...
```

**Expected Response:**
```json
{
  "status": "UP",
  "groups": ["liveness","readiness"]
}
```

**If using staging certificate, you'll see SSL warning:**
```
curl: (60) SSL certificate problem: unable to get local issuer certificate
```

This is normal! Use `-k` flag to bypass:
```powershell
curl -k $HTTPS_URL/actuator/health
```

---

### Step 7: Switch to Production Certificate (After Testing)

Once everything works with staging:

```powershell
# Edit 01-https-ingress-dentalhelp.yaml
# Change line:
cert-manager.io/cluster-issuer: "letsencrypt-staging"
# To:
cert-manager.io/cluster-issuer: "letsencrypt-prod"

# Reapply
kubectl apply -f 01-https-ingress-dentalhelp.yaml

# Delete old certificate to trigger renewal
kubectl delete certificate dentalhelp-tls -n dentalhelp

# Watch new certificate provision
kubectl get certificate -n dentalhelp --watch

# Wait for READY = True (2-5 minutes)
```

Now you have a **valid, trusted SSL certificate**!

---

## Test Your HTTPS Deployment

### Test 1: Basic Connectivity
```powershell
curl https://dentalhelp.$LB_IP.nip.io/actuator/health
```

### Test 2: Authentication
```powershell
# Login
curl -X POST https://dentalhelp.$LB_IP.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'

# Should return JWT token (now encrypted in transit!)
```

### Test 3: HTTP → HTTPS Redirect
```powershell
# Try HTTP (should redirect to HTTPS)
curl -I http://dentalhelp.$LB_IP.nip.io/actuator/health

# Should see:
# HTTP/1.1 308 Permanent Redirect
# Location: https://dentalhelp....
```

### Test 4: Security Headers
```powershell
curl -I https://dentalhelp.$LB_IP.nip.io/actuator/health

# Should see headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## Update Your Frontend

If you have a React frontend, update the API URL:

```javascript
// Before:
const API_URL = "http://34.55.12.229:8080";

// After:
const API_URL = "https://dentalhelp.34.55.12.229.nip.io";
```

---

## Monitoring Your SSL Certificates

### Check Certificate Status
```powershell
# List all certificates
kubectl get certificate -n dentalhelp

# Describe certificate (see expiry, renewal info)
kubectl describe certificate dentalhelp-tls -n dentalhelp

# Check certificate secret
kubectl get secret dentalhelp-tls -n dentalhelp -o yaml
```

### Certificate Renewal

**Good news:** cert-manager automatically renews certificates!

- Certificates valid for 90 days
- Auto-renewal starts at 30 days before expiry
- You don't need to do anything

### Check cert-manager Logs
```powershell
kubectl logs -n cert-manager deployment/cert-manager -f
```

---

## Troubleshooting

### Issue: Certificate stuck in "READY = False"

```powershell
# Check certificate status
kubectl describe certificate dentalhelp-tls -n dentalhelp

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager --tail=50

# Common causes:
# 1. Wrong email format
# 2. Domain not pointing to LoadBalancer IP
# 3. NGINX Ingress not running
# 4. Firewall blocking port 80 (needed for HTTP-01 challenge)
```

### Issue: "Unable to connect" to HTTPS URL

```powershell
# Check NGINX Ingress is running
kubectl get pods -n ingress-nginx

# Check LoadBalancer IP
kubectl get svc -n ingress-nginx

# Check Ingress created
kubectl get ingress -n dentalhelp

# Check Ingress events
kubectl describe ingress dentalhelp-https-ingress -n dentalhelp
```

### Issue: SSL certificate invalid/untrusted

**If using staging:**
- Normal! Staging certs are for testing only
- Switch to prod (see Step 7)

**If using prod:**
- Wait 2-5 minutes for certificate to propagate
- Check certificate with: `kubectl describe certificate dentalhelp-tls -n dentalhelp`
- Verify domain DNS points to correct IP

### Issue: HTTP doesn't redirect to HTTPS

Check annotations in Ingress:
```yaml
nginx.ingress.kubernetes.io/ssl-redirect: "true"
nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```

---

## Cleanup (If You Need to Start Over)

```powershell
# Delete Ingress
kubectl delete ingress dentalhelp-https-ingress -n dentalhelp

# Delete certificate
kubectl delete certificate dentalhelp-tls -n dentalhelp

# Delete secret
kubectl delete secret dentalhelp-tls -n dentalhelp

# Revert API Gateway to LoadBalancer (if needed)
kubectl apply -f ../21-api-gateway-production.yaml
```

---

## What You Achieved

✅ **FREE SSL certificate** from Let's Encrypt
✅ **Automatic renewal** (never expires)
✅ **HTTPS encryption** for all traffic
✅ **HTTP → HTTPS redirect** (force secure connections)
✅ **Rate limiting** (10 req/sec per IP)
✅ **Security headers** (XSS, clickjacking protection)
✅ **CORS enabled** (frontend can access API)

**Security Improvement:**
- **Before:** Confidentiality 6/10 (HTTP, tokens in clear text)
- **After:** Confidentiality 7-8/10 (HTTPS, all traffic encrypted)

**No more:**
- ❌ JWT tokens visible in network traffic
- ❌ Passwords transmitted in clear text
- ❌ Medical data unencrypted
- ❌ Man-in-the-middle attacks

**You now have:**
- ✅ End-to-end encryption
- ✅ Industry-standard security
- ✅ Production-ready baseline
- ✅ FREE (no monthly costs)

---

## Next Steps

1. **Deploy Monitoring** (see `deployment/kubernetes/monitoring/QUICK-START.md`)
2. **Set Up Automated Backups** (see `SECURITY-GAP-ANALYSIS-AND-FIXES.md`)
3. **Enable Centralized Logging** (Google Cloud Logging)
4. **Get Real Domain** (optional, for portfolio)
5. **Update Documentation** (CIA document, portfolio)

---

## Questions?

Check:
- `SECURITY-GAP-ANALYSIS-AND-FIXES.md` for overall security roadmap
- cert-manager docs: https://cert-manager.io/docs/
- NGINX Ingress docs: https://kubernetes.github.io/ingress-nginx/

---

**Congratulations! Your DentalHelp API now runs on HTTPS!** 🎉🔒
