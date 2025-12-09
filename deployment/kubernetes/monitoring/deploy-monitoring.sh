#!/bin/bash

# =============================================================================
# PROMETHEUS + GRAFANA MONITORING DEPLOYMENT SCRIPT FOR GKE
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="monitoring"
MONITORING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║   Prometheus + Grafana Monitoring Deployment for GKE      ║"
    echo "║                  DentalHelp Application                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    print_success "kubectl is installed"
}

# Check if connected to GKE cluster
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Not connected to a Kubernetes cluster"
        exit 1
    fi
    print_success "Connected to Kubernetes cluster: $(kubectl config current-context)"
}

# Create namespace
create_namespace() {
    print_info "Creating namespace: $NAMESPACE"
    kubectl apply -f "$MONITORING_DIR/00-namespace.yaml"
    print_success "Namespace created"
}

# Deploy Prometheus
deploy_prometheus() {
    print_info "Deploying Prometheus..."

    # Apply ConfigMaps
    kubectl apply -f "$MONITORING_DIR/01-prometheus-config.yaml"
    print_success "Prometheus ConfigMaps applied"

    # Apply RBAC
    kubectl apply -f "$MONITORING_DIR/03-prometheus-rbac.yaml"
    print_success "Prometheus RBAC configured"

    # Deploy Prometheus
    kubectl apply -f "$MONITORING_DIR/04-prometheus-deployment.yaml"
    print_success "Prometheus deployment created"

    # Wait for Prometheus to be ready
    print_info "Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n $NAMESPACE
    print_success "Prometheus is ready"
}

# Deploy Grafana
deploy_grafana() {
    print_info "Deploying Grafana..."

    # Apply ConfigMaps
    kubectl apply -f "$MONITORING_DIR/02-grafana-config.yaml"
    print_success "Grafana ConfigMaps applied"

    # Deploy Grafana
    kubectl apply -f "$MONITORING_DIR/05-grafana-deployment.yaml"
    print_success "Grafana deployment created"

    # Wait for Grafana to be ready
    print_info "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n $NAMESPACE
    print_success "Grafana is ready"
}

# Deploy kube-state-metrics
deploy_kube_state_metrics() {
    print_info "Deploying kube-state-metrics..."
    kubectl apply -f "$MONITORING_DIR/08-kube-state-metrics.yaml"
    print_success "kube-state-metrics deployed"

    # Wait for kube-state-metrics to be ready
    print_info "Waiting for kube-state-metrics to be ready..."
    kubectl wait --for=condition=available --timeout=180s deployment/kube-state-metrics -n $NAMESPACE
    print_success "kube-state-metrics is ready"
}

# Deploy HTTPS Ingress
deploy_ingress() {
    print_info "Which ingress controller are you using?"
    echo "1) NGINX Ingress Controller (with cert-manager for Let's Encrypt)"
    echo "2) GCE Ingress (with Google-managed certificates)"
    echo "3) Skip ingress deployment (configure manually later)"
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            print_info "Deploying NGINX Ingress with cert-manager..."

            # Check if cert-manager is installed
            if ! kubectl get namespace cert-manager &> /dev/null; then
                print_warning "cert-manager is not installed. Installing..."
                kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
                print_info "Waiting for cert-manager to be ready..."
                kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager
                kubectl wait --for=condition=available --timeout=300s deployment/cert-manager-webhook -n cert-manager
                kubectl wait --for=condition=available --timeout=300s deployment/cert-manager-cainjector -n cert-manager
                print_success "cert-manager installed"
            fi

            # Deploy NGINX ingress
            kubectl apply -f "$MONITORING_DIR/07-ingress-nginx-https.yaml"
            print_success "NGINX Ingress deployed"

            print_warning "Don't forget to:"
            print_warning "1. Update domain names in 07-ingress-nginx-https.yaml"
            print_warning "2. Point your DNS to the LoadBalancer IP"
            print_warning "3. Update email in ClusterIssuer for Let's Encrypt"
            ;;
        2)
            print_info "Deploying GCE Ingress with Google-managed certificates..."
            kubectl apply -f "$MONITORING_DIR/06-ingress-https.yaml"
            print_success "GCE Ingress deployed"

            print_warning "Don't forget to:"
            print_warning "1. Update domain names in 06-ingress-https.yaml"
            print_warning "2. Point your DNS to the LoadBalancer IP"
            print_warning "3. Wait 15-60 minutes for SSL certificate provisioning"
            ;;
        3)
            print_info "Skipping ingress deployment"
            ;;
        *)
            print_error "Invalid choice. Skipping ingress deployment."
            ;;
    esac
}

# Display access information
display_access_info() {
    echo ""
    print_banner
    print_success "Monitoring stack deployed successfully!"
    echo ""

    print_info "═══════════════════════════════════════════════════════"
    print_info "ACCESS INFORMATION"
    print_info "═══════════════════════════════════════════════════════"

    # Port-forward instructions
    echo ""
    print_info "To access locally (without ingress):"
    echo ""
    echo "  Prometheus:"
    echo -e "  ${GREEN}kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090${NC}"
    echo "  Then access: http://localhost:9090"
    echo ""
    echo "  Grafana:"
    echo -e "  ${GREEN}kubectl port-forward -n $NAMESPACE svc/grafana 3000:3000${NC}"
    echo "  Then access: http://localhost:3000"
    echo "  Default credentials: admin / admin123!"
    echo ""

    # Check for LoadBalancer IPs
    print_info "Checking for LoadBalancer IPs..."

    GRAFANA_IP=$(kubectl get svc grafana -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    PROMETHEUS_IP=$(kubectl get svc prometheus -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

    if [ ! -z "$GRAFANA_IP" ]; then
        echo -e "  ${GREEN}Grafana LoadBalancer IP: $GRAFANA_IP${NC}"
    fi

    if [ ! -z "$PROMETHEUS_IP" ]; then
        echo -e "  ${GREEN}Prometheus LoadBalancer IP: $PROMETHEUS_IP${NC}"
    fi

    echo ""
    print_info "═══════════════════════════════════════════════════════"
    print_info "NEXT STEPS"
    print_info "═══════════════════════════════════════════════════════"
    echo ""
    echo "  1. Update your DNS records to point to the LoadBalancer IP"
    echo "  2. Wait for SSL certificate provisioning (15-60 minutes for Google-managed certs)"
    echo "  3. Change default Grafana password (admin / admin123!)"
    echo "  4. Configure Prometheus alerts and notification channels"
    echo "  5. Import Grafana dashboards for your microservices"
    echo ""

    print_info "═══════════════════════════════════════════════════════"
    print_info "USEFUL COMMANDS"
    print_info "═══════════════════════════════════════════════════════"
    echo ""
    echo "  Check pod status:"
    echo -e "  ${GREEN}kubectl get pods -n $NAMESPACE${NC}"
    echo ""
    echo "  View logs:"
    echo -e "  ${GREEN}kubectl logs -f deployment/prometheus -n $NAMESPACE${NC}"
    echo -e "  ${GREEN}kubectl logs -f deployment/grafana -n $NAMESPACE${NC}"
    echo ""
    echo "  Check ingress status:"
    echo -e "  ${GREEN}kubectl get ingress -n $NAMESPACE${NC}"
    echo ""
    echo "  Check certificate status (if using cert-manager):"
    echo -e "  ${GREEN}kubectl get certificate -n $NAMESPACE${NC}"
    echo ""
}

# Main execution
main() {
    print_banner

    # Pre-flight checks
    check_kubectl
    check_cluster

    # Deploy components
    create_namespace
    deploy_prometheus
    deploy_grafana
    deploy_kube_state_metrics
    deploy_ingress

    # Display access information
    display_access_info
}

# Run main function
main
