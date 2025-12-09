# DentalHelp Kubernetes Deployment Guide
## Windows + Google Cloud (GKE) - Free Tier

Complete guide to deploy the DentalHelp microservices on Google Kubernetes Engine (GKE) using Windows.

> **Free Credits**: Google Cloud gives **$300 free credits** for 90 days - more than enough for your demo!

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Google Cloud Setup](#2-google-cloud-setup)
3. [Install Tools on Windows](#3-install-tools-on-windows)
4. [Create Kubernetes Cluster](#4-create-kubernetes-cluster)
5. [Docker Hub Setup](#5-docker-hub-setup)
6. [Configure GitHub Secrets](#6-configure-github-secrets)
7. [Deploy to Kubernetes](#7-deploy-to-kubernetes)
8. [Access Your Application](#8-access-your-application)
9. [Show Your Teacher](#9-show-your-teacher)
10. [Cleanup (Save Credits)](#10-cleanup-save-credits)

---

## 1. Prerequisites

Before starting, you need:
- ✅ Windows 10/11 PC
- ✅ Google account (Gmail)
- ✅ Credit/Debit card (for verification only - won't be charged)
- ✅ Docker Hub account
- ✅ GitHub account with your repository

---

## 2. Google Cloud Setup

### Step 2.1: Create Google Cloud Account

1. Go to: https://cloud.google.com/free
2. Click **"Get started for free"**
3. Sign in with your Google account
4. Enter your country and accept terms
5. Enter payment info (required for verification, but you get **$300 FREE credits**)
6. Complete the setup

> ⚠️ **Important**: You won't be charged! Google requires a card for verification but gives you $300 free credits. You can set budget alerts to avoid any charges.

### Step 2.2: Create a New Project

1. Go to: https://console.cloud.google.com
2. Click the project dropdown at the top (next to "Google Cloud")
3. Click **"NEW PROJECT"**
4. Enter:
   - Project name: `dentalhelp-demo`
   - Click **"CREATE"**
5. Wait for project creation (30 seconds)
6. Select your new project from the dropdown

### Step 2.3: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable these APIs (click each → click "ENABLE"):
   - **Kubernetes Engine API**
   - **Container Registry API**
   - **Cloud Build API**

---

## 3. Install Tools on Windows

### Step 3.1: Install Google Cloud CLI

1. Download the installer:
   https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe

2. Run the installer:
   - Check "Install Bundled Python"
   - Check "Add gcloud CLI to PATH"
   - Click **Install**

3. After installation, a terminal opens. Run:
```powershell
gcloud init
```

4. Follow the prompts:
   - Sign in with your Google account (browser opens)
   - Select your project: `dentalhelp-demo`
   - Select a default region: `us-central1-a` (or closest to you)

### Step 3.2: Install kubectl

Open **PowerShell as Administrator** and run:

```powershell
# Install kubectl via gcloud
gcloud components install kubectl

# Verify installation
kubectl version --client
```

### Step 3.3: Install Git (if not installed)

Download and install from: https://git-scm.com/download/win

### Step 3.4: Verify All Tools

Open a **new PowerShell window** and run:

```powershell
# Check all tools are installed
gcloud --version
kubectl version --client
git --version
```

You should see version numbers for all three.

---

## 4. Create Kubernetes Cluster

### Step 4.1: Create GKE Cluster (via Command Line)

Open **PowerShell** and run:

```powershell
# Set your project
gcloud config set project dentalhelp-demo

# Create the Kubernetes cluster (takes 5-10 minutes)
gcloud container clusters create dentalhelp-cluster `
    --zone us-central1-a `
    --num-nodes 3 `
    --machine-type e2-medium `
    --disk-size 30GB `
    --enable-autoscaling `
    --min-nodes 2 `
    --max-nodes 5
```

> ☕ This takes about 5-10 minutes. Good time for a coffee break!

### Step 4.2: Connect kubectl to Your Cluster

```powershell
# Get credentials for kubectl
gcloud container clusters get-credentials dentalhelp-cluster --zone us-central1-a

# Verify connection
kubectl get nodes
```

You should see 3 nodes with "Ready" status:
```
NAME                                               STATUS   ROLES    AGE   VERSION
gke-dentalhelp-cluster-default-pool-xxxxx-xxxx     Ready    <none>   5m    v1.28.x
gke-dentalhelp-cluster-default-pool-xxxxx-xxxx     Ready    <none>   5m    v1.28.x
gke-dentalhelp-cluster-default-pool-xxxxx-xxxx     Ready    <none>   5m    v1.28.x
```

### Step 4.3: Get Kubeconfig for GitHub Actions

```powershell
# Get the kubeconfig content and encode it
$kubeconfig = Get-Content "$env:USERPROFILE\.kube\config" -Raw
$encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($kubeconfig))

# Copy to clipboard
$encoded | Set-Clipboard

# Also save to a file (backup)
$encoded | Out-File -FilePath "$env:USERPROFILE\Desktop\kube-config-base64.txt"

Write-Host "Kubeconfig copied to clipboard and saved to Desktop!"
Write-Host "File: $env:USERPROFILE\Desktop\kube-config-base64.txt"
```

> 📋 The base64-encoded kubeconfig is now in your clipboard and saved to your Desktop.

---

## 5. Docker Hub Setup

### Step 5.1: Create Docker Hub Account

1. Go to: https://hub.docker.com/signup
2. Create an account (remember your username!)
3. Verify your email

### Step 5.2: Create Access Token

1. Log in to Docker Hub
2. Go to: https://hub.docker.com/settings/security
3. Click **"New Access Token"**
4. Enter:
   - Description: `github-actions-dentalhelp`
   - Permissions: **Read, Write, Delete**
5. Click **"Generate"**
6. **COPY THE TOKEN NOW** (it's shown only once!)
7. Save it somewhere safe (Notepad)

---

## 6. Configure GitHub Secrets

### Step 6.1: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:

| Secret Name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username (e.g., `johndoe123`) |
| `DOCKERHUB_TOKEN` | The access token you copied |
| `KUBE_CONFIG` | Paste the base64 kubeconfig from your clipboard |

### Step 6.2: Verify Secrets

You should see 3 secrets listed:
- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN
- KUBE_CONFIG

---

## 7. Deploy to Kubernetes

### Step 7.1: Clone Your Repository

Open PowerShell:

```powershell
# Navigate to where you want the project
cd $env:USERPROFILE\Documents

# Clone the repository
git clone https://github.com/boboDentHelp/DenthelpSecond.git

# Enter the directory
cd DenthelpSecond
```

### Step 7.2: Update Configuration with Your Docker Hub Username

```powershell
# Set your Docker Hub username
$DOCKERHUB_USER = "YOUR_DOCKERHUB_USERNAME"  # <-- CHANGE THIS!

# Navigate to kubernetes folder
cd deployment\kubernetes

# Update all YAML files with your username
Get-ChildItem -Filter "*.yaml" | ForEach-Object {
    (Get-Content $_.FullName) -replace '\$\{DOCKERHUB_USERNAME\}', $DOCKERHUB_USER | Set-Content $_.FullName
}

# Update kustomization.yaml
(Get-Content kustomization.yaml) -replace 'YOUR_DOCKERHUB_USERNAME', $DOCKERHUB_USER | Set-Content kustomization.yaml

Write-Host "Updated all files with username: $DOCKERHUB_USER"
```

### Step 7.3: Update Secrets (Important!)

Edit the secrets file with secure values:

```powershell
# Open secrets file in Notepad
notepad 01-secrets.yaml
```

Generate secure passwords (run this in PowerShell):
```powershell
# Generate random password and show base64
$password = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | ForEach-Object {[char]$_})
$base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($password))
Write-Host "Password: $password"
Write-Host "Base64: $base64"
```

Update these values in `01-secrets.yaml`:
- `DB_PASSWORD`: Use the base64 value generated above
- `MYSQL_ROOT_PASSWORD`: Same base64 value
- `JWT_SECRET`: Generate a 32+ character string and convert to base64

### Step 7.4: Deploy Everything

```powershell
# Make sure you're in the kubernetes folder
cd $env:USERPROFILE\Documents\DenthelpSecond\deployment\kubernetes

# Step 1: Create namespace and configs
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-storage.yaml

Write-Host "Waiting for configs to apply..."
Start-Sleep -Seconds 5

# Step 2: Deploy infrastructure
Write-Host "Deploying RabbitMQ..."
kubectl apply -f 10-rabbitmq.yaml

Write-Host "Deploying Redis..."
kubectl apply -f 11-redis.yaml

Write-Host "Deploying MySQL databases..."
kubectl apply -f 12-mysql.yaml

Write-Host "Waiting for infrastructure (2 minutes)..."
Start-Sleep -Seconds 120

# Step 3: Deploy Eureka Server
Write-Host "Deploying Eureka Server..."
kubectl apply -f 20-eureka-server.yaml
Start-Sleep -Seconds 60

# Step 4: Deploy API Gateway
Write-Host "Deploying API Gateway..."
kubectl apply -f 21-api-gateway.yaml
Start-Sleep -Seconds 30

# Step 5: Deploy all microservices
Write-Host "Deploying Microservices..."
kubectl apply -f 22-microservices.yaml

# Step 6: Deploy Ingress
Write-Host "Deploying Ingress..."
kubectl apply -f 30-ingress.yaml

Write-Host "`n✅ Deployment complete! Waiting for pods to start..."
```

### Step 7.5: Check Deployment Status

```powershell
# Watch pods come up (press Ctrl+C to stop)
kubectl get pods -n dentalhelp -w
```

Wait until all pods show "Running" status (takes 5-10 minutes).

```powershell
# Check all resources
kubectl get all -n dentalhelp
```

---

## 8. Access Your Application

### Step 8.1: Get the External IP

```powershell
# Get the API Gateway external IP
kubectl get svc api-gateway -n dentalhelp
```

Look for the **EXTERNAL-IP** column. It might show `<pending>` for a minute, then an IP like `34.123.45.67`.

```powershell
# Wait for external IP (run until you see an IP)
kubectl get svc api-gateway -n dentalhelp -w
```

### Step 8.2: Test Your Application

Once you have the external IP:

```powershell
# Set the external IP
$EXTERNAL_IP = "YOUR_EXTERNAL_IP"  # <-- Replace with actual IP

# Test the health endpoint
Invoke-RestMethod -Uri "http://${EXTERNAL_IP}:8080/actuator/health"

# Or open in browser
Start-Process "http://${EXTERNAL_IP}:8080/actuator/health"
```

### Step 8.3: Access Eureka Dashboard

```powershell
# Port-forward Eureka to localhost
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp
```

Open in browser: http://localhost:8761

You should see all your microservices registered!

### Step 8.4: Access RabbitMQ Management

```powershell
# In a new PowerShell window
kubectl port-forward svc/rabbitmq 15672:15672 -n dentalhelp
```

Open in browser: http://localhost:15672
- Username: `guest`
- Password: `guest`

---

## 9. Show Your Teacher

### What to Demo

1. **Google Cloud Console**: https://console.cloud.google.com
   - Show your Kubernetes cluster
   - Show the nodes running

2. **Kubernetes Dashboard**:
```powershell
# Open GKE dashboard in browser
Start-Process "https://console.cloud.google.com/kubernetes/workload"
```

3. **Running Pods**:
```powershell
kubectl get pods -n dentalhelp
```

4. **Architecture Diagram** (show this):
```
                    Internet
                        │
                        ▼
            ┌───────────────────┐
            │   Load Balancer   │ (Google Cloud)
            │   (External IP)   │
            └─────────┬─────────┘
                      │
                      ▼
            ┌───────────────────┐
            │    API Gateway    │ (2-10 replicas, auto-scaling)
            └─────────┬─────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Eureka  │ │  Auth   │ │ Patient │ ... (7 more services)
    │ Server  │ │ Service │ │ Service │
    └─────────┘ └────┬────┘ └────┬────┘
                     │           │
              ┌──────┴───────────┴──────┐
              │                         │
              ▼                         ▼
        ┌──────────┐             ┌──────────┐
        │  MySQL   │             │ RabbitMQ │
        │ (7 DBs)  │             │  Redis   │
        └──────────┘             └──────────┘
```

5. **Scaling Demo**:
```powershell
# Scale up the API Gateway
kubectl scale deployment api-gateway --replicas=5 -n dentalhelp

# Watch new pods appear
kubectl get pods -n dentalhelp -l app=api-gateway -w

# Scale back down
kubectl scale deployment api-gateway --replicas=2 -n dentalhelp
```

6. **Auto-scaling** (HPA):
```powershell
kubectl get hpa -n dentalhelp
```

7. **Service Discovery** (Eureka):
   - Open http://localhost:8761 (with port-forward running)
   - Show all services registered

### Key Points to Mention to Your Teacher

- ✅ **Microservices Architecture**: 9 independent services
- ✅ **Container Orchestration**: Kubernetes manages all containers
- ✅ **Auto-scaling**: API Gateway scales from 2-10 pods based on load
- ✅ **Service Discovery**: Eureka automatically detects services
- ✅ **Message Queue**: RabbitMQ for async communication
- ✅ **Caching**: Redis for performance
- ✅ **Database per Service**: Each microservice has its own MySQL
- ✅ **CI/CD Pipeline**: GitHub Actions automatically builds and deploys
- ✅ **Load Balancing**: Google Cloud Load Balancer distributes traffic
- ✅ **Health Checks**: Kubernetes monitors and restarts unhealthy pods

---

## 10. Cleanup (Save Credits)

### After Your Demo - DELETE THE CLUSTER!

> ⚠️ **Important**: The cluster costs ~$5-10/day. Delete it when not using!

### Option A: Delete via Command Line

```powershell
# Delete the cluster (saves money!)
gcloud container clusters delete dentalhelp-cluster --zone us-central1-a --quiet

# Verify deletion
gcloud container clusters list
```

### Option B: Delete via Google Cloud Console

1. Go to: https://console.cloud.google.com/kubernetes/list
2. Select your cluster
3. Click **DELETE**
4. Confirm deletion

### Recreate Later

When you need to demo again:

```powershell
# Recreate cluster (5-10 minutes)
gcloud container clusters create dentalhelp-cluster `
    --zone us-central1-a `
    --num-nodes 3 `
    --machine-type e2-medium `
    --disk-size 30GB

# Reconnect kubectl
gcloud container clusters get-credentials dentalhelp-cluster --zone us-central1-a

# Redeploy everything
cd $env:USERPROFILE\Documents\DenthelpSecond\deployment\kubernetes
kubectl apply -f .
```

---

## Troubleshooting

### Problem: "gcloud: command not found"
```powershell
# Restart PowerShell or run:
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Problem: Pods stuck in "Pending"
```powershell
# Check what's wrong
kubectl describe pod <pod-name> -n dentalhelp

# Usually means not enough resources - check nodes
kubectl get nodes
kubectl describe nodes
```

### Problem: Pods in "CrashLoopBackOff"
```powershell
# Check logs
kubectl logs <pod-name> -n dentalhelp

# Check previous logs if pod keeps restarting
kubectl logs <pod-name> -n dentalhelp --previous
```

### Problem: External IP shows "<pending>"
Wait 2-3 minutes. If still pending:
```powershell
# Check service events
kubectl describe svc api-gateway -n dentalhelp
```

### Problem: Can't connect to cluster
```powershell
# Re-authenticate
gcloud auth login
gcloud container clusters get-credentials dentalhelp-cluster --zone us-central1-a
```

---

## Cost Summary

| Resource | Cost | Notes |
|----------|------|-------|
| GKE Cluster | ~$0 | Free tier covers management |
| 3x e2-medium nodes | ~$75/month | But you have $300 free |
| Load Balancer | ~$18/month | Included in free tier |
| Storage (90GB) | ~$10/month | For databases |

**Total**: ~$100/month, but **FREE for first 90 days** with $300 credits!

> 💡 **Tip**: Delete cluster when not demoing to save credits!

---

## Quick Reference Commands

```powershell
# Check cluster status
kubectl get nodes

# Check all pods
kubectl get pods -n dentalhelp

# Check services and IPs
kubectl get svc -n dentalhelp

# View pod logs
kubectl logs -l app=api-gateway -n dentalhelp

# Scale deployment
kubectl scale deployment api-gateway --replicas=5 -n dentalhelp

# Port-forward for local access
kubectl port-forward svc/eureka-server 8761:8761 -n dentalhelp

# Delete cluster (save money!)
gcloud container clusters delete dentalhelp-cluster --zone us-central1-a
```

---

**Good luck with your demo! 🎓**
