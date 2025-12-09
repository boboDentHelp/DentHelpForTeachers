# Prometheus + Grafana Monitoring for GKE

Complete monitoring stack for DentalHelp microservices on Google Kubernetes Engine (GKE) with HTTPS support.

## 📋 Overview

This monitoring setup includes:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **kube-state-metrics**: Kubernetes cluster metrics
- **HTTPS/TLS**: Secure access via LoadBalancer
- **Persistent Storage**: Data retention across restarts

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GKE Cluster                          │
│                                                         │
│  ┌───────────────┐         ┌──────────────┐           │
│  │   Prometheus  │◄────────│ Microservices│           │
│  │               │         └──────────────┘           │
│  │   - Metrics   │                                     │
│  │   - Alerts    │         ┌──────────────┐           │
│  │   - Storage   │◄────────│ kube-state-  │           │
│  └───────┬───────┘         │   metrics    │           │
│          │                 └──────────────┘           │
│          │                                             │
│          ▼                                             │
│  ┌───────────────┐                                     │
│  │    Grafana    │                                     │
│  │               │                                     │
│  │  - Dashboards │                                     │
│  │  - Alerts     │                                     │
│  └───────┬───────┘                                     │
└──────────┼─────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ HTTPS Ingress│
    │  (SSL/TLS)   │
    └──────────────┘
           │
           ▼
    Users accessing via:
    - https://grafana.dentalhelp.com
    - https://prometheus.dentalhelp.com
```

## 📁 Files Structure

```
monitoring/
├── 00-namespace.yaml                 # Monitoring namespace
├── 01-prometheus-config.yaml         # Prometheus configuration
├── 02-grafana-config.yaml           # Grafana datasources & dashboards
├── 03-prometheus-rbac.yaml          # Prometheus service account & permissions
├── 04-prometheus-deployment.yaml    # Prometheus deployment & service
├── 05-grafana-deployment.yaml       # Grafana deployment & service
├── 06-ingress-https.yaml           # GCE Ingress with Google-managed SSL
├── 07-ingress-nginx-https.yaml     # NGINX Ingress with cert-manager
├── 08-kube-state-metrics.yaml      # Kubernetes metrics exporter
├── deploy-monitoring.sh            # Automated deployment script
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

1. **GKE Cluster**: Running Kubernetes cluster on Google Cloud
2. **kubectl**: Configured and connected to your cluster
3. **Domain Names**: DNS records for Grafana and Prometheus
4. **Ingress Controller**: Choose one:
   - NGINX Ingress Controller (recommended)
   - GCE Ingress (default for GKE)

### Option 1: Automated Deployment (Recommended)

```bash
cd deployment/kubernetes/monitoring
./deploy-monitoring.sh
```

The script will:
1. Create the monitoring namespace
2. Deploy Prometheus with RBAC
3. Deploy Grafana with pre-configured datasources
4. Deploy kube-state-metrics
5. Configure HTTPS ingress
6. Display access information

### Option 2: Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f 00-namespace.yaml

# 2. Deploy Prometheus
kubectl apply -f 01-prometheus-config.yaml
kubectl apply -f 03-prometheus-rbac.yaml
kubectl apply -f 04-prometheus-deployment.yaml

# 3. Deploy Grafana
kubectl apply -f 02-grafana-config.yaml
kubectl apply -f 05-grafana-deployment.yaml

# 4. Deploy kube-state-metrics (optional but recommended)
kubectl apply -f 08-kube-state-metrics.yaml

# 5. Deploy HTTPS Ingress (choose one)
# Option A: NGINX Ingress with cert-manager (Let's Encrypt - FREE)
kubectl apply -f 07-ingress-nginx-https.yaml

# Option B: GCE Ingress with Google-managed certificates (FREE)
kubectl apply -f 06-ingress-https.yaml
```

## 🔐 HTTPS Configuration

### Option A: NGINX Ingress + cert-manager (Recommended)

**Advantages:**
- Free SSL certificates from Let's Encrypt
- Automatic certificate renewal
- More flexible configuration options
- Better for multiple domains

**Setup:**

1. Install NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

2. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

3. Update domains in `07-ingress-nginx-https.yaml`:
```yaml
spec:
  tls:
    - hosts:
        - grafana.yourdomain.com  # Change this
      secretName: grafana-tls
  rules:
    - host: grafana.yourdomain.com  # Change this
```

4. Update email in ClusterIssuer:
```yaml
spec:
  acme:
    email: your-email@yourdomain.com  # Change this
```

5. Deploy:
```bash
kubectl apply -f 07-ingress-nginx-https.yaml
```

6. Point your DNS to the LoadBalancer IP:
```bash
# Get LoadBalancer IP
kubectl get svc -n ingress-nginx

# Create DNS A records:
# grafana.yourdomain.com -> LOADBALANCER_IP
# prometheus.yourdomain.com -> LOADBALANCER_IP
```

### Option B: GCE Ingress + Google-managed Certificates

**Advantages:**
- Fully managed by Google Cloud
- No additional components needed
- Integrated with GCP

**Setup:**

1. Update domains in `06-ingress-https.yaml`:
```yaml
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: monitoring-cert
spec:
  domains:
    - grafana.yourdomain.com  # Change this
    - prometheus.yourdomain.com  # Change this
```

2. Deploy:
```bash
kubectl apply -f 06-ingress-https.yaml
```

3. Get LoadBalancer IP:
```bash
kubectl get ingress -n monitoring
```

4. Point your DNS to the LoadBalancer IP

5. **IMPORTANT**: Wait 15-60 minutes for Google to provision the SSL certificate

6. Check certificate status:
```bash
kubectl describe managedcertificate monitoring-cert -n monitoring
```

## 🔑 Default Credentials

### Grafana
- **Username**: `admin`
- **Password**: `admin123!`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

To change the password:
1. Log in to Grafana
2. Go to Profile → Change Password
3. Or update the secret:
```bash
kubectl create secret generic grafana-credentials \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=YOUR_NEW_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f - -n monitoring
kubectl rollout restart deployment/grafana -n monitoring
```

### Prometheus Basic Auth (NGINX Ingress only)
- **Username**: `admin`
- **Password**: `admin123`

To update:
```bash
htpasswd -nb admin your_new_password | base64 -w 0
# Update the 'auth' field in prometheus-basic-auth secret in 07-ingress-nginx-https.yaml
```

## 📊 Accessing the Services

### Via Ingress (HTTPS)
- Grafana: `https://grafana.yourdomain.com`
- Prometheus: `https://prometheus.yourdomain.com`

### Via Port-Forward (Local Access)

**Grafana:**
```bash
kubectl port-forward -n monitoring svc/grafana 3000:3000
```
Then access: http://localhost:3000

**Prometheus:**
```bash
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```
Then access: http://localhost:9090

## 📈 Monitoring Your Microservices

### Enable Metrics in Your Services

Your Spring Boot microservices need to expose metrics at `/actuator/prometheus`:

1. Add dependencies to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

2. Configure in `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  metrics:
    export:
      prometheus:
        enabled: true
```

3. Add Prometheus annotations to your Kubernetes deployments:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-service
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
```

Prometheus will automatically discover and scrape these services!

## 🎨 Grafana Dashboards

### Pre-configured Dashboards
The setup includes basic dashboards for:
- Spring Boot Microservices
- Kubernetes Cluster Overview

### Import Additional Dashboards

1. Log in to Grafana
2. Go to Dashboards → Import
3. Use these dashboard IDs from grafana.com:
   - **4701**: JVM (Micrometer)
   - **11159**: Spring Boot 2.1 Statistics
   - **12856**: Kubernetes Cluster Monitoring
   - **315**: Kubernetes Cluster (Prometheus)

Or create your own custom dashboards!

## 🔔 Alerting

### Prometheus Alerts
Alerts are defined in `01-prometheus-config.yaml`:
- High CPU Usage
- High Memory Usage
- Service Down
- High Response Time
- Low Database Connection Pool

### Configure Alertmanager (Optional)

1. Create `alertmanager-config.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'
    route:
      group_by: ['alertname', 'cluster']
      receiver: 'slack-notifications'
    receivers:
      - name: 'slack-notifications'
        slack_configs:
          - channel: '#alerts'
            title: 'Alert: {{ .GroupLabels.alertname }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

2. Deploy Alertmanager (you'll need to create the deployment separately)

## 🔧 Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n monitoring
```

### View Logs
```bash
# Prometheus logs
kubectl logs -f deployment/prometheus -n monitoring

# Grafana logs
kubectl logs -f deployment/grafana -n monitoring

# kube-state-metrics logs
kubectl logs -f deployment/kube-state-metrics -n monitoring
```

### Check Persistent Volumes
```bash
kubectl get pvc -n monitoring
kubectl describe pvc prometheus-pvc -n monitoring
kubectl describe pvc grafana-pvc -n monitoring
```

### Certificate Issues (cert-manager)
```bash
# Check certificate status
kubectl get certificate -n monitoring
kubectl describe certificate grafana-tls -n monitoring

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager
```

### Certificate Issues (Google-managed)
```bash
# Check managed certificate status
kubectl describe managedcertificate monitoring-cert -n monitoring

# Status should eventually show: "Active"
# If stuck in "Provisioning", check:
# 1. DNS is pointing to the correct IP
# 2. Domain is accessible via HTTP
# 3. Wait up to 60 minutes
```

### Prometheus Not Scraping Targets
```bash
# Port-forward to Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Access http://localhost:9090/targets
# Check which targets are down and their error messages
```

### Grafana Can't Connect to Prometheus
```bash
# Check if Prometheus service is accessible
kubectl get svc -n monitoring
kubectl exec -it deployment/grafana -n monitoring -- wget -O- http://prometheus:9090/api/v1/status/config
```

## 🔒 Security Best Practices

1. **Change Default Passwords**: Update Grafana and basic auth passwords
2. **Use OAuth/SSO**: Configure Grafana with Google OAuth or LDAP
3. **Network Policies**: Restrict access between namespaces
4. **RBAC**: Review and restrict Prometheus RBAC permissions
5. **Secrets Management**: Use Google Secret Manager for sensitive data
6. **Enable IAP**: Use Google Identity-Aware Proxy for additional security
7. **Regular Updates**: Keep Prometheus and Grafana images updated

## 📊 Storage Management

### Prometheus Data Retention
Default retention: 15 days (configured in deployment)

To change:
```yaml
args:
  - '--storage.tsdb.retention.time=30d'  # Change to 30 days
```

### Increase Storage Size
```yaml
# In prometheus-pvc
spec:
  resources:
    requests:
      storage: 50Gi  # Increase from 10Gi
```

Then apply:
```bash
kubectl apply -f 04-prometheus-deployment.yaml
```

## 🧹 Cleanup

To remove the entire monitoring stack:

```bash
kubectl delete namespace monitoring
```

To remove specific components:
```bash
kubectl delete -f 08-kube-state-metrics.yaml
kubectl delete -f 07-ingress-nginx-https.yaml
kubectl delete -f 05-grafana-deployment.yaml
kubectl delete -f 04-prometheus-deployment.yaml
kubectl delete -f 03-prometheus-rbac.yaml
kubectl delete -f 02-grafana-config.yaml
kubectl delete -f 01-prometheus-config.yaml
kubectl delete -f 00-namespace.yaml
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)
- [GKE Ingress](https://cloud.google.com/kubernetes-engine/docs/concepts/ingress)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs from the affected component
3. Check Kubernetes events: `kubectl get events -n monitoring`
4. Consult the official documentation

## 📝 License

This monitoring setup is part of the DentalHelp application.
