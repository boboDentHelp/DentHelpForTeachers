#!/bin/bash

echo "================================================================"
echo "  DENTALHELP CLOUD DEPLOYMENT STATUS - GKE"
echo "================================================================"
echo ""

echo "1. CLUSTER INFORMATION"
echo "----------------------"
kubectl cluster-info
echo ""

echo "2. NODES (Cloud VMs running your services)"
echo "-------------------------------------------"
kubectl get nodes -o wide
echo ""

echo "3. NAMESPACES"
echo "-------------"
kubectl get namespaces
echo ""

echo "4. ALL RUNNING PODS (Microservices)"
echo "------------------------------------"
kubectl get pods -n dentalhelp -o wide
echo ""

echo "5. SERVICES (Network endpoints)"
echo "--------------------------------"
kubectl get services -n dentalhelp
echo ""

echo "6. INGRESS (HTTPS Load Balancer)"
echo "---------------------------------"
kubectl get ingress -n dentalhelp
echo ""

echo "7. PERSISTENT VOLUMES (Database storage)"
echo "-----------------------------------------"
kubectl get pvc -n dentalhelp
echo ""

echo "8. CERTIFICATES (Let's Encrypt SSL)"
echo "------------------------------------"
kubectl get certificates -n dentalhelp 2>/dev/null || echo "cert-manager not installed or no certificates"
echo ""

echo "9. DEPLOYMENTS (Scaling configuration)"
echo "---------------------------------------"
kubectl get deployments -n dentalhelp
echo ""

echo "10. REPLICA SETS (Pod management)"
echo "---------------------------------"
kubectl get replicasets -n dentalhelp
echo ""

echo "11. CONFIGMAPS (Configuration)"
echo "------------------------------"
kubectl get configmaps -n dentalhelp
echo ""

echo "12. SECRETS (Encrypted credentials)"
echo "------------------------------------"
kubectl get secrets -n dentalhelp
echo ""

echo "13. RESOURCE USAGE (CPU/Memory per pod)"
echo "----------------------------------------"
kubectl top pods -n dentalhelp 2>/dev/null || echo "Metrics server not available"
echo ""

echo "14. NODE RESOURCE USAGE"
echo "-----------------------"
kubectl top nodes 2>/dev/null || echo "Metrics server not available"
echo ""

echo "15. EUREKA SERVICE DISCOVERY STATUS"
echo "------------------------------------"
echo "Access Eureka dashboard at: http://$(kubectl get svc eureka-server -n dentalhelp -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo 'LoadBalancer-IP-Not-Found'):8761"
echo ""

echo "16. EXTERNAL ACCESS POINTS"
echo "--------------------------"
INGRESS_IP=$(kubectl get ingress dentalhelp-https-ingress -n dentalhelp -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$INGRESS_IP" ]; then
    echo "Main Application (HTTPS): https://dentalhelp.$INGRESS_IP.nip.io"
    echo "LoadBalancer IP: $INGRESS_IP"
else
    echo "Ingress not found or LoadBalancer IP not assigned"
fi
echo ""

echo "17. HORIZONTAL POD AUTOSCALERS (if configured)"
echo "-----------------------------------------------"
kubectl get hpa -n dentalhelp 2>/dev/null || echo "No HPA configured yet"
echo ""

echo "18. CLUSTER EVENTS (Recent activity)"
echo "-------------------------------------"
kubectl get events -n dentalhelp --sort-by='.lastTimestamp' | tail -20
echo ""

echo "================================================================"
echo "  DEPLOYMENT SUMMARY"
echo "================================================================"
echo "Cloud Provider: Google Cloud Platform (GCP)"
echo "Service: Google Kubernetes Engine (GKE)"
echo "Region: us-central1-a"
echo "Cluster Name: dentalhelp-cluster"
echo "Total Nodes: $(kubectl get nodes --no-headers | wc -l)"
echo "Total Pods: $(kubectl get pods -n dentalhelp --no-headers | wc -l)"
echo "Total Services: $(kubectl get svc -n dentalhelp --no-headers | wc -l)"
echo "HTTPS Enabled: YES (Let's Encrypt)"
echo "Auto-Scaling: YES (Cluster Autoscaler)"
echo "Load Balancer: NGINX Ingress Controller"
echo "Service Discovery: Netflix Eureka"
echo "Message Queue: RabbitMQ"
echo "Caching: Redis"
echo "Databases: MySQL x3 (auth, patient, appointment)"
echo "================================================================"
