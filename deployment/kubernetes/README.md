# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3 (optional, for easier management)
- At least 8GB RAM, 4 CPU cores across cluster
- LoadBalancer or Ingress controller configured

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Configure Secrets

```bash
# Copy example and edit with your values
cp secrets.yaml.example secrets.yaml
nano secrets.yaml

# Create secrets (DON'T commit secrets.yaml!)
kubectl apply -f secrets.yaml
```

### 3. Create ConfigMap

```bash
kubectl apply -f configmap.yaml
```

### 4. Deploy Services

Deploy in this order:

```bash
# Infrastructure
kubectl apply -f eureka-server.yaml

# Wait for Eureka to be ready
kubectl wait --for=condition=ready pod -l app=eureka-server -n dentalhelp --timeout=120s

# API Gateway
kubectl apply -f api-gateway.yaml

# Microservices (create similar yamls for each)
# kubectl apply -f auth-service.yaml
# kubectl apply -f patient-service.yaml
# etc...
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n dentalhelp

# Check services
kubectl get svc -n dentalhelp

# Check logs
kubectl logs -f deployment/api-gateway -n dentalhelp

# Get external IP
kubectl get svc api-gateway -n dentalhelp
```

## Scaling

### Manual Scaling

```bash
# Scale a deployment
kubectl scale deployment api-gateway --replicas=3 -n dentalhelp
```

### Auto-Scaling (HPA)

Horizontal Pod Autoscaler is already configured for API Gateway.

```bash
# Check HPA status
kubectl get hpa -n dentalhelp

# Watch HPA
kubectl get hpa api-gateway-hpa -n dentalhelp --watch
```

### Cluster Autoscaling

Enable cluster autoscaler for node-level scaling:

**GKE:**
```bash
gcloud container clusters update CLUSTER_NAME \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10
```

**EKS:**
```bash
# Install cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

**AKS:**
```bash
az aks update \
  --resource-group RESOURCE_GROUP \
  --name CLUSTER_NAME \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 10
```

## Monitoring

### Deploy Prometheus & Grafana

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Open http://localhost:3000
# Username: admin
# Password: prom-operator
```

### Access Prometheus

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
# Open http://localhost:9090
```

## Ingress Setup

### Using Nginx Ingress

1. Install Nginx Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. Create Ingress resource:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dentalhelp-ingress
  namespace: dentalhelp
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.your-domain.com
    secretName: dentalhelp-tls
  rules:
  - host: api.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

### SSL/TLS with Cert-Manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Database Management

### Use Managed Databases (Recommended)

For production, use managed databases:
- **GKE**: Cloud SQL
- **EKS**: RDS
- **AKS**: Azure Database for MySQL

### Or Deploy Databases in K8s

```bash
# Deploy MySQL with persistent storage
kubectl apply -f mysql-statefulset.yaml
```

## Persistent Storage

### Create PersistentVolumeClaims

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: dentalhelp
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: standard  # Or your cloud provider's storage class
```

## CI/CD Integration

Update `.github/workflows/cd.yml` with your cluster details:

```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl config use-context my-cluster
    kubectl set image deployment/api-gateway \
      api-gateway=ghcr.io/${{ github.repository }}/api-gateway:${{ github.sha }} \
      -n dentalhelp
    kubectl rollout status deployment/api-gateway -n dentalhelp
```

## Backup and Restore

### Backup using Velero

```bash
# Install Velero
velero install \
  --provider aws \
  --bucket my-backup-bucket \
  --secret-file ./credentials-velero

# Create backup
velero backup create dentalhelp-backup --include-namespaces dentalhelp

# Restore
velero restore create --from-backup dentalhelp-backup
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod POD_NAME -n dentalhelp

# Check logs
kubectl logs POD_NAME -n dentalhelp

# Check events
kubectl get events -n dentalhelp --sort-by='.lastTimestamp'
```

### Out of Resources

```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n dentalhelp
```

### Network Issues

```bash
# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -n dentalhelp -- sh
# Inside pod:
wget -O- http://eureka-server:8761/actuator/health
```

## Resource Limits

Recommended resource limits per service:

| Service | Requests (CPU/Memory) | Limits (CPU/Memory) |
|---------|----------------------|---------------------|
| Eureka Server | 250m / 512Mi | 500m / 1Gi |
| API Gateway | 250m / 512Mi | 1000m / 1Gi |
| Auth Service | 200m / 384Mi | 500m / 768Mi |
| Other Services | 200m / 384Mi | 500m / 768Mi |
| Databases | 500m / 1Gi | 1000m / 2Gi |

## Cost Optimization

1. **Use node auto-scaling**
2. **Set appropriate resource requests/limits**
3. **Use spot instances** (GKE Preemptible, EKS Spot, AKS Spot)
4. **Use namespace quotas**
5. **Configure HPA properly**
6. **Use PodDisruptionBudgets**
7. **Clean up unused resources**

## Security Best Practices

- [ ] Use RBAC for access control
- [ ] Enable Pod Security Policies
- [ ] Use Network Policies
- [ ] Scan images for vulnerabilities
- [ ] Encrypt secrets with KMS
- [ ] Enable audit logging
- [ ] Use private container registry
- [ ] Limit egress traffic
- [ ] Regular security updates

## Useful Commands

```bash
# Port forward to local
kubectl port-forward svc/api-gateway 8080:8080 -n dentalhelp

# Execute command in pod
kubectl exec -it POD_NAME -n dentalhelp -- /bin/sh

# Copy files from pod
kubectl cp dentalhelp/POD_NAME:/path/to/file ./local/path

# View resource usage
kubectl top pods -n dentalhelp
kubectl top nodes

# Restart deployment
kubectl rollout restart deployment/api-gateway -n dentalhelp

# View rollout history
kubectl rollout history deployment/api-gateway -n dentalhelp

# Rollback to previous version
kubectl rollout undo deployment/api-gateway -n dentalhelp
```

## Clean Up

```bash
# Delete all resources in namespace
kubectl delete namespace dentalhelp

# Or delete individual resources
kubectl delete -f .
```
