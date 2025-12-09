#!/bin/bash
# =============================================================================
# DentalHelp Kubernetes Deployment Script
# Usage: ./deploy.sh [DOCKERHUB_USERNAME] [ENVIRONMENT]
# =============================================================================

set -e

DOCKERHUB_USERNAME=${1:-"your-dockerhub-username"}
ENVIRONMENT=${2:-"staging"}
NAMESPACE="dentalhelp"

echo "============================================"
echo "DentalHelp Kubernetes Deployment"
echo "============================================"
echo "Docker Hub User: $DOCKERHUB_USERNAME"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed"
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

log_info "Connected to Kubernetes cluster"

# Replace Docker Hub username in all files
log_info "Updating Docker Hub username in manifests..."
for file in *.yaml; do
    sed -i "s/\${DOCKERHUB_USERNAME}/$DOCKERHUB_USERNAME/g" "$file" 2>/dev/null || true
done

# Step 1: Create namespace and configs
log_info "Step 1: Creating namespace and configurations..."
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-storage.yaml

# Step 2: Deploy infrastructure
log_info "Step 2: Deploying infrastructure (RabbitMQ, Redis, MySQL)..."
kubectl apply -f 10-rabbitmq.yaml
kubectl apply -f 11-redis.yaml
kubectl apply -f 12-mysql.yaml

log_info "Waiting for infrastructure to be ready..."
sleep 10

kubectl wait --for=condition=ready pod -l app=rabbitmq -n $NAMESPACE --timeout=120s || log_warn "RabbitMQ not ready"
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=60s || log_warn "Redis not ready"

# Wait for at least one MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql-auth -n $NAMESPACE --timeout=180s || log_warn "MySQL-auth not ready"

# Step 3: Deploy Eureka Server first
log_info "Step 3: Deploying Eureka Server..."
kubectl apply -f 20-eureka-server.yaml
kubectl rollout status deployment/eureka-server -n $NAMESPACE --timeout=180s || log_warn "Eureka rollout timeout"

# Step 4: Deploy API Gateway
log_info "Step 4: Deploying API Gateway..."
kubectl apply -f 21-api-gateway.yaml
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=180s || log_warn "API Gateway rollout timeout"

# Step 5: Deploy microservices
log_info "Step 5: Deploying microservices..."
kubectl apply -f 22-microservices.yaml

# Wait for all services
for svc in auth-service patient-service appointment-service dental-records-service xray-service treatment-service notification-service; do
    log_info "Waiting for $svc..."
    kubectl rollout status deployment/$svc -n $NAMESPACE --timeout=180s || log_warn "$svc rollout timeout"
done

# Step 6: Deploy Ingress
log_info "Step 6: Deploying Ingress..."
kubectl apply -f 30-ingress.yaml

# Summary
echo ""
echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo ""

log_info "Pods:"
kubectl get pods -n $NAMESPACE

echo ""
log_info "Services:"
kubectl get svc -n $NAMESPACE

echo ""
log_info "Ingress:"
kubectl get ingress -n $NAMESPACE

# Get API Gateway external IP
GATEWAY_IP=$(kubectl get svc api-gateway -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
if [ "$GATEWAY_IP" != "pending" ] && [ -n "$GATEWAY_IP" ]; then
    echo ""
    log_info "API Gateway URL: http://$GATEWAY_IP:8080"
else
    echo ""
    log_info "API Gateway LoadBalancer IP is pending. Use port-forward:"
    log_info "  kubectl port-forward svc/api-gateway 8080:8080 -n $NAMESPACE"
fi

echo ""
log_info "Eureka Dashboard:"
log_info "  kubectl port-forward svc/eureka-server 8761:8761 -n $NAMESPACE"
log_info "  Open: http://localhost:8761"

echo ""
log_info "RabbitMQ Management:"
log_info "  kubectl port-forward svc/rabbitmq 15672:15672 -n $NAMESPACE"
log_info "  Open: http://localhost:15672 (guest/guest)"
