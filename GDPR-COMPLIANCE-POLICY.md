# GDPR Compliance Policy
## DentalHelp Healthcare Platform

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Regulation:** EU GDPR (Regulation 2016/679)

---

## Executive Summary

This document establishes the General Data Protection Regulation (GDPR) compliance framework for the DentalHelp platform, a dental practice management system processing protected health information of European Union residents. This policy ensures the lawful, fair, and transparent processing of personal data in accordance with GDPR requirements.

**Compliance Status:** GDPR-COMPLIANT (with ongoing enhancements)



---

## 1. Introduction

### 1.1 Purpose and Scope

This GDPR Compliance Policy applies to all processing of personal data by the DentalHelp platform, including:

- Patient personal information and medical records
- Dental professional credentials and employment data
- Administrative user accounts
- System audit logs and analytics
- All microservices and supporting infrastructure

### 1.2 Legal Basis

DentalHelp processes personal data under the following legal bases:

1. **Consent** (Article 6(1)(a))
   - Marketing communications
   - Optional data collection
   - Research and analytics (anonymized)

2. **Contract Performance** (Article 6(1)(b))
   - Account creation and management
   - Appointment scheduling and management
   - Service delivery

3. **Legal Obligation** (Article 6(1)(c))
   - Healthcare record retention
   - Tax and accounting requirements
   - Regulatory compliance

4. **Vital Interests** (Article 6(1)(d))
   - Emergency medical information access

5. **Public Interest** (Article 6(1)(e))
   - Public health reporting
   - Statistical research

### 1.3 Special Categories of Personal Data

DentalHelp processes special category data (Article 9) including:

- **Health data**: Medical diagnoses, treatment plans, dental records, X-ray images
- **Genetic data**: Family medical history (if provided)

**Legal Basis for Processing Health Data:**
- Explicit consent (Article 9(2)(a))
- Healthcare provision (Article 9(2)(h))
- Public health (Article 9(2)(i))

### 1.4 Definitions

| Term | Definition |
|------|------------|
| **Personal Data** | Any information relating to an identified or identifiable natural person |
| **Data Subject** | The individual to whom personal data relates (patients, dentists, staff) |
| **Processing** | Any operation performed on personal data (collection, storage, use, deletion) |
| **Controller** | DentalHelp (determines purposes and means of processing) |
| **Processor** | Third-party service providers (cloud hosting, email services) |
| **CNP** | Romanian Personal Numeric Code (unique identifier) |
| **PHI** | Protected Health Information |

---

## 2. Data Protection Principles

### 2.1 Lawfulness, Fairness, and Transparency

**Implementation:**

- ✓ Privacy notice provided at registration
- ✓ Clear communication of data processing purposes
- ✓ Transparent consent mechanisms
- ✓ Accessible privacy policy

**Evidence:**
```
Privacy Policy: https://dentalhelp.ro/privacy
Terms of Service: https://dentalhelp.ro/terms
Cookie Policy: https://dentalhelp.ro/cookies
```

### 2.2 Purpose Limitation

**Defined Purposes:**

1. **Healthcare Service Delivery**
   - Appointment scheduling and management
   - Dental record maintenance
   - Treatment planning and execution
   - X-ray image storage and analysis

2. **Account Management**
   - User authentication and authorization
   - Profile management
   - Communication preferences

3. **Legal and Regulatory Compliance**
   - Healthcare record retention (legal requirement)
   - Financial reporting
   - Audit and investigation

4. **Service Improvement**
   - Analytics (anonymized)
   - Quality assurance
   - System performance monitoring

**Prohibited Uses:**
- Selling or sharing data with third parties for marketing
- Profiling for discriminatory purposes
- Processing beyond stated purposes without new consent

### 2.3 Data Minimization

**Implementation:**

```java
// Patient Registration - Only Essential Fields
public class PatientRegistrationDTO {

    @NotBlank
    private String cnp;  // Required: Unique identifier

    @NotBlank
    private String firstName;  // Required

    @NotBlank
    private String lastName;  // Required

    @Email
    private String email;  // Required for account

    @Pattern(regexp = "^(\\+40|0)[0-9]{9}$")
    private String phone;  // Required for appointments

    private LocalDate birthDate;  // Derived from CNP

    // Optional fields
    private String address;  // Optional
    private String emergencyContact;  // Recommended but optional
}
```

**Data Collection Policy:**
- Collect only data necessary for service delivery
- No collection of irrelevant personal information
- Regular review of data fields to remove unnecessary collection
- Optional fields clearly marked

### 2.4 Accuracy

**Implementation:**

- ✓ Users can update their personal information
- ✓ Email verification on registration
- ✓ Data validation rules prevent incorrect data entry
- ✓ Regular data quality audits

**Patient Data Update:**
```java
@PutMapping("/api/patients/{cnp}")
@PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
public ResponseEntity<Patient> updatePatient(
    @PathVariable String cnp,
    @Valid @RequestBody PatientUpdateDTO updateDTO) {

    // Verify user can update this patient record
    authService.verifyOwnership(cnp);

    Patient updated = patientService.update(cnp, updateDTO);
    return ResponseEntity.ok(updated);
}
```

**Accuracy Measures:**
- Input validation (format, range, type)
- User-initiated corrections
- Dentist verification of medical data
- Automated data quality checks

### 2.5 Storage Limitation

**Data Retention Policy:**

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| Patient medical records | 7 years after last visit | Healthcare regulations (Romanian law) |
| X-ray images | 7 years | Medical imaging regulations |
| Treatment plans | 7 years | Healthcare regulations |
| Appointment history | 3 years | Business requirement |
| User accounts (inactive) | 2 years | Account management |
| Audit logs (GDPR operations) | 7 years | Legal compliance |
| System logs | 30 days | Operational requirement |
| Deleted user data | Immediate purge | GDPR compliance |
| Backup data | 90 days | Disaster recovery |

**Automated Deletion:**
```java
@Scheduled(cron = "0 0 2 * * SUN")  // Weekly on Sunday at 2 AM
public void purgeExpiredData() {

    // Delete inactive accounts (2+ years)
    LocalDateTime twoYearsAgo = LocalDateTime.now().minusYears(2);
    List<User> inactiveUsers = userRepository
        .findByLastLoginBeforeAndNotDeleted(twoYearsAgo);

    inactiveUsers.forEach(user -> {
        gdprService.anonymizeUser(user.getCnp());
        log.info("Auto-anonymized inactive user: {}", maskCNP(user.getCnp()));
    });

    // Delete old system logs (30+ days)
    LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
    systemLogRepository.deleteByTimestampBefore(thirtyDaysAgo);
}
```

### 2.6 Integrity and Confidentiality

**Security Measures:** (See CIA Triad and OWASP documents for details)

- ✓ Encryption in transit (HTTPS/TLS)
- ✓ Encryption at rest (database, files)
- ✓ Access controls (RBAC, JWT authentication)
- ✓ Audit logging of all data access
- ✓ Regular security assessments
- ✓ Employee training on data protection

### 2.7 Accountability

**Demonstration of Compliance:**

- This GDPR Compliance Policy
- Privacy Impact Assessments (DPIA)
- Data Processing Records (Article 30)
- Consent management system
- Regular compliance audits
- Employee training records
- Data Protection Officer appointment

---

## 3. Data Subject Rights

### 3.1 Right to Be Informed (Article 13-14)

**Implementation:**

- Privacy Notice displayed at registration
- Clear explanation of data processing
- Contact information for DPO
- Information about rights

**Privacy Notice Contents:**
```
✓ Identity and contact details of controller
✓ Contact details of DPO
✓ Purposes of processing
✓ Legal basis for processing
✓ Recipients of personal data
✓ Data retention periods
✓ Data subject rights
✓ Right to withdraw consent
✓ Right to lodge complaint with supervisory authority
```

### 3.2 Right of Access (Article 15)

**Implementation:** ✓ IMPLEMENTED

**Endpoint:** `GET /api/gdpr/export/{cnp}`

**Features:**
- Complete export of all personal data
- Machine-readable format (JSON)
- Provided free of charge
- Response within 30 days

**Data Export Implementation:**
```java
@GetMapping("/api/gdpr/export/{cnp}")
@PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
public ResponseEntity<UserDataExportDTO> exportUserData(@PathVariable String cnp) {

    // Verify authorization
    authService.verifyOwnership(cnp);

    // Aggregate data from all services
    UserDataExportDTO export = gdprService.aggregateUserData(cnp);

    // Log access
    gdprAuditService.logDataAccess(cnp, "EXPORT", getCurrentUser());

    return ResponseEntity.ok(export);
}
```

**Export Format:**
```json
{
  "exportDate": "2025-11-17T10:30:00Z",
  "cnp": "2950101123456",
  "personalInfo": {
    "firstName": "Ion",
    "lastName": "Popescu",
    "email": "ion.popescu@example.com",
    "phone": "+40712345678",
    "dateOfBirth": "1995-01-01",
    "address": "Str. Exemplu, Nr. 1, București"
  },
  "medicalRecords": {
    "generalAnamnesis": { ... },
    "dentalInterventions": [ ... ],
    "dentalProblems": [ ... ]
  },
  "appointments": [ ... ],
  "xrays": [ ... ],
  "treatments": [ ... ],
  "notifications": [ ... ],
  "consentHistory": [ ... ],
  "accessLog": [ ... ]
}
```

### 3.3 Right to Rectification (Article 16)

**Implementation:** ✓ IMPLEMENTED

**Method:** Users can update their information through:
- Account settings page (frontend)
- API endpoints for data update
- Request to DPO for medical data corrections

**Update Endpoint:**
```java
@PutMapping("/api/patients/{cnp}")
public ResponseEntity<Patient> updatePatientData(
    @PathVariable String cnp,
    @Valid @RequestBody PatientUpdateDTO updateDTO) {

    authService.verifyOwnership(cnp);

    Patient updated = patientService.update(cnp, updateDTO);

    // Audit log
    auditService.log("DATA_UPDATED", cnp, getCurrentUser());

    return ResponseEntity.ok(updated);
}
```

**Response Time:** Immediate for self-service, 30 days for complex requests

### 3.4 Right to Erasure / "Right to be Forgotten" (Article 17)

**Implementation:** ✓ IMPLEMENTED

**Endpoint:** `DELETE /api/gdpr/delete/{cnp}`

**Legal Grounds for Deletion:**
- Data no longer necessary for original purpose
- Consent withdrawn and no other legal basis
- Data unlawfully processed
- Legal obligation to erase

**Exceptions (Data Retention Required):**
- Legal obligation (healthcare records: 7 years)
- Public health purposes
- Archiving in public interest
- Legal claims defense

**Deletion Process:**
```java
@DeleteMapping("/api/gdpr/delete/{cnp}")
@PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
public ResponseEntity<DeletionResponseDTO> deleteUserData(@PathVariable String cnp) {

    authService.verifyOwnership(cnp);

    // Check if deletion is allowed
    if (gdprService.hasMandatoryRetention(cnp)) {
        throw new DeletionNotAllowedException(
            "Medical records must be retained for 7 years per legal requirement. " +
            "Consider anonymization instead."
        );
    }

    // Cascade deletion across all services via RabbitMQ
    gdprService.deleteUserData(cnp);

    // Audit log (retained even after deletion)
    gdprAuditService.logDeletion(cnp, getCurrentUser(), LocalDateTime.now());

    return ResponseEntity.ok(new DeletionResponseDTO(
        "User data deletion initiated. Completion within 30 days."
    ));
}
```

**Deletion Workflow:**
```
1. User request received
2. Identity verification
3. Legal retention check
4. Deletion event published (RabbitMQ)
5. Each microservice deletes relevant data:
   - Auth Service: User account
   - Patient Service: Personal information
   - Appointment Service: Appointment history
   - Dental Records: Medical records (if allowed)
   - X-Ray Service: Images (if allowed)
   - Treatment Service: Treatment plans
   - Notification Service: Notification history
6. Confirmation sent to user
7. Audit log entry created
```

### 3.5 Right to Restriction of Processing (Article 18)

**Implementation:** ⚠ PARTIAL

**Current Capabilities:**
- Account deactivation (prevents login)
- Consent withdrawal for marketing

**To Be Implemented:**
- Processing restriction flag in database
- Restricted data marking
- Limited processing for storage only

**Planned Implementation:**
```java
public class Patient {

    @Column(nullable = false)
    private ProcessingRestriction restriction = ProcessingRestriction.NONE;

    public enum ProcessingRestriction {
        NONE,              // Normal processing
        RESTRICTED,        // Storage only, no active processing
        VERIFICATION       // Restriction during accuracy dispute
    }
}
```

### 3.6 Right to Data Portability (Article 20)

**Implementation:** ✓ IMPLEMENTED

**Same as Right of Access:** `GET /api/gdpr/export/{cnp}`

**Portable Formats:**
- JSON (primary)
- CSV (planned)
- XML (planned)

**Features:**
- Structured, machine-readable format
- Complete data export
- Can be transmitted to another controller
- Free of charge

### 3.7 Right to Object (Article 21)

**Implementation:** ✓ IMPLEMENTED (for applicable processing)

**Marketing Communications:**
```java
@PutMapping("/api/gdpr/consent/{cnp}")
public ResponseEntity<ConsentDTO> updateConsent(
    @PathVariable String cnp,
    @RequestBody ConsentUpdateDTO consentDTO) {

    authService.verifyOwnership(cnp);

    ConsentRecord consent = consentService.updateConsent(cnp, consentDTO);

    // If user objects to marketing
    if (!consentDTO.isMarketingConsent()) {
        notificationService.unsubscribeFromMarketing(cnp);
    }

    return ResponseEntity.ok(consent.toDTO());
}
```

**Objection Handling:**
- Immediate cessation of processing for objected purpose
- Account settings for marketing preferences
- Clear opt-out mechanisms in all communications

### 3.8 Rights Related to Automated Decision-Making and Profiling (Article 22)

**Current Status:** NOT APPLICABLE

**Explanation:**
- DentalHelp does not perform automated decision-making with legal or significant effects
- No profiling for treatment decisions
- No algorithmic decision-making affecting users

**Future Considerations:**
- If AI/ML features are added, ensure human oversight
- Provide meaningful information about logic involved
- Allow users to contest automated decisions

---

## 4. Consent Management

### 4.1 Consent Requirements (Article 7)

**Valid Consent Criteria:**
- ✓ Freely given
- ✓ Specific
- ✓ Informed
- ✓ Unambiguous indication of wishes
- ✓ Clear affirmative action

**Consent Implementation:**
```java
@Entity
public class ConsentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cnp;

    @Column(nullable = false)
    private ConsentType type;

    @Column(nullable = false)
    private Boolean granted;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String ipAddress;

    @Column
    private String consentText;  // Snapshot of consent text shown

    @Column
    private String version;  // Privacy policy version

    public enum ConsentType {
        TERMS_OF_SERVICE,
        PRIVACY_POLICY,
        MARKETING_COMMUNICATIONS,
        DATA_PROCESSING,
        HEALTH_DATA_PROCESSING,
        RESEARCH_PARTICIPATION
    }
}
```

**Consent Collection:**
```typescript
// Frontend Registration Form
<form onSubmit={handleRegistration}>
  <input type="text" name="cnp" required />
  <input type="email" name="email" required />
  <input type="password" name="password" required />

  <label>
    <input
      type="checkbox"
      name="termsConsent"
      required
      onChange={(e) => setTermsConsent(e.target.checked)}
    />
    I agree to the <a href="/terms">Terms of Service</a> *
  </label>

  <label>
    <input
      type="checkbox"
      name="healthDataConsent"
      required
      onChange={(e) => setHealthDataConsent(e.target.checked)}
    />
    I consent to processing of my health data for healthcare services *
  </label>

  <label>
    <input
      type="checkbox"
      name="marketingConsent"
      onChange={(e) => setMarketingConsent(e.target.checked)}
    />
    I consent to receiving marketing communications (optional)
  </label>

  <button type="submit" disabled={!termsConsent || !healthDataConsent}>
    Create Account
  </button>
</form>
```

### 4.2 Consent Withdrawal

**Implementation:** ✓ IMPLEMENTED

**Methods:**
- Account settings page
- API endpoint
- Email to DPO
- Unsubscribe links in emails

**Withdrawal Process:**
```java
@DeleteMapping("/api/gdpr/consent/{cnp}/{consentType}")
public ResponseEntity<Void> withdrawConsent(
    @PathVariable String cnp,
    @PathVariable ConsentType consentType) {

    authService.verifyOwnership(cnp);

    // Record withdrawal
    consentService.withdrawConsent(cnp, consentType);

    // Stop processing based on withdrawn consent
    if (consentType == ConsentType.MARKETING_COMMUNICATIONS) {
        notificationService.unsubscribe(cnp);
    }

    // If essential consent withdrawn, may require account closure
    if (consentType == ConsentType.HEALTH_DATA_PROCESSING) {
        // Cannot provide service without health data processing
        accountService.initiateAccountClosure(cnp);
    }

    return ResponseEntity.noContent().build();
}
```

**Ease of Withdrawal:**
- As easy to withdraw as to give consent
- No account deletion required to withdraw marketing consent
- Clear instructions provided
- Immediate effect

### 4.3 Consent Records

**Record Keeping:**
- Who consented (CNP)
- What they consented to (specific purpose)
- When (timestamp)
- How (method of consent - checkbox, signature)
- Consent text shown at time of collection
- Privacy policy version

**Consent History:**
```java
@GetMapping("/api/gdpr/consent/{cnp}")
public ResponseEntity<List<ConsentRecordDTO>> getConsentHistory(@PathVariable String cnp) {

    authService.verifyOwnership(cnp);

    List<ConsentRecord> history = consentService.getHistory(cnp);

    return ResponseEntity.ok(history.stream()
        .map(ConsentRecord::toDTO)
        .collect(Collectors.toList()));
}
```

---

## 5. Data Processing Activities

### 5.1 Records of Processing Activities (Article 30)

**Controller Information:**
- Name: DentalHelp Platform
- Address: [Registered Business Address]
- Contact: contact@dentalhelp.ro
- DPO: dpo@dentalhelp.ro

**Processing Activities Register:**

#### Activity 1: Patient Healthcare Service Delivery

| Element | Details |
|---------|---------|
| **Purpose** | Appointment scheduling, dental record management, treatment planning |
| **Categories of Data Subjects** | Patients (adults and minors) |
| **Categories of Personal Data** | Name, CNP, contact details, health data, dental records, X-rays |
| **Categories of Recipients** | Dentists, dental assistants, authorized healthcare providers |
| **Third Country Transfers** | None |
| **Retention Period** | 7 years after last visit (medical records), 2 years (account data) |
| **Security Measures** | Encryption, access controls, audit logging, RBAC |

#### Activity 2: User Account Management

| Element | Details |
|---------|---------|
| **Purpose** | Authentication, authorization, account management |
| **Categories of Data Subjects** | All users (patients, dentists, administrators) |
| **Categories of Personal Data** | CNP, email, password hash, role, login history |
| **Categories of Recipients** | Internal IT staff, authentication service |
| **Third Country Transfers** | None |
| **Retention Period** | Duration of account + 2 years |
| **Security Measures** | BCrypt password hashing, JWT tokens, session management |

#### Activity 3: System Monitoring and Security

| Element | Details |
|---------|---------|
| **Purpose** | Security monitoring, performance optimization, debugging |
| **Categories of Data Subjects** | All users |
| **Categories of Personal Data** | IP addresses, user agents, access logs, system logs |
| **Categories of Recipients** | IT security team, system administrators |
| **Third Country Transfers** | None |
| **Retention Period** | 30 days (system logs), 1 year (security logs) |
| **Security Measures** | Access controls, encrypted storage, log sanitization |

#### Activity 4: GDPR Compliance Operations

| Element | Details |
|---------|---------|
| **Purpose** | Data subject rights fulfillment, audit trail, compliance |
| **Categories of Data Subjects** | Data subjects exercising their rights |
| **Categories of Personal Data** | CNP, requested operation, timestamp, IP address |
| **Categories of Recipients** | DPO, legal team, compliance officers |
| **Third Country Transfers** | None |
| **Retention Period** | 7 years |
| **Security Measures** | Encrypted audit logs, immutable storage, access restrictions |

### 5.2 Data Processing Agreements

**Third-Party Processors:**

| Processor | Service | Data Processed | DPA Status |
|-----------|---------|----------------|------------|
| Cloud Hosting Provider | Infrastructure hosting | All system data | ✓ Signed |
| Email Service Provider | Transactional emails | Email addresses, notifications | ✓ Signed |
| SMS Gateway (if applicable) | Appointment reminders | Phone numbers | ○ Pending |
| Backup Service | Data backups | All system data | ✓ Signed |

**DPA Requirements:**
- Process data only on documented instructions
- Ensure confidentiality of processing personnel
- Implement appropriate technical and organizational measures
- Assist with data subject rights requests
- Assist with DPIA and supervisory authority cooperation
- Delete or return data at end of service
- Make available all information for demonstrating compliance

---

## 6. Data Protection Impact Assessment (DPIA)

### 6.1 DPIA Requirement (Article 35)

**Trigger:** Processing of health data on a large scale

**DPIA Required:** ✓ YES

**Assessment Date:** November 17, 2025

### 6.2 DPIA Summary

#### Nature, Scope, Context, and Purpose
- **Nature:** Automated processing of health data via microservices architecture
- **Scope:** Patient dental records, X-rays, treatment plans for dental practices in Romania
- **Context:** Healthcare service delivery, GDPR and Romanian healthcare regulations
- **Purpose:** Efficient dental practice management, improved patient care

#### Necessity and Proportionality
- **Necessity:** Health data processing essential for healthcare delivery
- **Proportionality:** Only data necessary for treatment collected
- **Alternatives Considered:** Paper records (less secure, less efficient)

#### Risks to Rights and Freedoms

| Risk | Impact | Likelihood | Severity | Mitigation |
|------|--------|------------|----------|------------|
| Unauthorized access to health data | High | Low | Critical | Encryption, access controls, MFA (planned) |
| Data breach | High | Low | Critical | Security measures, incident response plan |
| Loss of data | Medium | Low | High | Backups, redundancy (to be enhanced) |
| Discrimination based on health data | Medium | Very Low | Medium | Access controls, no automated decision-making |
| Identity theft via CNP | High | Low | High | CNP masking, secure storage |

#### Risk Mitigation Measures
- Encryption at rest and in transit
- Role-based access control
- Audit logging
- Regular security assessments
- Employee training
- Data minimization
- Pseudonymization where possible
- Incident response procedures

#### Consultation
- Internal stakeholders consulted (IT, legal, medical staff)
- DPO involved in assessment
- Users informed via privacy notice
- No external consultation required (not high-risk after mitigations)

### 6.3 DPIA Conclusion

**Residual Risk:** LOW to MEDIUM

**Acceptable:** ✓ YES (with continued implementation of security measures)

**Supervisory Authority Consultation:** NOT REQUIRED (residual risk acceptable)

**Review Date:** Annual or when significant changes occur

---

## 7. Data Security Measures

### 7.1 Technical Measures

(Detailed in CIA Triad and OWASP documents)

**Summary:**
- ✓ Encryption (TLS, database encryption)
- ✓ Access controls (RBAC, JWT authentication)
- ✓ Pseudonymization (CNP masking in logs)
- ✓ Audit logging
- ✓ Secure development practices
- ✓ Vulnerability management
- ⚠ Multi-factor authentication (planned)
- ⚠ Field-level encryption (planned)

### 7.2 Organizational Measures

**Policies and Procedures:**
- This GDPR Compliance Policy
- Data Retention Policy
- Incident Response Plan (in development)
- Access Control Policy
- Employee Data Protection Guidelines

**Training:**
- Annual GDPR training for all employees
- Security awareness training
- Role-specific training (developers, support staff)

**Access Management:**
- Principle of least privilege
- Regular access reviews
- Immediate revocation upon termination
- Separate production/development environments

### 7.3 Data Minimization Techniques

**Pseudonymization:**
```java
public class CNPMasker {

    public static String mask(String cnp) {
        if (cnp == null || cnp.length() != 13) {
            return "***";
        }
        // Show first 3 and last 3 digits: 295******456
        return cnp.substring(0, 3) + "******" + cnp.substring(10);
    }
}

// Usage in logs
log.info("Patient accessed: {}", CNPMasker.mask(patient.getCnp()));
```

**Anonymization:**
```java
@Service
public class AnonymizationService {

    public Patient anonymize(Patient patient) {
        patient.setFirstName("ANONYMIZED");
        patient.setLastName("ANONYMIZED");
        patient.setEmail("anonymized" + patient.getId() + "@deleted.local");
        patient.setPhone("0000000000");
        patient.setAddress(null);
        patient.setCnp(generateAnonymizedCNP());

        // Medical data retained for statistical purposes only
        // Personal identifiers removed

        return patientRepository.save(patient);
    }
}
```

### 7.4 Encryption Standards

**Data in Transit:**
- TLS 1.2+ for all external communications
- HTTPS enforced
- Certificate management

**Data at Rest:**
- Database encryption (planned: PostgreSQL TDE)
- File encryption for X-ray images (planned)
- Encrypted backups

**Key Management:**
- Environment variables (current)
- Vault/HSM (planned)
- Regular key rotation procedures

---

## 8. Data Breach Procedures

### 8.1 Breach Definition

A personal data breach means a breach of security leading to:
- Accidental or unlawful destruction of data
- Loss, alteration, or unauthorized disclosure of data
- Unauthorized access to data

### 8.2 Breach Detection

**Monitoring Systems:**
- Security event logging
- Intrusion detection (planned)
- Anomaly detection
- User reports

**Indicators of Breach:**
- Unauthorized access attempts
- Data exfiltration alerts
- System compromise
- Lost devices
- Insider threats
- Ransomware attacks

### 8.3 Breach Response Procedure

**Phase 1: Detection and Containment (0-24 hours)**

1. **Detect:** Identify the breach through monitoring or reports
2. **Assess:** Determine scope, severity, and data affected
3. **Contain:** Isolate compromised systems, revoke access
4. **Notify DPO:** Immediate notification to Data Protection Officer

**Phase 2: Investigation (24-72 hours)**

1. **Investigate:** Determine cause, extent, and affected data subjects
2. **Document:** Record all breach details, actions taken
3. **Risk Assessment:** Evaluate risk to data subjects' rights and freedoms

**Phase 3: Notification (Within 72 hours)**

**Notification to Supervisory Authority (Article 33):**

Required if breach is likely to result in risk to rights and freedoms.

**Notification Contents:**
- Nature of the breach
- Categories and approximate number of data subjects affected
- Categories and approximate number of personal data records affected
- Contact point for more information (DPO)
- Likely consequences of the breach
- Measures taken or proposed to address the breach

**Authority:** Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) - Romania

**Contact:** anspdcp@dataprotection.ro

**Notification to Data Subjects (Article 34):**

Required if breach is likely to result in high risk to rights and freedoms.

**Communication Method:**
- Direct email to affected data subjects
- Public announcement if individual communication is impossible
- Clear, plain language

**Notification Contents:**
- Nature of the breach
- Contact point for more information (DPO)
- Likely consequences
- Measures taken or proposed to mitigate adverse effects

**Phase 4: Remediation and Review (Post-breach)**

1. **Remediate:** Fix vulnerabilities, enhance security
2. **Review:** Post-incident analysis
3. **Update:** Update policies, procedures, and training
4. **Report:** Final report to supervisory authority if required

### 8.4 Breach Notification Template

```
Subject: URGENT: Data Breach Notification

Dear [Patient Name],

We are writing to inform you of a data breach that may affect your personal information stored in the DentalHelp platform.

What Happened:
On [Date], we discovered [description of breach].

What Information Was Involved:
[Specific data categories - e.g., name, contact information, medical records]

What We Are Doing:
- [Immediate actions taken]
- [Security enhancements]
- [Notified relevant authorities]

What You Can Do:
- [Recommended actions for data subjects]
- [Resources available - e.g., credit monitoring if CNPs exposed]

Contact Information:
For questions or concerns, please contact our Data Protection Officer:
Email: dpo@dentalhelp.ro
Phone: [DPO Phone Number]

We sincerely apologize for this incident and any inconvenience it may cause.

Sincerely,
DentalHelp Data Protection Team
```

### 8.5 Breach Register

**All breaches documented in breach register, including:**
- Date and time of breach
- Description of breach
- Data affected
- Number of data subjects affected
- Consequences of the breach
- Actions taken
- Notification to supervisory authority (yes/no)
- Notification to data subjects (yes/no)
- Lessons learned

---

## 9. International Data Transfers

### 9.1 Current Status

**Data Location:** All data stored and processed within the European Union (EU)

**Servers:** EU-based data centers

**Third Country Transfers:** ✓ NONE

### 9.2 Future Considerations

If international transfers become necessary:

**Mechanisms:**
- Adequacy decision (Article 45)
- Standard contractual clauses (Article 46)
- Binding corporate rules (Article 47)
- Derogations for specific situations (Article 49)

**Requirements:**
- Ensure equivalent level of protection
- Inform data subjects
- Document transfer mechanisms
- Conduct transfer impact assessment

---

## 10. Children's Data

### 10.1 Age of Consent

**Romania:** Age 16 for consent to information society services

**DentalHelp Policy:** Parental consent required for users under 16

### 10.2 Parental Consent

**Verification:**
- Parent/guardian account linked to child's account
- Parental consent documented
- Age verification at registration

**Implementation:**
```java
public class PatientRegistrationDTO {

    private String cnp;

    private LocalDate dateOfBirth;

    private Boolean isMinor;  // Calculated from CNP/DOB

    private String parentGuardianCNP;  // Required if isMinor == true

    private Boolean parentalConsentGiven;  // Required if isMinor == true

    @AssertTrue(message = "Parental consent required for minors")
    public boolean isParentalConsentValid() {
        if (!isMinor) {
            return true;  // Not applicable
        }
        return parentGuardianCNP != null && parentalConsentGiven;
    }
}
```

### 10.3 Special Protections

- Enhanced privacy protections for children
- No marketing to children without parental consent
- Clear, child-friendly privacy information
- Easy mechanisms for parents to exercise children's rights

---

## 11. Employee Data Protection

### 11.1 Employee Personal Data

**Data Processed:**
- Name, CNP, contact information
- Employment contract details
- Qualifications and credentials (for dentists)
- Work schedule and attendance
- Performance reviews

**Legal Basis:**
- Contract performance
- Legal obligation (tax, labor law)
- Legitimate interests (HR management)

### 11.2 Employee Rights

Employees have the same GDPR rights as patients:
- Right to access their HR data
- Right to rectify incorrect information
- Right to data portability
- Right to object to processing (limited by employment obligations)

### 11.3 Employee Monitoring

**Current Practice:** Minimal monitoring

**Logged:**
- Login/logout times
- System access for security purposes

**Not Monitored:**
- Email content
- Personal communications
- Web browsing (non-work systems)

**Transparency:**
- Employees informed of monitoring
- Purpose clearly communicated
- Proportionate to legitimate aims

---

## 12. Supervisory Authority and Cooperation

### 12.1 Lead Supervisory Authority

**Romania:**
- Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)
- Website: www.dataprotection.ro
- Email: anspdcp@dataprotection.ro
- Address: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, Romania

### 12.2 Cooperation Obligations

**Compliance Requirements:**
- Respond to authority requests
- Provide documentation upon request
- Cooperate with investigations
- Implement corrective measures
- Pay fines if assessed

### 12.3 Data Subject Complaints

**Data subjects have the right to lodge a complaint with ANSPDCP without prejudice to other remedies.**

**DentalHelp Complaint Handling:**
1. Internal complaint to DPO: dpo@dentalhelp.ro
2. Attempt to resolve within 30 days
3. If unresolved, data subject may escalate to ANSPDCP

---

## 13. Data Protection Officer (DPO)

### 13.1 DPO Appointment

**Required:** ✓ YES (processing health data on large scale)

**DPO Details:**
- Name: [DPO Name]
- Email: dpo@dentalhelp.ro
- Phone: [DPO Phone]
- Reporting to: CEO/Board of Directors

### 13.2 DPO Responsibilities

- Monitor GDPR compliance
- Advise on data protection obligations
- Conduct DPIAs
- Cooperate with supervisory authority
- Act as contact point for data subjects and authority
- Provide training and awareness
- Conduct audits

### 13.3 DPO Independence

- Reports to highest management level
- No conflicts of interest
- Not dismissed for performing DPO tasks
- Adequate resources provided
- Professional secrecy/confidentiality

---

## 14. Training and Awareness

### 14.1 Employee Training Program

**Mandatory Training:**
- GDPR fundamentals (all employees)
- Role-specific training (developers, support, medical staff)
- Annual refresher training
- Training for new employees within 30 days

**Training Topics:**
- GDPR principles and rights
- Data protection by design and default
- Security best practices
- Breach reporting procedures
- Handling data subject requests

### 14.2 Developer Training

**Secure Development:**
- Privacy by design
- Secure coding practices
- OWASP Top 10 awareness
- Data minimization in development
- Testing with anonymized data

### 14.3 Awareness Campaigns

- Regular security reminders
- GDPR compliance updates
- Data protection newsletters
- Incident lessons learned

---

## 15. Privacy by Design and Default

### 15.1 Privacy by Design (Article 25)

**Principles:**
- Proactive not reactive
- Privacy as default setting
- Privacy embedded into design
- Full functionality (positive-sum)
- End-to-end security
- Visibility and transparency
- User-centric

**Implementation in DentalHelp:**
- Security considerations in architecture design
- Data minimization from the start
- Access controls built into every service
- Encryption by default
- Audit logging from day one
- GDPR features integrated (not bolted on)

### 15.2 Privacy by Default

**Default Settings:**
- Minimum data collection
- Marketing opt-in (not opt-out)
- Data retention limits enforced
- Access restricted by default
- Secure by default (HTTPS, encryption)

**Examples:**
```java
// New user default settings
public class UserSettings {

    private Boolean marketingEmails = false;  // Opt-in required

    private Boolean dataSharing = false;  // No sharing by default

    private PrivacyLevel profileVisibility = PrivacyLevel.PRIVATE;

    private Boolean analyticsConsent = false;  // Opt-in for analytics
}
```

### 15.3 Data Protection Impact Assessments

**Required for:**
- New processing operations with high risk
- New technologies
- Large-scale processing of special category data
- Systematic monitoring

**Process:**
1. Describe processing and purposes
2. Assess necessity and proportionality
3. Identify risks to data subjects
4. Evaluate measures to address risks
5. Consult DPO
6. Document assessment
7. Review and update regularly

---

## 16. Accountability and Governance

### 16.1 Compliance Monitoring

**Regular Audits:**
- Annual GDPR compliance audit
- Quarterly security assessments
- Continuous monitoring of data processing
- Review of data subject requests

**Metrics Tracked:**
- Data subject request response times
- Consent rates
- Data breach incidents
- Training completion rates
- Policy violations

### 16.2 Governance Structure

```
Board of Directors
        ↓
      CEO
        ↓
┌───────┼───────┐
DPO   CTO    Legal
```

**Responsibilities:**
- **DPO:** GDPR compliance, data protection strategy
- **CTO:** Technical security measures, system architecture
- **Legal:** Contracts, DPAs, regulatory liaison
- **CEO:** Ultimate accountability, resource allocation

### 16.3 Documentation

**Required Documentation:**
- This GDPR Compliance Policy
- Records of processing activities (Article 30)
- DPIAs
- Data breach register
- Consent records
- Data protection agreements
- Training records
- Audit reports

**Document Retention:** As long as processing continues + 7 years

### 16.4 Policy Review

**Review Schedule:**
- Annual comprehensive review
- Ad-hoc review upon:
  - Regulatory changes
  - New processing activities
  - Data breaches
  - Supervisory authority guidance

**Version Control:**
- All policy changes documented
- Version history maintained
- Employees notified of updates

---

## 17. Compliance Checklist

### 17.1 GDPR Compliance Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Legal basis for processing identified | ✓ | Multiple legal bases documented |
| Privacy notice provided | ✓ | At registration and in footer |
| Consent mechanism implemented | ✓ | Granular consent options |
| Right to access (data export) | ✓ | API endpoint implemented |
| Right to rectification | ✓ | User can update data |
| Right to erasure | ✓ | Deletion API with legal checks |
| Right to restrict processing | ⚠ | Partial - needs enhancement |
| Right to data portability | ✓ | JSON export format |
| Right to object | ✓ | Marketing opt-out |
| Automated decision-making safeguards | N/A | No automated decision-making |
| DPO appointed | ✓ | DPO contact: dpo@dentalhelp.ro |
| Records of processing activities | ✓ | Maintained and updated |
| DPIA conducted | ✓ | Completed 2025-11-17 |
| Data breach procedures | ✓ | Documented in this policy |
| Data protection by design | ✓ | Integrated in architecture |
| Data protection by default | ✓ | Secure default settings |
| Processor agreements (DPAs) | ✓ | Main processors covered |
| International transfer safeguards | N/A | No transfers outside EU |
| Children's data protections | ✓ | Parental consent required |
| Employee training | ✓ | Annual training program |

### 17.2 Technical Compliance

| Measure | Status | Priority |
|---------|--------|----------|
| Encryption in transit (HTTPS/TLS) | ✓ | - |
| Encryption at rest | ⚠ | HIGH - Field-level encryption needed |
| Access controls (RBAC) | ✓ | - |
| Multi-factor authentication | ○ | HIGH |
| Audit logging | ✓ | - |
| Pseudonymization in logs | ✓ | - |
| Automated data deletion | ✓ | - |
| Secure password storage | ✓ | - |
| Vulnerability management | ✓ | - |
| Incident response plan | ⚠ | MEDIUM - Needs documentation |

---

## 18. Sanctions and Enforcement

### 18.1 GDPR Penalties

**Administrative Fines:**
- Up to €10 million or 2% of annual global turnover (whichever is higher)
- Up to €20 million or 4% of annual global turnover (for serious violations)

**Other Sanctions:**
- Warnings and reprimands
- Temporary or definitive ban on processing
- Suspension of data flows
- Compensation claims by data subjects

### 18.2 Internal Enforcement

**Policy Violations:**
- Employees violating this policy subject to disciplinary action
- Severity-based consequences (warning to termination)
- Mandatory reporting of violations

**Compliance Incentives:**
- Training completion tracked
- Compliance recognized in performance reviews
- Security awareness awards

---

## 19. Contact Information

### 19.1 Data Protection Officer

**Email:** dpo@dentalhelp.ro
**Phone:** [DPO Phone Number]
**Address:** [DPO Office Address]

**Response Time:** Within 5 business days

### 19.2 General Contact

**Email:** contact@dentalhelp.ro
**Website:** https://dentalhelp.ro
**Privacy Policy:** https://dentalhelp.ro/privacy

### 19.3 Supervisory Authority

**ANSPDCP (Romania)**
**Website:** www.dataprotection.ro
**Email:** anspdcp@dataprotection.ro
**Phone:** +40 21 252 5599
**Address:** B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București

---

## 20. Conclusion

DentalHelp is committed to protecting the personal data of our users in compliance with GDPR and applicable healthcare regulations. This policy establishes our framework for lawful, fair, and transparent data processing.

We continuously review and enhance our data protection measures to ensure the highest standards of privacy and security for the sensitive health information entrusted to us.

**Data protection is everyone's responsibility.** All employees, contractors, and third parties working with DentalHelp must adhere to this policy.

For questions or concerns about this policy or data protection practices, please contact our Data Protection Officer at dpo@dentalhelp.ro.

---

## 21. Document Control

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 1.0 | 2025-11-17 | DPO, Legal Team | Initial policy creation | CEO |

**Review Schedule:** Annual

**Next Review Date:** 2025-11-17

**Approval:** [Pending CEO and Board Approval]

**Distribution:** All employees, available to data subjects on request

---

**This policy is effective as of November 17, 2025**

---

## Appendices

### Appendix A: Glossary of Terms

**CNP (Cod Numeric Personal):** Romanian Personal Numeric Code, a 13-digit unique identifier

**Data Controller:** The entity that determines the purposes and means of processing personal data (DentalHelp)

**Data Processor:** An entity that processes personal data on behalf of the controller

**Data Subject:** An individual whose personal data is processed

**PHI (Protected Health Information):** Health-related information that can be linked to an individual

**Pseudonymization:** Processing data in a way that it can no longer be attributed to a specific data subject without additional information

**Special Categories of Data:** Sensitive personal data including health data, genetic data, biometric data

### Appendix B: Data Subject Request Form

**Available at:** https://dentalhelp.ro/gdpr/request

**Email:** dpo@dentalhelp.ro

**Required Information:**
- Full name
- CNP
- Contact information
- Type of request (access, rectification, erasure, etc.)
- Description of request
- Identity verification documents

### Appendix C: Consent Form Templates

**Available in:**
- Registration flow
- Account settings
- Email preferences page
- Privacy center

### Appendix D: Employee Data Protection Guidelines

**Separate document:** Employee-GDPR-Guidelines.pdf

**Key Points:**
- How to handle patient data
- Security best practices
- Reporting data breaches
- Confidentiality obligations

---

**END OF GDPR COMPLIANCE POLICY**
