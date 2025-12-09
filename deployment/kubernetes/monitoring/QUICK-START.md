# Quick Start Guide - GKE Monitoring with HTTPS

## 🚀 5-Minute Setup

### Prerequisites Checklist
- [ ] GKE cluster is running
- [ ] kubectl is installed and configured
- [ ] You have a domain name
- [ ] DNS provider access to create A records

### Step 1: Deploy Monitoring Stack (2 minutes)

```bash
cd deployment/kubernetes/monitoring
./deploy-monitoring.sh
```

Follow the prompts:
- Choose NGINX Ingress + cert-manager (recommended)
- Or choose GCE Ingress if you prefer Google-managed certificates

### Step 2: Configure DNS (1 minute)

Get the LoadBalancer IP:
```bash
# For NGINX Ingress
kubectl get svc -n ingress-nginx

# For GCE Ingress
kubectl get ingress -n monitoring
```

Create DNS A records:
```
grafana.yourdomain.com     → LOADBALANCER_IP
prometheus.yourdomain.com  → LOADBALANCER_IP
```

### Step 3: Update Configuration (1 minute)

#### For NGINX Ingress:
Edit `07-ingress-nginx-https.yaml`:
```yaml
# Line ~120: Update email
email: your-email@yourdomain.com

# Line ~75 and ~145: Update domains
host: grafana.yourdomain.com
host: prometheus.yourdomain.com
```

#### For GCE Ingress:
Edit `06-ingress-https.yaml`:
```yaml
# Line ~18: Update domains
domains:
  - grafana.yourdomain.com
  - prometheus.yourdomain.com
```

Apply changes:
```bash
kubectl apply -f 07-ingress-nginx-https.yaml
# OR
kubectl apply -f 06-ingress-https.yaml
```

### Step 4: Wait for SSL (0-60 minutes)

#### NGINX + cert-manager:
Certificates usually provision in 2-5 minutes.

Check status:
```bash
kubectl get certificate -n monitoring
```

Wait for status: `READY: True`

#### Google-managed certificates:
Certificates can take 15-60 minutes.

Check status:
```bash
kubectl describe managedcertificate monitoring-cert -n monitoring
```

Wait for status: `Active`

### Step 5: Access Your Services

**Grafana**: https://grafana.yourdomain.com
- Username: `admin`
- Password: `admin123!`

**Prometheus**: https://prometheus.yourdomain.com
- Username: `admin` (NGINX only)
- Password: `admin123` (NGINX only)

### Step 6: Secure Your Setup

1. **Change Grafana password** (CRITICAL):
   - Log in to Grafana
   - Profile → Change Password

2. **Update Prometheus basic auth** (if using NGINX):
```bash
# Generate new password hash
htpasswd -nb admin YOUR_NEW_PASSWORD | base64 -w 0

# Update in 07-ingress-nginx-https.yaml and reapply
```

## ✅ Verification

Check everything is running:
```bash
kubectl get pods -n monitoring
```

You should see:
```
NAME                                  READY   STATUS    RESTARTS   AGE
prometheus-xxxx                       1/1     Running   0          5m
grafana-xxxx                         1/1     Running   0          5m
kube-state-metrics-xxxx              1/1     Running   0          5m
```

Check ingress:
```bash
kubectl get ingress -n monitoring
```

## 🎯 Next Steps

1. **Import Dashboards** to Grafana:
   - Go to Dashboards → Import
   - Use ID `4701` for JVM metrics
   - Use ID `12856` for Kubernetes monitoring

2. **Enable Monitoring** in your services:
   - Add Prometheus annotations to your deployments
   - See: [Monitoring Your Services](#monitoring-your-services) below

3. **Configure Alerts**:
   - Alerts are pre-configured in Prometheus
   - Set up Alertmanager for notifications (optional)

## 📊 Monitoring Your Services

Add these annotations to your service deployments in the `dentalhelp` namespace:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-service
  namespace: dentalhelp
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
```

Prometheus will automatically discover and scrape your services!

## 🔧 Common Issues

### SSL Certificate Not Provisioning

**NGINX + cert-manager:**
```bash
# Check certificate status
kubectl describe certificate grafana-tls -n monitoring

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager

# Common fixes:
# 1. Ensure DNS is pointing to correct IP
# 2. Ensure domain is accessible via HTTP first
# 3. Check ClusterIssuer email is correct
```

**Google-managed certificates:**
```bash
# Check status
kubectl describe managedcertificate monitoring-cert -n monitoring

# Common fixes:
# 1. Wait longer (can take up to 60 minutes)
# 2. Ensure DNS is correctly configured
# 3. Ensure domains match exactly
# 4. Check Google Cloud Console for errors
```

### Can't Access Grafana/Prometheus

1. **Check pods are running**:
```bash
kubectl get pods -n monitoring
```

2. **Try port-forward** to bypass ingress:
```bash
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Access http://localhost:3000
```

3. **Check ingress logs**:
```bash
# NGINX
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx

# GCE
kubectl describe ingress -n monitoring
```

### Prometheus Not Scraping Services

1. **Check Prometheus targets**:
```bash
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets
```

2. **Verify service annotations** in your deployments

3. **Check Prometheus logs**:
```bash
kubectl logs -f deployment/prometheus -n monitoring
```

## 💡 Tips

### Access Without Domain
If you don't have a domain yet, use port-forward:
```bash
# Terminal 1
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Terminal 2
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```

### Use Staging SSL First
When testing, use Let's Encrypt staging to avoid rate limits:
```yaml
# In 07-ingress-nginx-https.yaml
cert-manager.io/cluster-issuer: "letsencrypt-staging"
```

Once working, switch to production:
```yaml
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### Monitor Resource Usage
```bash
kubectl top pods -n monitoring
```

## 📞 Need Help?

Full documentation: See `README.md` in this directory

Check logs:
```bash
kubectl logs -f deployment/prometheus -n monitoring
kubectl logs -f deployment/grafana -n monitoring
```

View events:
```bash
kubectl get events -n monitoring --sort-by='.lastTimestamp'
```

## 🎉 Success Indicators

You're all set when:
- ✅ All pods are Running
- ✅ SSL certificate is Active/Ready
- ✅ Grafana accessible via HTTPS
- ✅ Prometheus accessible via HTTPS
- ✅ Grafana shows Prometheus as connected datasource
- ✅ Prometheus shows targets as UP
- ✅ Changed default passwords
