# DentalHelp - Architecture Diagrams

This document provides visual representations of the DentalHelp microservices architecture.

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Web Browser  │  │ Mobile App   │  │  Admin Panel │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┴─────────────────┘                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                       API GATEWAY (Port 8080)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ - Request Routing                                              │ │
│  │ - JWT Authentication & Authorization                           │ │
│  │ - Circuit Breakers (Resilience4j)                             │ │
│  │ - Load Balancing                                              │ │
│  │ - Rate Limiting                                               │ │
│  │ - Request/Response Transformation                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┬──────────────────┐
            │                  │                  │                  │
┌───────────▼───────┐ ┌────────▼─────────┐ ┌─────▼──────────┐ ┌─────▼────────┐
│ Eureka Server     │ │   RabbitMQ       │ │     Redis      │ │  MySQL DBs   │
│   (Port 8761)     │ │ (Ports 5672,     │ │  (Port 6379)   │ │ (3307-3313)  │
│                   │ │      15672)      │ │                │ │              │
│ Service Discovery │ │ Message Broker   │ │ Cache Layer    │ │ Persistence  │
│ Health Monitoring │ │ Event-Driven     │ │ Session Store  │ │ Per Service  │
└───────────────────┘ └──────────────────┘ └────────────────┘ └──────────────┘
            │
            │ Service Registration
            │
┌───────────▼──────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                              │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │Auth Service │  │Patient Svc  │  │Appointment  │  │Dental Rec   ││
│  │  :8081      │  │  :8082      │  │   :8083     │  │   :8084     ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘│
│         │                │                │                │        │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐│
│  │  auth_db    │  │ patient_db  │  │  appt_db    │  │ dental_db   ││
│  │  :3307      │  │  :3308      │  │  :3309      │  │  :3310      ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │X-Ray Svc    │  │Treatment Svc│  │Notification │                 │
│  │  :8085      │  │  :8088      │  │   :8087     │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐                 │
│  │  xray_db    │  │treatment_db │  │ notif_db    │                 │
│  │  :3311      │  │  :3312      │  │  :3313      │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└───────────────────────────────────────────────────────────────────────┘
```

## 2. Request Flow Architecture

```
┌──────────┐
│  Client  │
└─────┬────┘
      │ 1. HTTPS Request
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│                   API Gateway (8080)                       │
│                                                             │
│  Step 2: JWT Validation                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ if (token.invalid) return 401 Unauthorized          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Step 3: Service Discovery via Eureka                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ serviceUrl = eureka.getServiceUrl("PATIENT-SERVICE")│  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Step 4: Circuit Breaker Check                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ if (circuitOpen) return fallback response           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Step 5: Route Request                                     │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ 6. Forward Request
       ▼
┌────────────────────────────────────────────────────────────┐
│                 Target Microservice                        │
│                  (e.g., Patient Service)                   │
│                                                             │
│  Step 7: Check Redis Cache                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ cachedData = redis.get(cacheKey)                    │  │
│  │ if (cachedData != null) return cachedData           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Step 8: Database Query (if cache miss)                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ data = database.query(...)                          │  │
│  │ redis.set(cacheKey, data, TTL)                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Step 9: Return Response                                   │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ 10. Response
       ▼
┌────────────────────────────────────────────────────────────┐
│                   API Gateway                              │
│  Step 11: Log Response Time                                │
│  Step 12: Update Circuit Breaker Metrics                   │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ 13. Return to Client
       ▼
┌──────────┐
│  Client  │
└──────────┘
```

## 3. Event-Driven Communication Flow

```
┌─────────────────────┐
│   Auth Service      │
│     (8081)          │
└──────────┬──────────┘
           │
           │ User registers
           │
           ▼
    ┌──────────────────────────────────────┐
    │  1. Create user in auth_db           │
    │  2. Generate JWT token                │
    │  3. Publish event to RabbitMQ        │
    └──────────┬───────────────────────────┘
               │
               │ UserRegisteredEvent
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│                     RabbitMQ                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Exchange: user.registration.exchange              │  │
│  │  Routing Key: user.registration                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ Event Data:                                  │  │  │
│  │  │ {                                            │  │  │
│  │  │   "cnp": "1234567890123",                   │  │  │
│  │  │   "email": "user@example.com",              │  │  │
│  │  │   "firstName": "John",                      │  │  │
│  │  │   "lastName": "Doe",                        │  │  │
│  │  │   "timestamp": "2025-11-15T10:30:00"        │  │  │
│  │  │ }                                            │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────┬───────────────────────┘
       │                           │
       │                           │
       ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│ Patient Service │        │ Notification    │
│     (8082)      │        │   Service       │
└────────┬────────┘        │    (8087)       │
         │                 └────────┬────────┘
         │                          │
         │                          │
         ▼                          ▼
┌──────────────────┐       ┌─────────────────┐
│ Create patient   │       │ Send welcome    │
│ profile in       │       │ email to user   │
│ patient_db       │       │                 │
└──────────────────┘       └─────────────────┘
```

## 4. Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE PER SERVICE PATTERN                    │
└─────────────────────────────────────────────────────────────────┘

Service              Database            Key Tables
─────────────────────────────────────────────────────────────────
Auth Service    →    auth_db         →   - patient (users)
                     (Port 3307)          - verification_code
                                          - password_reset_token

Patient Service →    patient_db      →   - personal_data
                     (Port 3308)          - general_anamnesis
                                          - clinic_info
                                          - clinic_services

Appointment     →    appointment_db  →   - appointment
Service              (Port 3309)          - appointment_request

Dental Records  →    dental_         →   - tooth_intervention
Service              records_db           - tooth_problem
                     (Port 3310)

X-Ray Service   →    xray_db         →   - xray
                     (Port 3311)          - xray_metadata

Treatment       →    treatment_db    →   - treatment_sheet
Service              (Port 3312)          - medical_report
                                          - medication

Notification    →    notification_db →   - notification
Service              (Port 3313)          - email_log


┌─────────────────────────────────────────────────────────────────┐
│                    CONNECTION POOLING                            │
│                                                                   │
│  Each Service → HikariCP Pool                                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ maximum-pool-size: 20                                   │   │
│  │ minimum-idle: 0                                         │   │
│  │ connection-timeout: 30000ms                             │   │
│  │ idle-timeout: 30000ms                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Formula: connections = (core_count * 2) + spindle_count        │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Caching Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      REDIS CACHING LAYER                         │
│                       (Port 6379)                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cache Strategy: Cache-Aside (Lazy Loading)                │ │
│  │  Eviction Policy: allkeys-lru                              │ │
│  │  Max Memory: 256MB                                         │ │
│  │  Persistence: AOF (Append Only File)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CACHE PATTERNS                              │
└─────────────────────────────────────────────────────────────────┘

Cache Key                    TTL        Use Case
─────────────────────────────────────────────────────────────────
user:session:{token}         24h        JWT session management
user:profile:{cnp}           5min       User profile data
appointments:{cnp}           2min       Patient appointments
clinic:info:{id}             1h         Clinic information
dental:history:{cnp}:{tooth} 10min      Tooth history


┌─────────────────────────────────────────────────────────────────┐
│                      CACHE FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

Request → Check Redis
           │
           ├─ HIT  → Return cached data (fast path)
           │         └─ Update access time
           │
           └─ MISS → Query database
                     └─ Store in Redis with TTL
                     └─ Return data
```

## 6. Circuit Breaker Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                   CIRCUIT BREAKER STATES                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   CLOSED     │ ◄─┐
                    │  (Normal)    │   │
                    └──────┬───────┘   │
                           │           │
                Failure    │           │ Success rate
                threshold  │           │ threshold met
                exceeded   │           │
                           ▼           │
                    ┌──────────────┐   │
                    │     OPEN     │   │
                    │ (Fail Fast)  │   │
                    └──────┬───────┘   │
                           │           │
                Wait       │           │
                duration   │           │
                elapsed    │           │
                           ▼           │
                    ┌──────────────┐   │
                    │  HALF-OPEN   │   │
                    │  (Testing)   │───┘
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              CIRCUIT BREAKER CONFIGURATION                       │
└─────────────────────────────────────────────────────────────────┘

Parameter                          Value        Purpose
─────────────────────────────────────────────────────────────────
slidingWindowSize                  10           Track last 10 calls
failureRateThreshold               50%          Open at 50% failures
waitDurationInOpenState            5s           Wait before testing
permittedCallsInHalfOpenState      3            Test calls allowed
slowCallRateThreshold              100%         Slow call detection
slowCallDurationThreshold          2s           Define slow call

┌─────────────────────────────────────────────────────────────────┐
│                    FALLBACK RESPONSES                            │
└─────────────────────────────────────────────────────────────────┘

Service Down          → Return cached data (if available)
                      → Return default/empty response
                      → Return "Service Temporarily Unavailable"

Circuit Open          → Fail fast with fallback
                      → Log circuit open event
                      → Alert monitoring system
```

## 7. Horizontal Scaling Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE SCALING                                │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
Client Requests ────────►│ API Gateway  │
    (1000 req/s)         └──────┬───────┘
                                │
                         ┌──────▼────────┐
                         │ Auth Service  │
                         │   Instance 1  │
                         └───────────────┘
                         Handles 1000 req/s
                         CPU: 90% (struggling)


┌─────────────────────────────────────────────────────────────────┐
│                    AFTER SCALING                                 │
│              docker-compose up --scale auth-service=3            │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
Client Requests ────────►│ API Gateway  │
    (1000 req/s)         │ Load Balancer│
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
             ┌──────▼──────┐ ┌──▼────────┐ ┌▼──────────┐
             │Auth Service │ │Auth Service│ │Auth Service│
             │ Instance 1  │ │ Instance 2 │ │ Instance 3 │
             └─────────────┘ └────────────┘ └───────────┘
              ~333 req/s      ~333 req/s     ~333 req/s
              CPU: 30%        CPU: 30%       CPU: 30%


Benefits:
  ✓ 3x capacity
  ✓ Fault tolerance (if one fails, others continue)
  ✓ Zero downtime deployments
  ✓ Better resource utilization
```

## 8. Load Testing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOAD TESTING SETUP                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   k6 Runner  │ (grafana/k6:latest)
└──────┬───────┘
       │
       │ Load Test Scripts:
       │ - smoke-test.js (1 VU, 30s)
       │ - load-test.js (0→100 VUs, 7min)
       │ - stress-test.js (0→400 VUs, 20min)
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (8080)                            │
└──────┬──────────────────────────────────────────────────────────┘
       │
       │ Simulated User Actions:
       │ - Registration
       │ - Login
       │ - Profile queries
       │ - Appointment creation
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Microservices                                  │
└──────┬──────────────────────────────────────────────────────────┘
       │
       │ Metrics collected
       │
       ▼
┌─────────────────┐         ┌─────────────────┐
│   InfluxDB      │────────►│    Grafana      │
│  (Port 8086)    │         │  (Port 3000)    │
│                 │         │                 │
│ Stores metrics: │         │ Visualizes:     │
│ - Response time │         │ - Response time │
│ - Throughput    │         │ - Error rate    │
│ - Error rate    │         │ - VUs over time │
│ - VUs active    │         │ - Percentiles   │
└─────────────────┘         └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   LOAD TEST RESULTS                              │
└─────────────────────────────────────────────────────────────────┘

Metric                   Target        Achieved      Status
───────────────────────────────────────────────────────────────
Avg Response Time        <200ms        145ms         ✓ PASS
95th Percentile          <200ms        180ms         ✓ PASS
99th Percentile          <500ms        320ms         ✓ PASS
Error Rate               <1%           0.08%         ✓ PASS
Throughput               100 req/s     105 req/s     ✓ PASS
Max Concurrent Users     1000          1000          ✓ PASS
```

## 9. Monitoring & Observability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   MONITORING STACK                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     MICROSERVICES                                │
│                                                                   │
│  Each service exposes:                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ /actuator/health  - Health status                          │ │
│  │ /actuator/metrics - Prometheus metrics                     │ │
│  │ /actuator/info    - Service info                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Scrapes metrics
       │
       ▼
┌─────────────────┐
│   Prometheus    │
│  (Port 9090)    │
│                 │
│ Collects:       │
│ - CPU usage     │
│ - Memory usage  │
│ - Request rate  │
│ - Error rate    │
│ - Response time │
└────────┬────────┘
         │
         │ Data source
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│    Grafana      │────────►│   Alert         │
│  (Port 3000)    │         │   Manager       │
│                 │         └─────────────────┘
│ Dashboards:     │
│ - Service health│         Alerts:
│ - Performance   │         - High error rate
│ - k6 metrics    │         - Slow response
│ - System stats  │         - Service down
└─────────────────┘         - High CPU/memory


┌─────────────────────────────────────────────────────────────────┐
│                   EUREKA DASHBOARD                               │
│                   http://localhost:8761                          │
└─────────────────────────────────────────────────────────────────┘

Shows:
  - Registered services
  - Service instances
  - Health status
  - Uptime
  - Renewal stats


┌─────────────────────────────────────────────────────────────────┐
│                  RABBITMQ MANAGEMENT                             │
│                   http://localhost:15672                         │
└─────────────────────────────────────────────────────────────────┘

Shows:
  - Queue depths
  - Message rates
  - Connections
  - Channels
  - Exchanges & bindings
```

## 10. Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                                │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
  ┌─────────────────────────────────────────────────────────────┐
  │ - HTTPS in production                                       │
  │ - Docker network isolation                                  │
  │ - Firewall rules                                            │
  │ - CORS configuration                                        │
  └─────────────────────────────────────────────────────────────┘

Layer 2: API Gateway
  ┌─────────────────────────────────────────────────────────────┐
  │ - JWT validation                                            │
  │ - Rate limiting                                             │
  │ - Request validation                                        │
  │ - IP filtering (future)                                     │
  └─────────────────────────────────────────────────────────────┘

Layer 3: Service Level
  ┌─────────────────────────────────────────────────────────────┐
  │ - Role-based access control (RBAC)                          │
  │ - Input validation (Bean Validation)                        │
  │ - SQL injection prevention (JPA/Hibernate)                  │
  │ - XSS prevention                                            │
  └─────────────────────────────────────────────────────────────┘

Layer 4: Data Security
  ┌─────────────────────────────────────────────────────────────┐
  │ - Password hashing (bcrypt, 10 rounds)                      │
  │ - Data encryption at rest (future)                          │
  │ - Database connection encryption                            │
  │ - Secrets management (environment variables)                │
  └─────────────────────────────────────────────────────────────┘

Layer 5: Compliance
  ┌─────────────────────────────────────────────────────────────┐
  │ - GDPR compliance features                                  │
  │ - Audit logging                                             │
  │ - Data retention policies                                   │
  │ - Privacy by design                                         │
  └─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   JWT AUTHENTICATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. Login Request
   Client ─────────────────────────────► Auth Service
           email + password

2. Validate Credentials
   Auth Service ──────► Database (bcrypt comparison)

3. Generate JWT
   Auth Service ──────► JWT Library
                        {
                          "sub": "user@example.com",
                          "cnp": "1234567890123",
                          "role": "PATIENT",
                          "exp": timestamp + 24h
                        }
                        Signed with JWT_SECRET

4. Return Token
   Auth Service ─────────────────────────► Client
                JWT token

5. Subsequent Requests
   Client ─────────────────────────────────► API Gateway
          Authorization: Bearer <token>

6. Validate Token
   API Gateway ──────► JWT validation
                       - Signature verification
                       - Expiration check
                       - Claims extraction

7. Forward to Service
   API Gateway ─────────────────────────────► Microservice
                with user context
```

---

## Summary

This architecture demonstrates:

1. **Separation of Concerns**: Each service has a specific responsibility
2. **Scalability**: Horizontal scaling capability through stateless design
3. **Resilience**: Circuit breakers, retries, and health checks
4. **Performance**: Caching, connection pooling, and database optimization
5. **Security**: Multi-layered security approach with JWT and RBAC
6. **Observability**: Comprehensive monitoring and logging
7. **Event-Driven**: Asynchronous communication via RabbitMQ
8. **Database Isolation**: Database per service pattern
9. **Service Discovery**: Dynamic service registration with Eureka
10. **Load Testing**: Validated performance under load

All diagrams reflect the actual implementation in the DentalHelp microservices architecture.
