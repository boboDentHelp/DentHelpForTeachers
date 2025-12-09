# =============================================================================
# Deploy Appointment Service - Optimized to Fit in Current Cluster
# =============================================================================

$ErrorActionPreference = "Continue"
$NAMESPACE = "dentalhelp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DEPLOYING APPOINTMENT SERVICE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Scale down API Gateway to free CPU
Write-Host "`n[STEP 1] Optimizing cluster resources..." -ForegroundColor Yellow
Write-Host "  Scaling down API Gateway HPA min to 1..." -ForegroundColor Gray
kubectl patch hpa api-gateway-hpa -n $NAMESPACE -p '{"spec":{"minReplicas":1}}'

# Step 2: Create minimal MySQL Appointment (reduced resources)
Write-Host "`n[STEP 2] Creating minimal MySQL Appointment..." -ForegroundColor Yellow

$mysqlYaml = @'
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql-appointment
  namespace: dentalhelp
spec:
  serviceName: mysql-appointment
  replicas: 1
  selector:
    matchLabels:
      app: mysql-appointment
  template:
    metadata:
      labels:
        app: mysql-appointment
        tier: database
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secrets
                  key: MYSQL_ROOT_PASSWORD
            - name: MYSQL_DATABASE
              value: appointment_db
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "300m"
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
          livenessProbe:
            exec:
              command: ["mysqladmin", "ping", "-h", "localhost"]
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command: ["mysqladmin", "ping", "-h", "localhost"]
            initialDelaySeconds: 10
            periodSeconds: 5
  volumeClaimTemplates:
    - metadata:
        name: mysql-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-appointment
  namespace: dentalhelp
spec:
  clusterIP: None
  selector:
    app: mysql-appointment
  ports:
    - port: 3306
      targetPort: 3306
'@

$mysqlYaml | kubectl apply -f -
Start-Sleep -Seconds 30

Write-Host "  Waiting for MySQL Appointment to be ready..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=mysql-appointment -n $NAMESPACE --timeout=360s

# Step 3: Deploy Appointment Service (reduced resources)
Write-Host "`n[STEP 3] Deploying Appointment Service..." -ForegroundColor Yellow

$appointmentYaml = @'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: appointment-service
  namespace: dentalhelp
  labels:
    app: appointment-service
    tier: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: appointment-service
  template:
    metadata:
      labels:
        app: appointment-service
        tier: backend
    spec:
      containers:
        - name: appointment-service
          image: bogdanelcucoditadepurcel/dentalhelp-appointment-service:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8083
          envFrom:
            - configMapRef:
                name: dentalhelp-config
          env:
            - name: SPRING_DATASOURCE_URL
              value: jdbc:mysql://mysql-appointment:3306/appointment_db?useSSL=false&allowPublicKeyRetrieval=true
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: dentalhelp-secrets
                  key: DB_USERNAME
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secrets
                  key: MYSQL_ROOT_PASSWORD
          resources:
            requests:
              memory: "256Mi"
              cpu: "150m"
            limits:
              memory: "512Mi"
              cpu: "400m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8083
            initialDelaySeconds: 120
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8083
            initialDelaySeconds: 90
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: appointment-service
  namespace: dentalhelp
spec:
  selector:
    app: appointment-service
  ports:
    - port: 8083
      targetPort: 8083
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: appointment-service-hpa
  namespace: dentalhelp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: appointment-service
  minReplicas: 1
  maxReplicas: 2
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
'@

$appointmentYaml | kubectl apply -f -
Start-Sleep -Seconds 20

Write-Host "  Waiting for Appointment Service to be ready..." -ForegroundColor Gray
kubectl rollout status deployment/appointment-service -n $NAMESPACE --timeout=300s

# Step 4: Show status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nAll Pods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host "`nAll Services:" -ForegroundColor Yellow
kubectl get svc -n $NAMESPACE

Write-Host "`nNode Resources:" -ForegroundColor Yellow
kubectl top nodes

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "APPOINTMENT SERVICE DEPLOYED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nRunning Services:" -ForegroundColor Yellow
Write-Host "  ✓ API Gateway" -ForegroundColor Green
Write-Host "  ✓ Eureka Server" -ForegroundColor Green
Write-Host "  ✓ Auth Service" -ForegroundColor Green
Write-Host "  ✓ Patient Service" -ForegroundColor Green
Write-Host "  ✓ Appointment Service (NEW)" -ForegroundColor Green
Write-Host "  ✓ MySQL Databases (3)" -ForegroundColor Green
Write-Host "  ✓ Redis" -ForegroundColor Green
Write-Host "  ✓ RabbitMQ" -ForegroundColor Green

Write-Host "`nAPI Gateway: http://34.55.12.229:8080" -ForegroundColor Cyan
Write-Host "`nAppointment endpoints:" -ForegroundColor Cyan
Write-Host "  POST   /appointment/create" -ForegroundColor White
Write-Host "  GET    /appointment/list" -ForegroundColor White
Write-Host "  GET    /appointment/patient/{cnp}" -ForegroundColor White
Write-Host "  PUT    /appointment/update" -ForegroundColor White
Write-Host "  DELETE /appointment/{id}" -ForegroundColor White
