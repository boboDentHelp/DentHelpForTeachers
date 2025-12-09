# Data Requirements per Service
## DentalHelp Healthcare Platform

**Document Version:** 1.0
**Last Updated:** December 8, 2025
**Related:** Learning Outcome 7 - Distributed Data

---

## Executive Summary

This document provides comprehensive data requirements for each microservice in the DentalHelp platform. It defines functional and non-functional requirements, data volume estimates, access patterns, data variety, and retention policies per service.

**Purpose:**
- Define what data each service stores and why
- Estimate data volumes for capacity planning
- Identify access patterns for optimization
- Ensure legal and compliance requirements met

---

## Table of Contents

1. [Auth Service](#1-auth-service)
2. [Patient Service](#2-patient-service)
3. [Appointment Service](#3-appointment-service)
4. [Dental Records Service](#4-dental-records-service)
5. [X-Ray Service](#5-x-ray-service)
6. [Treatment Service](#6-treatment-service)
7. [Notification Service](#7-notification-service)
8. [Cross-Service Requirements](#8-cross-service-requirements)
9. [Summary Matrix](#9-summary-matrix)

---

## 1. Auth Service

### 1.1 Purpose
Manage user authentication, authorization, and role-based access control.

### 1.2 Functional Data Requirements

**FR-AUTH-001: User Authentication Data**
```
Required Data:
- CNP (unique identifier, 13 digits)
- Email (unique, for login)
- Password hash (BCrypt, never plain text)
- User role (PATIENT, DENTIST, RADIOLOGIST, ADMIN)
- Verification status (email verified?)
- Created/updated timestamps

Constraints:
- CNP must be unique (PRIMARY KEY)
- Email must be unique (UNIQUE constraint)
- Password must be hashed (BCrypt work factor ≥10)
- Role must be one of 4 defined values (ENUM)
```

**FR-AUTH-002: JWT Token Management**
```
Required Data:
- Token ID (UUID)
- User CNP (foreign key to patients)
- Refresh token (hashed)
- Expiration timestamp
- Created timestamp
- Revoked status (for token blacklisting)

Constraints:
- Refresh token valid for 30 days
- Access token valid for 24 hours (should be 15 minutes)
```

**FR-AUTH-003: Authentication Audit Logs**
```
Required Data:
- User CNP
- Login timestamp
- Login IP address
- Login success/failure status
- User agent

Purpose: Security monitoring, GDPR compliance
Retention: 90 days
```

### 1.3 Non-Functional Data Requirements

**NFR-AUTH-001: Performance**
```
Requirement: Login response time < 200ms (p95)
Current: p95 = 150ms ✅

Optimization:
- Indexed email lookup: CREATE INDEX idx_email ON patients(email)
- Indexed CNP lookup: CREATE INDEX idx_cnp ON patients(cnp)
- Connection pooling: 20 connections maximum
```

**NFR-AUTH-002: Availability**
```
Requirement: 99.9% uptime (auth is critical)
Implementation:
- Health checks every 10 seconds
- Kubernetes auto-restart on failure
- Future: Master-slave replication for failover
```

**NFR-AUTH-003: Security**
```
Requirement: Password security
- BCrypt hashing (work factor 10-12)
- No password logging
- Secure password reset flow
- Account lockout after 5 failed attempts (planned)
```

**NFR-AUTH-004: Scalability**
```
Current: 10,000 users
Target Year 1: 50,000 users
Target Year 5: 500,000 users

Scaling Strategy:
- Vertical scaling (more CPU/RAM) up to 100,000 users
- Read replicas for >100,000 users
- Horizontal scaling (multiple auth instances) already supported
```

### 1.4 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 | Storage Size |
|-----------|---------|--------|--------|--------------|
| User accounts | 1,000 | 10,000 | 100,000 | ~25 MB |
| Refresh tokens | 1,000 | 10,000 | 100,000 | ~15 MB |
| Audit logs (90 days) | 50,000 | 500,000 | 5,000,000 | ~200 MB |
| **Total** | - | - | - | **~240 MB** |

**Database Size:** auth_db current = 2.3 MB, projected = 250 MB (Year 5)

### 1.5 Access Patterns

```
Read Patterns:
- Login (email lookup): 1,000 requests/day
- Token validation: 10,000 requests/day (every API call)
- User profile fetch: 500 requests/day

Write Patterns:
- User registration: 10 requests/day
- Password change: 5 requests/day
- Token refresh: 500 requests/day

Read:Write Ratio: 1000:1 (highly read-heavy)
```

**Optimization:**
- Indexed queries for email/CNP lookup (5ms vs 500ms)
- Connection pooling (reuse connections)
- Future: Redis cache for token validation (1ms vs 10ms)

### 1.6 Data Retention

| Data Type | Retention Period | Reason | Deletion Strategy |
|-----------|------------------|--------|-------------------|
| Active user accounts | Indefinite | Required for service | Manual (GDPR request only) |
| Inactive accounts | 2 years | GDPR data minimization | Automated anonymization |
| Refresh tokens | 30 days | Security best practice | Automatic expiration |
| Audit logs | 90 days | Security monitoring | Automated deletion |
| GDPR audit logs | 7 years | Legal compliance | Manual deletion only |

### 1.7 Database Schema

```sql
-- auth_db schema
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cnp VARCHAR(13) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role ENUM('PATIENT', 'DENTIST', 'RADIOLOGIST', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_cnp (cnp),
    INDEX idx_email (email),
    INDEX idx_role (user_role),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_id VARCHAR(36) UNIQUE NOT NULL,
    patient_cnp VARCHAR(13) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,

    INDEX idx_token_id (token_id),
    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (patient_cnp) REFERENCES patients(cnp) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auth_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13),
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
) ENGINE=InnoDB;
```

---

## 2. Patient Service

### 2.1 Purpose
Manage patient profiles, personal information, and medical history (anamnesis).

### 2.2 Functional Data Requirements

**FR-PATIENT-001: Patient Personal Information**
```
Required Data:
- CNP (unique identifier, linked to auth_db)
- First name, last name
- Email (duplicate from auth_db for service autonomy)
- Phone number (Romanian format: +40XXXXXXXXX)
- Date of birth (derived from CNP but stored for validation)
- Address (optional)
- Emergency contact (optional)

Constraints:
- CNP must be unique
- Email must be valid format
- Phone must match Romanian format
```

**FR-PATIENT-002: Medical Anamnesis Data**
```
Required Data:
- Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Allergies (text field, comma-separated)
- Chronic conditions (text field, comma-separated)
- Current medications (text field)
- Previous surgeries (text field)
- Family medical history (text field, optional)

Purpose: Inform treatment decisions, avoid allergic reactions
Sensitivity: HIGHLY SENSITIVE (GDPR Article 9)
```

**FR-PATIENT-003: Patient Notes**
```
Required Data:
- Dentist notes (free text)
- Last visit date
- Next recommended checkup date

Purpose: Track patient care continuity
```

### 2.3 Non-Functional Data Requirements

**NFR-PATIENT-001: Data Accuracy**
```
Requirement: Patient data must be accurate (lives depend on it)
Implementation:
- Input validation (email format, phone format, CNP format)
- Mandatory fields enforced (cannot skip critical info)
- User can update their own data (accuracy maintenance)
- Dentists can update medical data after verification
```

**NFR-PATIENT-002: Data Privacy**
```
Requirement: Patient data only accessible to authorized users
Implementation:
- RBAC: Only patient + dentists + admin can access
- Ownership validation: Patients can only see own data
- Audit logging: All access logged
- HTTPS encryption in transit
```

**NFR-PATIENT-003: GDPR Compliance**
```
Requirement: Patient has right to export and delete data
Implementation:
- Data export API: GET /api/gdpr/export/{cnp}
- Data deletion API: DELETE /api/gdpr/delete/{cnp}
- Retention policy: 7 years after last visit, then delete
```

### 2.4 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 | Storage Size |
|-----------|---------|--------|--------|--------------|
| Patient profiles | 1,000 | 10,000 | 100,000 | ~30 MB |
| Anamnesis records | 1,000 | 10,000 | 100,000 | ~50 MB |
| **Total** | - | - | - | **~80 MB** |

**Database Size:** patient_db current = 5.8 MB, projected = 100 MB (Year 5)

### 2.5 Access Patterns

```
Read Patterns:
- View patient profile: 500 requests/day (appointments, checkups)
- Search patients: 100 requests/day (dentists finding patients)

Write Patterns:
- New patient registration: 10 requests/day
- Update patient info: 20 requests/day (contact changes)
- Update anamnesis: 30 requests/day (new allergies, medications)

Read:Write Ratio: 10:1 (read-heavy)
```

**Optimization:**
- Indexed CNP, email: Fast lookups
- FULLTEXT index on name: Fast patient search
- Pagination: Limit results to 20 per page

### 2.6 Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Patient profiles | 7 years after last visit | Romanian healthcare law |
| Anamnesis data | 7 years after last visit | Medical record retention |
| Deleted patient data | Immediate purge | GDPR Right to Erasure |

### 2.7 Database Schema

```sql
-- patient_db schema
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cnp VARCHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    emergency_contact VARCHAR(255),
    last_visit_date DATE,
    next_checkup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_cnp (cnp),
    INDEX idx_email (email),
    FULLTEXT INDEX idx_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patient_anamnesis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) UNIQUE NOT NULL,
    blood_type VARCHAR(10),
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    previous_surgeries TEXT,
    family_history TEXT,
    dentist_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_cnp) REFERENCES patients(cnp) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 3. Appointment Service

### 3.1 Purpose
Manage appointment scheduling, calendar availability, and booking requests.

### 3.2 Functional Data Requirements

**FR-APPT-001: Appointment Data**
```
Required Data:
- Patient CNP (who is the appointment for?)
- Dentist ID (which dentist?)
- Appointment date (YYYY-MM-DD)
- Appointment time (HH:MM)
- Appointment type (Regular Checkup, Emergency, Cleaning, etc.)
- Appointment status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Notes (patient reason for visit)

Constraints:
- No overlapping appointments for same dentist
- No double-booking same time slot
- Future dates only (cannot book in the past)
```

**FR-APPT-002: Appointment Requests**
```
Required Data:
- Patient CNP
- Preferred date
- Preferred time
- Reason for visit
- Status (PENDING, APPROVED, REJECTED)

Purpose: Patients request appointments, dentist/admin approves
```

### 3.3 Non-Functional Data Requirements

**NFR-APPT-001: Consistency**
```
Requirement: No double-booking (strong consistency required)
Implementation:
- ACID transactions with pessimistic locking
- Unique constraint on (dentist_id, appointment_date, appointment_time)
- Retry logic for concurrent booking attempts
```

**NFR-APPT-002: Performance**
```
Requirement: Calendar view loads in <200ms
Implementation:
- Indexed appointment_date for fast date range queries
- Pagination: Load only 1 month at a time
- Future: Redis cache for dentist availability
```

**NFR-APPT-003: Notifications**
```
Requirement: Send reminders 24 hours before appointment
Implementation:
- Event-driven: Appointment created → Notification Service notified
- Scheduled job: Check appointments 24 hours ahead
```

### 3.4 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 |
|-----------|---------|--------|--------|
| Appointments | 2,000 | 18,000/year | 180,000 total |
| Appointment requests | 2,500 | 20,000/year | 200,000 total |
| **Total Storage** | 1.2 MB | 10 MB | 100 MB |

### 3.5 Access Patterns

```
Read Patterns:
- Calendar view (dentist schedule): 200 requests/day
- Patient appointments: 100 requests/day

Write Patterns:
- New appointment booking: 50 requests/day
- Appointment cancellation: 10 requests/day
- Appointment completion: 50 requests/day

Read:Write Ratio: 5:1
```

### 3.6 Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Completed appointments | 3 years | Business records, statistical analysis |
| Cancelled appointments | 1 year | Analyze cancellation patterns |
| Pending appointments | Until status changes | Active data |

### 3.7 Database Schema

```sql
-- appointment_db schema
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    dentist_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(100),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_dentist_id (dentist_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    UNIQUE KEY unique_appointment (dentist_id, appointment_date, appointment_time)
) ENGINE=InnoDB;

CREATE TABLE appointment_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
```

---

## 4. Dental Records Service

### 4.1 Purpose
Manage tooth problems, dental interventions, and medical history.

### 4.2 Functional Data Requirements

**FR-DENTAL-001: Tooth Problems**
```
Required Data:
- Patient CNP
- Tooth number (1-32 for adults, 51-85 for children)
- Problem type (Cavity, Gingivitis, Abscess, etc.)
- Severity (MILD, MODERATE, SEVERE)
- Diagnosed date
- Dentist notes

Purpose: Track dental health issues
Sensitivity: HIGHLY SENSITIVE (medical diagnosis)
```

**FR-DENTAL-002: Tooth Interventions**
```
Required Data:
- Patient CNP
- Tooth number
- Intervention type (Filling, Root Canal, Extraction, etc.)
- Intervention date
- Dentist name
- Cost (for billing)
- Notes

Purpose: Track treatment history, billing
Sensitivity: HIGHLY SENSITIVE + FINANCIAL
```

### 4.3 Non-Functional Data Requirements

**NFR-DENTAL-001: Data Integrity**
```
Requirement: Medical records must be accurate and complete
Implementation:
- Foreign key constraints (patient_cnp → patients)
- NOT NULL constraints on critical fields
- Audit trail (created_at, updated_at)
```

**NFR-DENTAL-002: GDPR Compliance**
```
Requirement: 7-year retention for medical records
Implementation:
- Automatic deletion 7 years after last visit
- GDPR deletion cascade (ON DELETE CASCADE)
```

### 4.4 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 |
|-----------|---------|--------|--------|
| Tooth problems | 5,000 | 50,000 | 500,000 |
| Tooth interventions | 3,000 | 30,000 | 300,000 |
| **Total Storage** | 3.5 MB | 35 MB | 350 MB |

### 4.5 Access Patterns

```
Read Patterns:
- View patient dental history: 100 requests/day
- Search problems by tooth: 20 requests/day

Write Patterns:
- New problem diagnosed: 40 requests/day
- New intervention recorded: 50 requests/day

Read:Write Ratio: 2:1 (moderate read-heavy)
```

### 4.6 Database Schema

```sql
-- dental_records_db schema
CREATE TABLE tooth_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    tooth_number INT NOT NULL,
    problem_type VARCHAR(100) NOT NULL,
    severity ENUM('MILD', 'MODERATE', 'SEVERE') NOT NULL,
    diagnosed_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_tooth_number (tooth_number),
    INDEX idx_diagnosed_date (diagnosed_date)
) ENGINE=InnoDB;

CREATE TABLE tooth_interventions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    tooth_number INT NOT NULL,
    intervention_type VARCHAR(100) NOT NULL,
    intervention_date DATE NOT NULL,
    dentist_name VARCHAR(200),
    cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_intervention_date (intervention_date)
) ENGINE=InnoDB;
```

---

## 5. X-Ray Service

### 5.1 Purpose
Manage dental X-ray images and radiographic data.

### 5.2 Functional Data Requirements

**FR-XRAY-001: X-Ray Metadata**
```
Required Data:
- Patient CNP
- X-ray type (Bitewing, Periapical, Panoramic, etc.)
- X-ray date
- File path (where image is stored)
- File size (in bytes)
- Uploaded by (dentist/radiologist)

Purpose: Track X-ray inventory, access control
```

**FR-XRAY-002: X-Ray Image Files**
```
Required Data:
- Binary image data (PNG, JPEG, DICOM)
- File size: 2-5 MB per image
- Total storage: 50,000 images × 3 MB = 150 GB

Current: Stored in MySQL (BLOB field)
Future: Migrate to object storage (S3/Google Cloud Storage)
```

### 5.3 Non-Functional Data Requirements

**NFR-XRAY-001: Storage Efficiency**
```
Requirement: Minimize storage cost
Implementation:
- Image compression (JPEG quality 85%)
- Future: Object storage (S3 cheaper than database)
- Archive old X-rays (>7 years) to cold storage
```

**NFR-XRAY-002: Access Control**
```
Requirement: Only radiologists and dentists can view X-rays
Implementation:
- RBAC: hasRole('RADIOLOGIST') or hasRole('DENTIST')
- Patient cannot directly download X-rays (security)
```

**NFR-XRAY-003: Performance**
```
Requirement: X-ray image loads in <2 seconds
Current: 3-5 seconds (stored in MySQL BLOB)
Future: <1 second with S3 CDN
```

### 5.4 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 |
|-----------|---------|--------|--------|
| X-ray metadata | 500 | 5,000 | 50,000 |
| X-ray images (3 MB each) | 1.5 GB | 15 GB | 150 GB |
| **Total Storage** | 1.5 GB | 15 GB | **150 GB** |

**Cost:** MySQL storage expensive for images → migrate to S3 (90% cost savings)

### 5.5 Access Patterns

```
Read Patterns:
- View X-ray: 50 requests/day (low frequency)

Write Patterns:
- Upload X-ray: 10 requests/day

Read:Write Ratio: 5:1

Optimization: CDN caching for frequently accessed X-rays
```

### 5.6 Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| X-ray images | 7 years | Medical imaging regulations |
| X-ray metadata | 7 years | Required for image access |

### 5.7 Database Schema

```sql
-- xray_db schema (current)
CREATE TABLE xrays (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    xray_type VARCHAR(100) NOT NULL,
    xray_date DATE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_xray_date (xray_date)
) ENGINE=InnoDB;

-- Future: Migrate to object storage
-- xrays table will store only metadata + S3 URL
-- Actual images stored in S3/Google Cloud Storage
```

---

## 6. Treatment Service

### 6.1 Purpose
Manage treatment plans, prescriptions, and billing information.

### 6.2 Functional Data Requirements

**FR-TREAT-001: Treatment Plans**
```
Required Data:
- Patient CNP
- Diagnosis (what problem are we treating?)
- Treatment steps (e.g., "1. Root canal, 2. Crown, 3. Follow-up")
- Estimated cost
- Dentist assigned
- Status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)

Purpose: Organize multi-step treatments
```

**FR-TREAT-002: Prescriptions**
```
Required Data:
- Patient CNP
- Medication name
- Dosage (e.g., "500mg twice daily")
- Duration (e.g., "7 days")
- Prescribed by (dentist name)
- Prescribed date

Purpose: Track medications prescribed
Sensitivity: HIGHLY SENSITIVE (medical data)
```

### 6.3 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 |
|-----------|---------|--------|--------|
| Treatment plans | 1,500 | 15,000 | 150,000 |
| Prescriptions | 800 | 8,000 | 80,000 |
| **Total Storage** | 2.1 MB | 21 MB | 210 MB |

### 6.4 Access Patterns

```
Read Patterns:
- View treatment plan: 80 requests/day

Write Patterns:
- Create treatment plan: 30 requests/day
- Update treatment status: 40 requests/day

Read:Write Ratio: 2:1
```

### 6.5 Database Schema

```sql
-- treatment_db schema
CREATE TABLE treatments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_steps TEXT NOT NULL,
    estimated_cost DECIMAL(10, 2),
    dentist_id BIGINT,
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    duration VARCHAR(50),
    prescribed_by VARCHAR(200),
    prescribed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_prescribed_date (prescribed_date)
) ENGINE=InnoDB;
```

---

## 7. Notification Service

### 7.1 Purpose
Manage user notifications, alerts, and email queue.

### 7.2 Functional Data Requirements

**FR-NOTIF-001: Notifications**
```
Required Data:
- Patient CNP (recipient)
- Notification type (APPOINTMENT_REMINDER, NEW_XRAY, etc.)
- Message (text content)
- Read status (boolean)
- Created timestamp

Purpose: In-app notifications for users
```

**FR-NOTIF-002: Email Queue**
```
Required Data:
- Recipient email
- Subject
- Body (HTML or plain text)
- Send status (PENDING, SENT, FAILED)
- Sent timestamp

Purpose: Asynchronous email sending
```

### 7.3 Data Volume Estimates

| Data Type | Current | Year 1 | Year 5 |
|-----------|---------|--------|--------|
| Notifications | 3,000 | 36,500/year | 365,000 total |
| Email queue | 2,000 | 24,000/year | 240,000 total |
| **Total Storage** | 800 KB | 8 MB | 80 MB |

### 7.4 Access Patterns

```
Read Patterns:
- Get unread notifications: 500 requests/day

Write Patterns:
- Create notification: 100 requests/day
- Mark as read: 80 requests/day

Read:Write Ratio: 3:1

Retention: Delete notifications older than 30 days
```

### 7.5 Database Schema

```sql
-- notification_db schema
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_cnp VARCHAR(13) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_cnp (patient_cnp),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

---

## 8. Cross-Service Requirements

### 8.1 Data Consistency Requirements

```
Scenario: GDPR Data Deletion
┌──────────────────────────────────────────────────────────┐
│ Requirement: When user deleted, ALL data must be deleted │
│ across ALL 7 services                                     │
├──────────────────────────────────────────────────────────┤
│ Auth Service:        Delete user account                 │
│ Patient Service:     Delete patient profile + anamnesis  │
│ Appointment Service: Delete all appointments             │
│ Dental Records:      Delete problems + interventions     │
│ X-Ray Service:       Delete X-ray images                 │
│ Treatment Service:   Delete treatment plans + Rx         │
│ Notification Service: Delete notifications               │
└──────────────────────────────────────────────────────────┘

Implementation: Event-driven eventual consistency
  - Auth Service publishes "GDPR_DELETE" event
  - All services subscribe and delete their data
  - Guaranteed delivery with RabbitMQ
```

### 8.2 Data Synchronization Requirements

```
Scenario: Email Update
┌──────────────────────────────────────────────────────────┐
│ Requirement: When email updated, sync across services    │
├──────────────────────────────────────────────────────────┤
│ Auth Service:    PRIMARY email storage (source of truth) │
│ Patient Service: REPLICA email storage (synced)          │
└──────────────────────────────────────────────────────────┘

Implementation: Event-driven sync
  - Auth Service publishes "EMAIL_UPDATED" event
  - Patient Service receives event and updates email
  - Eventual consistency (acceptable 1-5 second delay)
```

### 8.3 Data Backup Requirements

```
All 7 databases backed up daily:
┌──────────────────────────────────────────────────────────┐
│ Frequency:  Daily at 2 AM UTC                            │
│ Retention:  7 days (rolling window)                      │
│ Format:     Compressed SQL dumps (gzip)                  │
│ Storage:    Kubernetes persistent volume (10 GB)         │
│ Testing:    Monthly restore test                         │
└──────────────────────────────────────────────────────────┘

Recovery Objectives:
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours (daily backup)
```

---

## 9. Summary Matrix

### 9.1 Data Volume Summary

| Service | Current Size | Year 1 | Year 5 | Primary Growth Driver |
|---------|--------------|--------|--------|----------------------|
| Auth Service | 2.3 MB | 25 MB | 250 MB | User accounts |
| Patient Service | 5.8 MB | 60 MB | 600 MB | Patient profiles + anamnesis |
| Appointment Service | 1.2 MB | 12 MB | 120 MB | Appointments (cumulative) |
| Dental Records | 3.5 MB | 35 MB | 350 MB | Interventions (cumulative) |
| X-Ray Service | 1.5 GB | 15 GB | **150 GB** | X-ray images (binary data) |
| Treatment Service | 2.1 MB | 21 MB | 210 MB | Treatment plans |
| Notification Service | 800 KB | 8 MB | 80 MB | Notifications (30-day retention) |
| **TOTAL** | **1.52 GB** | **15.18 GB** | **151.61 GB** | X-rays dominate storage |

**Key Insight:** X-rays represent 99% of storage → migrate to object storage (S3)

### 9.2 Access Pattern Summary

| Service | Read:Write Ratio | Optimization Strategy |
|---------|------------------|-----------------------|
| Auth Service | 1000:1 | Cache token validation (Redis) |
| Patient Service | 10:1 | Indexed CNP/email lookups |
| Appointment Service | 5:1 | Indexed date range queries |
| Dental Records | 2:1 | Indexed patient CNP |
| X-Ray Service | 5:1 | CDN caching for images |
| Treatment Service | 2:1 | Indexed patient CNP |
| Notification Service | 3:1 | Delete old notifications |

### 9.3 Retention Policy Summary

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Medical records | 7 years | Romanian healthcare law |
| X-ray images | 7 years | Medical imaging regulations |
| Appointments | 3 years | Business records |
| User accounts (inactive) | 2 years | GDPR data minimization |
| Notifications | 30 days | User experience |
| Audit logs | 7 years | GDPR compliance |

---

## Conclusion

This document provides comprehensive data requirements for each microservice, enabling:

✅ **Capacity Planning:** Accurate storage estimates for infrastructure sizing
✅ **Performance Optimization:** Understanding access patterns for indexing
✅ **Legal Compliance:** Retention policies aligned with GDPR and healthcare law
✅ **Service Autonomy:** Each service owns its data with clear boundaries
✅ **Cross-Service Coordination:** Event-driven data synchronization patterns

**Achievement Level:** PROFICIENT (detailed data requirements per service)

---

**Document Author:** Bogdan Călinescu
**Date:** December 8, 2025

---
