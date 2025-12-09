# Security Requirements - DentHelp Healthcare Platform
**Author:** Bogdan Calinescu
**Date:** November 2025
**Status:** Student Project → Production-Ready (In Progress)

---

## Document Purpose

This document defines the security requirements for my DentHelp microservices platform. It's written honestly - showing what I have now, what I'm implementing, and what I'll need for real production use.

**Related Documents:**
- `CIA-TRIAD-SECURITY-ASSESSMENT.md` - Current security assessment (6.5/10)
- `OWASP-SECURITY-COMPLIANCE.md` - OWASP Top 10 compliance (65/100)
- `GDPR-COMPLIANCE-POLICY.md` - GDPR compliance status (25/100)

---

## 1. Current Security Status Summary

### ✅ What I Have Implemented

**Authentication & Authorization:**
- JWT-based authentication (HS256)
- BCrypt password hashing (work factor 10)
- Role-Based Access Control (RBAC): ADMIN, RADIOLOGIST, PATIENT
- Spring Security with `@PreAuthorize` annotations
- Token-based stateless authentication

**Input Validation:**
- Spring `@Valid` annotations on all DTOs
- CNP format validation (13 digits)
- Email and phone validation
- SQL injection prevention (JPA parameterized queries)

**Network Security:**
- API Gateway as single entry point
- Internal services not exposed externally
- Kubernetes network isolation
- Service discovery via Eureka

**Infrastructure Security:**
- Google Kubernetes Engine (managed control plane)
- Auto-scaling (HPA) for resilience
- Persistent storage with Google Cloud Disks
- Health checks and self-healing

**Dependency Management:**
- OWASP Dependency-Check in CI/CD
- GitHub Dependabot alerts
- Spring Boot managed dependencies

### ❌ Critical Gaps (Being Addressed)

**Priority 1 - CRITICAL:**
1. **NO HTTPS** - All traffic is HTTP (clear text) ⚠️ **IMPLEMENTING NOW**
2. **NO BACKUPS** - No automated database backups
3. **NO MONITORING** - No Prometheus/Grafana or alerts ⚠️ **IMPLEMENTING SOON**

**Priority 2 - HIGH:**
4. No database encryption at rest
5. No MFA for admin accounts
6. No rate limiting on API Gateway
7. No centralized logging (no ELK stack)
8. No comprehensive audit trail

**Priority 3 - MEDIUM:**
9. Weak password policy (8 chars, no complexity)
10. No disaster recovery plan
11. No security event monitoring
12. Data in US not EU (GDPR issue)

---

## 2. Authentication & Authorization Requirements

### 2.1 JWT Token Requirements

**Current Implementation:**
```
Algorithm: HS256 (HMAC with SHA-256)
Expiration: 24 hours
Secret: Stored in Kubernetes secret
Issuer: auth-service
Claims: email, roles, cnp
```

**Security Assessment:**
- ✅ Good: Stateless, no server-side sessions
- ✅ Good: Secret not hardcoded
- ❌ Issue: 24-hour expiration too long
- ❌ Issue: No refresh token mechanism
- ❌ Issue: Secret rotation not implemented

**Requirements:**

| Requirement | Current | Should Be | Priority | Status |
|-------------|---------|-----------|----------|--------|
| Signing Algorithm | HS256 | HS256 or RS256 | - | ✅ Acceptable |
| Access Token TTL | 24 hours | 15-30 minutes | HIGH | ❌ To Fix |
| Refresh Token | None | Implemented | HIGH | ❌ Missing |
| Secret Rotation | Manual | Automated (90 days) | MEDIUM | ❌ Missing |
| Token Revocation | None | Blacklist/Redis | MEDIUM | ❌ Missing |

**Recommended Changes:**
```java
// Current
jwt.expiration=86400000  // 24 hours

// Should be
jwt.access-token.expiration=900000    // 15 minutes
jwt.refresh-token.expiration=2592000000  // 30 days
```

### 2.2 Password Requirements

**Current Policy:**
```
Minimum Length: 8 characters
Complexity: None enforced
History: No (can reuse passwords)
Expiration: Never
Account Lockout: None
```

**Security Assessment:**
- ✅ Good: BCrypt hashing (work factor 10)
- ✅ Good: No plain text storage
- ❌ Weak: No complexity requirements
- ❌ Missing: No account lockout
- ❌ Missing: No password reset flow

**Requirements:**

| Requirement | Current | Should Be | Priority | Status |
|-------------|---------|-----------|----------|--------|
| Min Length | 8 chars | 12 chars | MEDIUM | ❌ To Fix |
| Complexity | None | Upper+Lower+Digit+Special | MEDIUM | ❌ To Fix |
| History | None | Last 5 passwords | LOW | ❌ Missing |
| Expiration | Never | 90 days (admin only) | LOW | ❌ Missing |
| Lockout | None | 5 failed attempts | HIGH | ❌ Missing |
| Reset Flow | None | Email-based reset | HIGH | ❌ Missing |

**Implementation Plan:**
```java
// Add to PatientRegistrationDTO
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$",
    message = "Password must be 12+ chars with upper, lower, digit, special char"
)
private String password;
```

### 2.3 Multi-Factor Authentication (MFA)

**Current Status:** ❌ NOT IMPLEMENTED

**Requirement:**
- **ADMIN accounts:** MFA MANDATORY
- **RADIOLOGIST accounts:** MFA RECOMMENDED
- **PATIENT accounts:** MFA OPTIONAL

**Implementation Options:**
1. TOTP (Google Authenticator, Authy)
2. SMS-based codes
3. Email-based codes

**Priority:** HIGH (for admin accounts)
**Status:** Not implemented, planned for Phase 2

### 2.4 Role-Based Access Control (RBAC)

**Current Roles:**
```
ADMIN:
- Full system access
- User management
- View all patient data
- Modify all records

RADIOLOGIST:
- View patient data (any patient)
- Upload/view X-rays
- Add dental interventions
- Cannot modify user accounts

PATIENT:
- View own data only (CNP-based filtering)
- Book appointments
- View own X-rays and interventions
- Cannot access other patients' data
```

**Security Assessment:**
- ✅ Good: Clear role separation
- ✅ Good: Patient data isolation (CNP filtering)
- ❌ Issue: No IP whitelisting for admin
- ❌ Issue: No session timeout enforcement

**Requirements:**

| Control | Current | Required | Priority | Status |
|---------|---------|----------|----------|--------|
| Role Definition | ✅ 3 roles | ✅ Adequate | - | ✅ Done |
| Patient Data Isolation | ✅ CNP check | ✅ Enforced | - | ✅ Done |
| Admin IP Whitelist | ❌ None | ✅ Required | MEDIUM | ❌ To Add |
| Endpoint Authorization | ✅ @PreAuthorize | ✅ Enforced | - | ✅ Done |
| Session Timeout | ❌ None | ✅ 30 min idle | HIGH | ❌ To Add |

---

## 3. Data Protection Requirements

### 3.1 Encryption Requirements

#### 3.1.1 Data in Transit

**Current Status:**
```
❌ NO HTTPS - All traffic is HTTP
❌ All data sent in clear text:
   - Credentials (email/password)
   - JWT tokens
   - Patient data (CNP, medical records)
   - Medical images
```

**CRITICAL REQUIREMENT:**

| Requirement | Status | Priority | Timeline |
|-------------|--------|----------|----------|
| HTTPS on LoadBalancer | ⚠️ **IMPLEMENTING** | **CRITICAL** | **In Progress** |
| TLS 1.2 minimum | ❌ Not configured | CRITICAL | Week 1 |
| TLS 1.3 preferred | ❌ Not configured | MEDIUM | Future |
| HSTS Header | ❌ Not configured | HIGH | Week 1 |
| Cert Auto-renewal | ❌ Not configured | HIGH | Week 1 |

**Implementation Plan:**
```yaml
# Will update: deployment/kubernetes/21-api-gateway-production.yaml
# Add: SSL certificate (Let's Encrypt or Google-managed)
# Add: HTTPS redirect
# Add: HSTS header
```

**Success Criteria:**
- [ ] API accessible via https://... (not http://)
- [ ] Valid SSL certificate (no browser warnings)
- [ ] HTTP automatically redirects to HTTPS
- [ ] A+ rating on SSL Labs test

#### 3.1.2 Data at Rest

**Current Status:**
```
❌ MySQL databases: NO ENCRYPTION
❌ Persistent volumes: NO ENCRYPTION
✅ Passwords: BCrypt hashed (good!)
❌ JWT secrets: Base64 in Kubernetes secrets (weak)
```

**Requirements:**

| Data Type | Current | Required | Priority | Status |
|-----------|---------|----------|----------|--------|
| Database Files | Plain text | Encrypted | HIGH | ❌ To Implement |
| Persistent Volumes | Plain text | Encrypted | HIGH | ❌ To Implement |
| Passwords | BCrypt ✅ | BCrypt | - | ✅ Done |
| JWT Secrets | K8s secret | Vault/KMS | MEDIUM | ❌ To Migrate |
| Backups | N/A (no backups!) | Encrypted | CRITICAL | ❌ Missing |

**Recommended Implementation:**
1. Enable Google Cloud KMS for disk encryption
2. Use MySQL transparent data encryption (TDE) - requires MySQL 8.0.16+
3. Migrate secrets to HashiCorp Vault or Google Secret Manager

#### 3.1.3 Field-Level Encryption

**Current Status:** ❌ NOT IMPLEMENTED

**Requirements for Production:**

| Field | Contains | Encryption Required? | Priority |
|-------|----------|---------------------|----------|
| CNP | Romanian Personal ID | YES | HIGH |
| Email | Contact info | RECOMMENDED | MEDIUM |
| Phone | Contact info | RECOMMENDED | MEDIUM |
| Medical Records | Diagnoses, treatments | YES | HIGH |
| X-ray Images | Medical images | RECOMMENDED | MEDIUM |

**Status:** Not implemented, planned for Phase 2 (after HTTPS and backups)

### 3.2 Data Classification

**Classification Levels:**

| Level | Data Types | Access | Encryption Required |
|-------|-----------|--------|---------------------|
| **RESTRICTED** | CNP, Medical diagnoses, X-rays | Admin, assigned radiologist only | YES (at rest + transit) |
| **CONFIDENTIAL** | Patient names, contact info, appointments | Admin, radiologists, patient (own) | YES (in transit) |
| **INTERNAL** | System logs, metrics | Admin only | RECOMMENDED |
| **PUBLIC** | None currently | N/A | N/A |

### 3.3 Backup Requirements

**Current Status:** ❌ **NO BACKUPS** (Critical vulnerability!)

**If database crashes or is corrupted: ALL DATA IS LOST**

**Requirements:**

| Backup Type | Frequency | Retention | Status | Priority |
|-------------|-----------|-----------|--------|----------|
| MySQL Auth DB | Daily | 30 days | ❌ Missing | **CRITICAL** |
| MySQL Patient DB | Daily | 7 years (legal req) | ❌ Missing | **CRITICAL** |
| MySQL Appointment DB | Daily | 3 years | ❌ Missing | **CRITICAL** |
| Kubernetes Configs | On change | 1 year | ✅ Git | ✅ Done |
| Secrets | Monthly | 1 year | ❌ Missing | HIGH |

**Planned Implementation:**
```yaml
# Option 1: CronJob with mysqldump
# Option 2: Google Cloud SQL automated backups
# Option 3: Velero for Kubernetes backup

# Requirement:
- Automated daily backups
- Encrypted backup storage
- Off-site backup location
- Tested restore procedure
- Backup monitoring/alerts
```

**Success Criteria:**
- [ ] Automated daily backups running
- [ ] Successfully tested restore from backup
- [ ] Backups stored off-cluster
- [ ] Retention policy enforced
- [ ] Backup failure alerts configured

### 3.4 Data Retention Requirements

**Legal Requirements (Romania Healthcare):**
- Medical records: **7 years** after last visit
- X-ray images: **7 years**
- Appointment history: **3 years**
- User accounts (inactive): **2 years**

**Current Implementation:** ❌ NO AUTOMATED RETENTION

Data stays forever unless manually deleted.

**Requirements:**
```sql
-- Need to implement:
DELETE FROM patient WHERE last_visit < DATE_SUB(NOW(), INTERVAL 7 YEAR);
DELETE FROM appointments WHERE appointment_date < DATE_SUB(NOW(), INTERVAL 3 YEAR);
-- Etc.
```

**Status:** Not implemented, planned for Phase 2

---

## 4. Network Security Requirements

### 4.1 API Gateway Security

**Current Configuration:**
```
Protocol: HTTP ❌ (should be HTTPS)
Port: 8080
LoadBalancer: External IP (34.55.12.229)
Rate Limiting: None ❌
CORS: Not configured properly ❌
Security Headers: Missing ❌
```

**Requirements:**

#### 4.1.1 HTTPS Configuration

| Requirement | Status | Priority | Timeline |
|-------------|--------|----------|----------|
| SSL/TLS Certificate | ⚠️ **IMPLEMENTING** | **CRITICAL** | **Week 1** |
| Force HTTPS | ❌ Missing | CRITICAL | Week 1 |
| HSTS Header | ❌ Missing | HIGH | Week 1 |
| Certificate Monitoring | ❌ Missing | MEDIUM | Week 2 |

#### 4.1.2 Security Headers

**Required Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

**Current:** ❌ None configured
**Priority:** HIGH
**Status:** To implement with HTTPS

#### 4.1.3 Rate Limiting

**Current Status:** ❌ NOT IMPLEMENTED

**Requirements:**

| Endpoint | Rate Limit | Window | Action |
|----------|-----------|--------|--------|
| /auth/login | 5 attempts | 15 min | Block IP |
| /auth/register | 3 accounts | 1 hour | Block IP |
| API calls (authenticated) | 1000 requests | 1 hour | HTTP 429 |
| API calls (unauthenticated) | 100 requests | 1 hour | HTTP 429 |

**Priority:** HIGH
**Status:** Not implemented, planned for Phase 2

**Implementation Options:**
1. Spring Cloud Gateway rate limiter
2. Kubernetes Ingress with rate limiting
3. Google Cloud Armor

#### 4.1.4 CORS Policy

**Current:** Allows all origins (too permissive)

**Required:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "https://denthelp.ro",           // Production frontend
            "https://www.denthelp.ro",
            "http://localhost:5173"           // Development only
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        return new CorsFilter(source);
    }
}
```

**Priority:** MEDIUM
**Status:** To tighten after HTTPS

### 4.2 Internal Network Security

**Current Implementation:**
```
✅ API Gateway: External access via LoadBalancer
✅ All backend services: Internal only (ClusterIP)
✅ MySQL: Internal only, not exposed
✅ RabbitMQ: Internal only
✅ Redis: Internal only
✅ Eureka: Internal only
```

**Security Assessment:** ✅ GOOD - Only API Gateway is exposed

**Requirements:** Current implementation is adequate.

### 4.3 DDoS Protection

**Current Status:** ❌ NONE (Vulnerable to DDoS)

**Requirements:**

| Protection | Status | Priority | Cost |
|------------|--------|----------|------|
| Rate Limiting | ❌ Missing | HIGH | Free |
| Google Cloud Armor | ❌ Missing | MEDIUM | ~$50/month |
| IP Blocking | ❌ Missing | MEDIUM | Free |
| Geographic Restrictions | ❌ Missing | LOW | Free |

**Priority:** MEDIUM
**Status:** Planned for Phase 2

---

## 5. Monitoring & Logging Requirements

### 5.1 Monitoring Requirements

**Current Status:** ⚠️ **PARTIAL** (Have for docker-compose, NOT for Kubernetes!)

**What I Have:**
- ✅ Prometheus + Grafana for LOCAL docker-compose
- ✅ InfluxDB + k6 for load testing
- ✅ Node Exporter + cAdvisor for container metrics
- ✅ Working dashboards and alerts (locally)
- See: `docker-compose.monitoring.yml`

**What I DON'T Have:**
- ❌ Monitoring deployed to GKE cluster
- ❌ Can't see Kubernetes pod status
- ❌ Can't monitor cloud deployment
- ❌ No alerts for production issues

**What This Means:**
- Local dev environment: Fully monitored ✅
- GKE production cluster: Flying blind ❌

**CRITICAL REQUIREMENTS:**

#### 5.1.1 Basic Monitoring (⚠️ IMPLEMENTING SOON)

| Metric | Current | Required | Priority | Timeline |
|--------|---------|----------|----------|----------|
| Service Uptime | ❌ None | ✅ Prometheus | HIGH | **Week 2** |
| Pod Status | ❌ Manual kubectl | ✅ Dashboard | HIGH | Week 2 |
| API Latency | ❌ None | ✅ p95/p99 | HIGH | Week 2 |
| Error Rate | ❌ None | ✅ 4xx/5xx | HIGH | Week 2 |
| Resource Usage | ❌ None | ✅ CPU/Memory | HIGH | Week 2 |

**Implementation Plan:**
- **Option A:** Adapt existing Prometheus/Grafana to Kubernetes (free, use what I have)
- **Option B:** Use kube-prometheus-stack Helm chart (easier setup, free)
- **Option C:** Google Cloud Monitoring (managed, ~$30/month, no cluster resources)
- **Decision:** Prefer Option A or B (free), will be decided in next session

#### 5.1.2 Alerting

**Required Alerts:**

| Alert | Condition | Action | Priority |
|-------|-----------|--------|----------|
| Service Down | Pod not ready > 5 min | Email/Slack | CRITICAL |
| High Error Rate | 5xx > 1% for 5 min | Email | HIGH |
| Database Down | MySQL not ready | Email/SMS | CRITICAL |
| High CPU | Node CPU > 90% for 10 min | Email | MEDIUM |
| Cert Expiring | SSL cert < 30 days | Email | HIGH |

**Status:** Not implemented, will set up with monitoring

### 5.2 Logging Requirements

**Current Status:**
```
✅ Basic logs: kubectl logs (30-day retention)
❌ Centralized logging: None
❌ Log analysis: None
❌ Log search: Manual grep only
❌ Security event logs: Not separated
```

**Requirements:**

#### 5.2.1 Application Logging

| Requirement | Current | Needed | Priority |
|-------------|---------|--------|----------|
| Log Level | INFO | INFO (prod), DEBUG (dev) | ✅ Done |
| Structured Logs | Plain text | JSON | MEDIUM |
| Centralized Storage | ❌ None | ELK or Cloud Logging | MEDIUM |
| Log Retention | 30 days | 1 year (security logs) | HIGH |
| PII Sanitization | ❌ None | Mask CNP/emails | HIGH |

**Log Format Needed:**
```json
{
  "timestamp": "2025-11-29T10:30:00Z",
  "level": "INFO",
  "service": "auth-service",
  "event": "LOGIN_SUCCESS",
  "user": "295******3456",  // Masked CNP
  "ip": "203.0.113.42",
  "duration_ms": 245
}
```

#### 5.2.2 Security Event Logging

**Events That MUST Be Logged:**

| Event | Current | Required | Priority |
|-------|---------|----------|----------|
| Login attempts (success/fail) | ❌ Not logged | ✅ Required | HIGH |
| Password changes | ❌ Not logged | ✅ Required | HIGH |
| Patient data access | ❌ Not logged | ✅ Required | HIGH (GDPR) |
| Admin actions | ❌ Not logged | ✅ Required | HIGH |
| API errors (5xx) | ✅ Basic | ✅ Enhanced | MEDIUM |
| Failed auth attempts | ❌ Not logged | ✅ Required | HIGH |

**Priority:** HIGH (especially for GDPR compliance)
**Status:** Not implemented, planned for Phase 2

#### 5.2.3 Audit Trail

**GDPR Requirement:** Log all access to personal data

**Required Information:**
- Who (user CNP/email)
- What (operation: VIEW, UPDATE, DELETE, EXPORT)
- When (timestamp)
- Where (IP address, service)
- Result (success/failure)

**Current Status:** ❌ NOT IMPLEMENTED
**Priority:** HIGH (GDPR requirement)
**Status:** Planned for Phase 2

### 5.3 Log Analysis

**Current:** ❌ Manual grep only

**Requirements:**
- Search across all services
- Filter by timestamp, service, user
- Aggregate error rates
- Detect anomalies

**Implementation Options:**
1. ELK Stack (Elasticsearch, Logstash, Kibana)
2. Google Cloud Logging
3. Grafana Loki

**Priority:** MEDIUM
**Status:** Planned for Phase 3

---

## 6. Compliance Requirements

### 6.1 GDPR Requirements

**Detailed assessment in:** `GDPR-COMPLIANCE-POLICY.md`

**Critical Technical Requirements:**

| Requirement | Status | Priority | Notes |
|-------------|--------|----------|-------|
| Data in EU region | ❌ US (us-central1-a) | HIGH | Need to migrate |
| HTTPS encryption | ⚠️ Implementing | **CRITICAL** | **In progress** |
| Data export API | ❌ Missing | HIGH | Right of access |
| Data deletion API | ❌ Missing | HIGH | Right to erasure |
| Privacy policy | ❌ Missing | MEDIUM | Legal requirement |
| Consent management | ❌ Missing | MEDIUM | Record consents |
| Audit logging | ❌ Missing | HIGH | Track data access |
| DPO appointed | ❌ None (I'm a student) | MEDIUM | Need for production |

**Migration Plan:**
```powershell
# Current: us-central1-a (USA)
# Should be: europe-west1 (Belgium) or europe-west3 (Frankfurt)

# Migration complexity: MEDIUM
# Estimated time: 4-8 hours
# Cost impact: Same
```

### 6.2 Romanian Healthcare Compliance

**Data Retention Requirements:**

| Data Type | Retention Period | Current | Status |
|-----------|-----------------|---------|--------|
| Medical records | 7 years | Forever ❌ | Need automation |
| X-ray images | 7 years | Forever ❌ | Need automation |
| Prescriptions | 3 years | Forever ❌ | Need automation |
| Appointment history | 3 years | Forever ❌ | Need automation |

**Requirements:**
- Automated deletion after retention period
- Audit trail of deletions
- Legal hold mechanism (if investigation)

**Priority:** MEDIUM
**Status:** Planned for Phase 3

### 6.3 Security Incident Response

**Current:** ❌ NO INCIDENT RESPONSE PLAN

**Required Components:**
1. Incident detection (monitoring/alerts)
2. Incident classification (severity levels)
3. Response procedures (who to notify, what to do)
4. GDPR breach notification (72 hours to notify authority)
5. Post-incident review

**Priority:** MEDIUM
**Status:** Planned for Phase 2

---

## 7. Implementation Roadmap

### Phase 1: Critical Security (Current - Next 2 Weeks)

**Week 1:**
- [⚠️] **HTTPS on LoadBalancer** ← IN PROGRESS
  - Get SSL certificate (Let's Encrypt or Google-managed)
  - Update LoadBalancer configuration
  - Add security headers (HSTS, CSP, etc.)
  - Test HTTPS endpoints
  - Update all documentation

- [ ] **Automated Database Backups**
  - Set up daily mysqldump CronJob
  - Configure backup storage (Google Cloud Storage)
  - Test restore procedure
  - Set up backup monitoring

**Week 2:**
- [⚠️] **Adapt Monitoring to Kubernetes** ← NEXT PRIORITY
  - I already have Prometheus + Grafana for docker-compose
  - Create Kubernetes YAML files for Prometheus/Grafana
  - OR use kube-prometheus-stack Helm chart
  - Deploy to GKE cluster
  - Configure to scrape my pods
  - Migrate existing dashboards
  - Set up critical alerts (service down, high errors)
  - Test alerting

- [ ] **Update Security Documentation**
  - Update CIA score after HTTPS (6.5/10 → 7.5/10)
  - Update OWASP score (65/100 → 70/100)
  - Document new security measures

**Success Criteria:**
- ✅ API accessible via HTTPS with valid certificate
- ✅ Automated daily backups running and tested
- ✅ Monitoring dashboard showing all services
- ✅ Alerts configured and tested

### Phase 2: High Priority Security (Month 2)

**Authentication Improvements:**
- [ ] Implement shorter JWT token expiration (15 min access tokens)
- [ ] Add refresh token mechanism
- [ ] Implement account lockout after failed attempts
- [ ] Add MFA for ADMIN accounts

**Network Security:**
- [ ] Implement rate limiting on API Gateway
- [ ] Tighten CORS policy
- [ ] Add IP whitelisting for admin endpoints

**Logging & Monitoring:**
- [ ] Set up centralized logging (ELK or Cloud Logging)
- [ ] Implement security event logging
- [ ] Add audit trail for data access (GDPR)
- [ ] PII sanitization in logs

**GDPR:**
- [ ] Migrate cluster to EU region (europe-west1)
- [ ] Implement data export API
- [ ] Implement data deletion API
- [ ] Create privacy policy

**Success Criteria:**
- ✅ MFA working for admin accounts
- ✅ Rate limiting preventing abuse
- ✅ Centralized logging with search capability
- ✅ GDPR data subject rights implemented

### Phase 3: Medium Priority & Polish (Month 3-4)

**Data Protection:**
- [ ] Implement database encryption at rest
- [ ] Implement field-level encryption for CNP
- [ ] Set up secrets management (Vault or Secret Manager)
- [ ] Encrypt backups

**Compliance:**
- [ ] Automated data retention enforcement
- [ ] Incident response plan documentation
- [ ] Security awareness training materials
- [ ] Regular security audits

**Performance & Reliability:**
- [ ] Database replication for HA
- [ ] DDoS protection (Cloud Armor)
- [ ] Disaster recovery plan
- [ ] Regular penetration testing

**Nice to Have:**
- [ ] WAF (Web Application Firewall)
- [ ] SIEM integration
- [ ] Automated security scanning
- [ ] Bug bounty program

---

## 8. Security Testing Requirements

### 8.1 Ongoing Testing

**What I Should Test Regularly:**

| Test Type | Frequency | Current | Priority |
|-----------|-----------|---------|----------|
| Dependency vulnerabilities | Weekly | ✅ OWASP check | ✅ Done |
| SSL/TLS configuration | Monthly | ❌ No HTTPS yet | After HTTPS |
| Authentication bypass | Monthly | ❌ Manual only | MEDIUM |
| SQL injection | Monthly | ❌ Manual only | MEDIUM |
| XSS vulnerabilities | Monthly | ❌ Not tested | LOW |
| API fuzzing | Quarterly | ❌ Not done | LOW |

### 8.2 Penetration Testing

**Current:** ❌ Never done

**Requirements:**
- Annual penetration testing (when production-ready)
- Scope: All external endpoints
- Report: Written findings with remediation

**Priority:** LOW (not needed for student project)
**Status:** Future consideration

---

## 9. Security Metrics & KPIs

### 9.1 Target Security Scores

| Assessment | Current | Target (3 months) | Target (6 months) |
|------------|---------|-------------------|-------------------|
| CIA Triad | 6.5/10 | 7.5/10 | 8.5/10 |
| OWASP Top 10 | 65/100 | 75/100 | 85/100 |
| GDPR Compliance | 25/100 | 50/100 | 75/100 |

### 9.2 Operational Metrics

**After implementing monitoring, track:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Service Uptime | 99.5% | < 99% |
| API Response Time (p95) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Failed Auth Attempts | < 10/hour | > 50/hour |
| Cert Expiry | > 30 days | < 7 days |

---

## 10. Summary

### Current Security Posture
**Overall: 6.5/10 - Good foundation, critical gaps**

**Strengths:**
- ✅ Strong authentication (JWT + BCrypt)
- ✅ Good access control (RBAC)
- ✅ SQL injection prevention
- ✅ Dependency scanning
- ✅ Cloud infrastructure (GKE)

**Critical Weaknesses:**
- ❌ NO HTTPS (all traffic in clear text)
- ❌ NO BACKUPS (data loss risk)
- ❌ NO MONITORING (can't detect issues)

### Implementation Priority

**Right Now (Week 1):**
1. ⚠️ **HTTPS** ← IMPLEMENTING
2. **Backups** ← CRITICAL

**Next (Week 2):**
3. ⚠️ **Monitoring** ← IMPLEMENTING
4. **Centralized logging**

**Soon (Month 2):**
5. Rate limiting
6. MFA for admins
7. GDPR features
8. EU region migration

### Success Criteria

**Phase 1 Complete When:**
- [ ] API accessible via HTTPS (not HTTP)
- [ ] Daily automated backups working
- [ ] Monitoring dashboard operational
- [ ] Critical alerts configured
- [ ] CIA score improved to 7.5/10

**Production Ready When:**
- [ ] All critical gaps addressed
- [ ] GDPR compliance > 75/100
- [ ] MFA implemented
- [ ] Comprehensive audit logging
- [ ] Incident response plan documented
- [ ] Regular security testing

---

**This document will be updated as security improvements are implemented.**

**Last Updated:** November 2025 (v1.0)
**Next Review:** After Phase 1 completion
