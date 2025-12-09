# DentHelp Cloud Deployment - Technical Documentation

**Author:** Bogdan Calinescu
**Project:** DentHelp Dental Management System
**Date:** November 2025
**Deployment:** Google Kubernetes Engine (GKE)

---

## Executive Summary

I successfully deployed my DentHelp microservices application to Google Cloud Platform using Kubernetes orchestration. The system is now running on a 4-node cluster with auto-scaling capabilities, handling production-grade workloads with enterprise-level reliability.

**Live API Endpoint:** `http://34.55.12.229:8080`

---

## 1. Cloud Infrastructure Architecture

### 1.1 Google Kubernetes Engine (GKE) Cluster

I deployed my application to **Google Cloud Platform** using their managed Kubernetes service (GKE). This provides me with:

**Cluster Configuration:**
- **Name:** dentalhelp-cluster
- **Location:** us-central1-a (Iowa, USA datacenter)
- **Node Count:** 4 servers (e2-medium instances)
- **Total Capacity:** 8 vCPU, 16GB RAM
- **Kubernetes Version:** v1.33.5-gke.1201000

**Why I chose Google Cloud:**
1. **$300 Free Credits** - 3 months of free infrastructure
2. **Managed Service** - Google handles Kubernetes upgrades and maintenance
3. **Global Infrastructure** - Low latency worldwide
4. **Enterprise Grade** - Same infrastructure used by Spotify, Snapchat, Twitter
5. **Auto-scaling** - Can grow from 4 to 5 nodes automatically (limited by free tier quota)

**Cost Analysis:**
- Current monthly cost: ~$100
- My cost: $0 (using free credits)
- Free credits valid until: February 2025

---

## 2. Microservices Architecture

I built my application using a microservices architecture pattern with the following components:

### 2.1 Backend Services

**API Gateway** (Entry Point)
- **Purpose:** Single entry point for all client requests
- **Technology:** Spring Cloud Gateway
- **Resources:** 300m CPU, 512Mi RAM
- **Scaling:** 1-10 replicas (Horizontal Pod Autoscaler)
- **External IP:** 34.55.12.229:8080

**Auth Service** (Authentication & Authorization)
- **Purpose:** User registration, login, JWT token management
- **Port:** 8081
- **Database:** MySQL (auth_db)
- **Resources:** 200m CPU, 384Mi RAM
- **Scaling:** 1-3 replicas
- **Features:** BCrypt password hashing, JWT tokens, email verification

**Patient Service** (Patient Management)
- **Purpose:** Patient records, clinic information, services
- **Port:** 8082
- **Database:** MySQL (patient_db)
- **Resources:** 200m CPU, 384Mi RAM
- **Scaling:** 1-3 replicas
- **Features:** Clinic management, patient profiles, service catalog

**Appointment Service** (Scheduling)
- **Purpose:** Appointment booking, management, scheduling
- **Port:** 8083
- **Database:** MySQL (appointment_db)
- **Resources:** 75m CPU, 200Mi RAM
- **Scaling:** 1-2 replicas
- **Features:** Appointment CRUD, patient appointments, scheduling

### 2.2 Infrastructure Services

**Eureka Server** (Service Discovery)
- **Purpose:** Dynamic service registration and discovery
- **Port:** 8761
- **Resources:** 250m CPU, 512Mi RAM
- **Function:** All microservices register here, enables dynamic routing

**MySQL Databases** (Persistent Storage)
- **Instances:** 3 StatefulSets (auth, patient, appointment)
- **Version:** MySQL 8.0
- **Storage:** 5GB persistent volume per instance
- **Resources:** 100-200m CPU, 256-384Mi RAM each
- **Backup:** Persistent volumes survive pod restarts

**Redis** (Caching Layer)
- **Purpose:** Session caching, performance optimization
- **Version:** Redis Alpine
- **Resources:** 100m CPU, 128Mi RAM
- **Storage:** Persistent volume for cache data

**RabbitMQ** (Message Queue)
- **Purpose:** Asynchronous communication between services
- **Version:** 3.12-management-alpine
- **Ports:** 5672 (AMQP), 15672 (Management UI)
- **Resources:** 150m CPU, 256Mi RAM
- **Features:** Message persistence, management dashboard

---

## 3. Kubernetes Orchestration

### 3.1 What is Kubernetes and Why I Used It

Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

**Benefits I Gained:**
1. **Self-Healing:** Automatically restarts failed containers
2. **Auto-Scaling:** Scales services based on CPU/memory usage
3. **Load Balancing:** Distributes traffic across multiple pods
4. **Rolling Updates:** Zero-downtime deployments
5. **Service Discovery:** Automatic DNS resolution between services
6. **Resource Management:** Optimizes server utilization

### 3.2 Kubernetes Resources I Deployed

**Deployments** (Stateless Services)
- api-gateway
- auth-service
- patient-service
- appointment-service
- eureka-server
- redis
- rabbitmq

**StatefulSets** (Stateful Services)
- mysql-auth
- mysql-patient
- mysql-appointment

**Services** (Networking)
- ClusterIP services for internal communication
- LoadBalancer service for API Gateway (external access)

**ConfigMaps** (Configuration)
- dentalhelp-config: Environment variables, service URLs
- mysql-init-scripts: Database initialization SQL

**Secrets** (Sensitive Data)
- mysql-secrets: Database passwords
- dentalhelp-secrets: JWT secret, mail credentials

**Persistent Volume Claims** (Storage)
- 3x MySQL data volumes (5GB each)
- RabbitMQ message storage
- Redis cache storage

**Horizontal Pod Autoscalers** (Auto-scaling)
- api-gateway-hpa: 1-10 replicas
- auth-service-hpa: 1-3 replicas
- patient-service-hpa: 1-3 replicas
- appointment-service-hpa: 1-2 replicas

---

## 4. Auto-Scaling Configuration

### 4.1 Horizontal Pod Autoscaling (HPA)

I configured automatic scaling based on CPU and memory metrics:

**API Gateway Scaling:**
```yaml
minReplicas: 1
maxReplicas: 10
triggers:
  - CPU utilization > 70%
  - Memory utilization > 80%
```

**Microservices Scaling:**
```yaml
minReplicas: 1
maxReplicas: 2-3
triggers:
  - CPU utilization > 70%
  - Memory utilization > 80%
```

**How Auto-Scaling Works:**
1. Kubernetes monitors CPU/memory every 15 seconds
2. If average utilization > 70% for 3 minutes → Scale up
3. If average utilization < 50% for 5 minutes → Scale down
4. New pods start in ~30 seconds
5. Old pods gracefully terminate (30 second grace period)

**Real-World Example:**
```
Normal load:  100 users  → 1 auth-service pod  → 40% CPU
High load:    500 users  → 2 auth-service pods → 60% CPU
Peak load:    1000 users → 3 auth-service pods → 70% CPU
```

---

## 5. Docker & Container Registry

### 5.1 Docker Hub Integration

I used Docker Hub as my container registry to store built images.

**My Docker Hub Account:** `bogdanelcucoditadepurcel`

**Published Images:**
```
bogdanelcucoditadepurcel/dentalhelp-auth-service:latest
bogdanelcucoditadepurcel/dentalhelp-patient-service:latest
bogdanelcucoditadepurcel/dentalhelp-appointment-service:latest
bogdanelcucoditadepurcel/dentalhelp-api-gateway:latest
bogdanelcucoditadepurcel/dentalhelp-eureka-server:latest
```

### 5.2 CI/CD Pipeline (GitHub Actions)

I automated the build and deployment process using GitHub Actions:

**Pipeline Steps:**
1. **Code pushed to GitHub** → Triggers workflow
2. **Build Docker images** → Maven builds JAR, Docker builds image
3. **Run tests** → Unit tests, integration tests
4. **Push to Docker Hub** → Authenticated push with secrets
5. **Deploy to Kubernetes** → kubectl applies manifests (optional)

**Optimizations I Made:**
- **Path-based triggers:** Only rebuild changed services
- **Conditional jobs:** SAST/SonarQube only on main/develop
- **Concurrency control:** Cancel in-progress runs
- **Resource limits:** Optimized for 2000 GitHub Actions minutes/month

---

## 6. Security Implementation

### 6.1 Kubernetes Secrets Management

I secured sensitive data using Kubernetes Secrets:

**mysql-secrets:**
```yaml
MYSQL_ROOT_PASSWORD: <base64 encoded>
```

**dentalhelp-secrets:**
```yaml
DB_USERNAME: <base64 encoded>
JWT_SECRET: <base64 encoded>
MAIL_USERNAME: <base64 encoded>
MAIL_PASSWORD: <base64 encoded>
```

**How Services Access Secrets:**
```yaml
env:
  - name: MYSQL_ROOT_PASSWORD
    valueFrom:
      secretKeyRef:
        name: mysql-secrets
        key: MYSQL_ROOT_PASSWORD
```

**Security Benefits:**
- Secrets never appear in code or version control
- Encrypted at rest in Kubernetes
- Access controlled by Kubernetes RBAC
- Can rotate without redeploying services

### 6.2 Authentication & Authorization

**JWT Token Implementation:**
- HS256 algorithm
- 256-bit secret key
- Token expiration: 24 hours
- Refresh token support

**Password Security:**
- BCrypt hashing (cost factor: 10)
- Salted passwords
- No plain text storage

---

## 7. Persistent Storage

### 7.1 Storage Architecture

I configured persistent storage to ensure data survives pod restarts:

**Storage Class:** standard-rwo (Google Cloud Persistent Disk)

**Persistent Volumes:**
- mysql-auth-pvc: 5GB
- mysql-patient-pvc: 5GB
- mysql-appointment-pvc: 5GB
- rabbitmq-pvc: 2GB
- redis-pvc: 1GB

**How It Works:**
1. StatefulSet creates pod
2. Pod requests PersistentVolumeClaim
3. Kubernetes provisions Google Cloud Disk
4. Disk mounts to pod at `/var/lib/mysql`
5. Pod crashes → New pod created → Same disk mounted
6. **Data persists across restarts**

---

## 8. Service Discovery with Eureka

### 8.1 Service Registry Pattern

I implemented Netflix Eureka for dynamic service discovery:

**How Services Register:**
1. Service starts → Sends heartbeat to Eureka every 30 seconds
2. Eureka stores service location (IP:PORT)
3. If 3 heartbeats missed → Service marked as DOWN

**How Services Discover:**
1. API Gateway needs Auth Service
2. Queries Eureka: "Where is AUTH-SERVICE?"
3. Eureka responds: "10.100.3.25:8081"
4. API Gateway calls Auth Service
5. If Auth Service moves → Eureka automatically updates

**Benefits:**
- No hardcoded IPs
- Automatic failover
- Load balancing across multiple instances
- Zero-downtime updates

---

## 9. Networking & Load Balancing

### 9.1 Google Cloud Load Balancer

**External IP:** 34.55.12.229
**Type:** Layer 4 (TCP) Load Balancer
**Backend:** API Gateway pods

**Features:**
- Health checks every 10 seconds
- Automatic failover
- DDoS protection
- Global Anycast IP

### 9.2 Internal Service Mesh

**DNS Resolution:**
```
auth-service → auth-service.dentalhelp.svc.cluster.local
mysql-auth → mysql-auth.dentalhelp.svc.cluster.local
```

**Service Communication:**
```
API Gateway (port 8080)
  ↓
Auth Service (port 8081)
  ↓
MySQL Auth (port 3306)
```

---

## 10. Resource Optimization

### 10.1 The Challenge

**Initial Problem:**
- Needed: 4GB CPU across all services
- Available: 3.2GB CPU (4 nodes × 800m usable per node)
- Status: Insufficient resources

### 10.2 My Optimization Strategy

**What I Reduced:**
1. API Gateway: 500m → 300m CPU (-40%)
2. MySQL Appointment: 200m → 100m CPU (-50%)
3. Appointment Service: 150m → 75m CPU (-50%)
4. Redis: 200m → 100m CPU (-50%)

**Final Resource Allocation:**
```
Total CPU Requests: ~2.0 vCPU
Total CPU Limits: ~6.0 vCPU
Total Memory Requests: ~4.5 GB
Total Memory Limits: ~9.0 GB
```

**Result:** All services running on 4 nodes with room for scaling!

---

## 11. Database Initialization

I created automated database initialization scripts:

**Auth Database:**
- 4 test accounts (Admin, Radiologist, 2 Patients)
- Password: "password123" (BCrypt hashed)
- Email verification enabled

**Patient Database:**
- Clinic information (DentHelp Dental Clinic)
- 10 dental services with pricing
- Operating hours configuration

**Initialization Method:**
- ConfigMap with SQL scripts
- kubectl exec to run SQL on MySQL pods
- INSERT IGNORE for idempotency

---

## 12. Monitoring & Health Checks

### 12.1 Liveness Probes

I configured liveness probes to detect crashed services:

**Example:**
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8081
  initialDelaySeconds: 120
  periodSeconds: 10
  failureThreshold: 3
```

**Behavior:** 3 failed checks → Pod restarted automatically

### 12.2 Readiness Probes

I configured readiness probes to prevent traffic to starting services:

**Example:**
```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8081
  initialDelaySeconds: 90
  periodSeconds: 5
```

**Behavior:** Pod receives traffic only when ready

---

## 13. API Documentation

### 13.1 Available Endpoints

**Authentication Service (http://34.55.12.229:8080/auth/**)**
- POST /auth/register - Register new user
- POST /auth/login - Login and get JWT token
- POST /auth/verify-email - Email verification
- GET /auth/profile - Get user profile

**Patient Service (http://34.55.12.229:8080/patient/**)**
- GET /patient/clinic - Get clinic information
- GET /patient/services - Get available services
- GET /patient/{cnp} - Get patient by CNP
- POST /patient/create - Create patient record

**Appointment Service (http://34.55.12.229:8080/appointment/**)**
- GET /appointment/list - Get all appointments
- POST /appointment/create - Create appointment
- GET /appointment/patient/{cnp} - Get patient appointments
- PUT /appointment/update - Update appointment
- DELETE /appointment/{id} - Cancel appointment

---

## 14. Test Credentials

I initialized the system with these test accounts:

**Admin Account:**
- Email: admin@denthelp.ro
- Password: password123
- Role: ADMIN
- CNP: 1850515123456

**Radiologist Account:**
- Email: radiologist@denthelp.ro
- Password: password123
- Role: RADIOLOGIST
- CNP: 1750315123456

**Patient Accounts:**
- Email: patient@denthelp.ro / test@denthelp.ro
- Password: password123
- Role: PATIENT

---

## 15. Deployment Commands Reference

**Deploy Complete Stack:**
```powershell
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-storage.yaml
kubectl apply -f 10-rabbitmq-fixed.yaml
kubectl apply -f 11-redis.yaml
kubectl apply -f 12-mysql-essential.yaml
kubectl apply -f 20-eureka-server.yaml
kubectl apply -f 21-api-gateway-production.yaml
kubectl apply -f 22-essential-services-optimized.yaml
```

**Initialize Databases:**
```powershell
powershell -ExecutionPolicy Bypass -File init-databases.ps1
```

**Check Status:**
```powershell
kubectl get pods -n dentalhelp
kubectl get svc -n dentalhelp
kubectl top nodes
```

---

## 16. Achievements & Technical Skills Demonstrated

**Cloud Technologies:**
- ✅ Google Kubernetes Engine (GKE)
- ✅ Google Cloud Load Balancer
- ✅ Persistent Disk storage

**Container Technologies:**
- ✅ Docker containerization
- ✅ Docker Hub registry
- ✅ Multi-stage Docker builds

**Kubernetes Expertise:**
- ✅ Deployments, StatefulSets, Services
- ✅ Horizontal Pod Autoscaling (HPA)
- ✅ ConfigMaps and Secrets management
- ✅ Persistent Volume Claims (PVCs)
- ✅ Resource requests and limits
- ✅ Health checks (liveness, readiness)

**Microservices Architecture:**
- ✅ Service discovery (Eureka)
- ✅ API Gateway pattern
- ✅ Circuit breaker pattern
- ✅ Database per service

**DevOps Practices:**
- ✅ CI/CD with GitHub Actions
- ✅ Infrastructure as Code
- ✅ Automated database initialization
- ✅ Resource optimization

**Security:**
- ✅ Kubernetes Secrets
- ✅ JWT authentication
- ✅ BCrypt password hashing
- ✅ RBAC (Role-Based Access Control)

---

## 17. Conclusion

I successfully deployed a production-grade microservices application to Google Cloud using Kubernetes. The system demonstrates enterprise-level architecture with:

- **High Availability:** Self-healing, auto-restart
- **Scalability:** Auto-scaling from 1 to 10 replicas
- **Reliability:** Persistent storage, health checks
- **Security:** Encrypted secrets, JWT tokens
- **Performance:** Redis caching, load balancing
- **Maintainability:** Service discovery, zero-downtime updates

**Live System:** http://34.55.12.229:8080

This deployment showcases my ability to work with modern cloud-native technologies and implement industry best practices in microservices architecture.

---

**Bogdan Calinescu**
*Cloud & Microservices Developer*
November 2025
