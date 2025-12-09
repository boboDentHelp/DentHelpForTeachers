# GDPR Compliance Implementation Examples

This directory contains example implementations for GDPR compliance endpoints in the DentalHelp microservices architecture.

## Overview

The GDPR (General Data Protection Regulation) requires that applications provide users with specific rights regarding their personal data. These examples demonstrate how to implement these requirements in a distributed microservices architecture.

## GDPR Rights Implemented

### 1. Right to Access (Article 15)
Users can request access to all their personal data.

**Endpoint**: `GET /api/gdpr/export/{cnp}`

**Implementation**: `GDPRController.java:36-43`

**Features**:
- Aggregates data from all microservices
- Returns data in portable JSON format
- Includes metadata about export

### 2. Right to Data Portability (Article 20)
Users can receive their data in a structured, machine-readable format.

**Endpoint**: `GET /api/gdpr/export/{cnp}`

**Format**: JSON (easily convertible to CSV, XML)

### 3. Right to Erasure/Deletion (Article 17)
Users can request deletion of all their personal data.

**Endpoint**: `DELETE /api/gdpr/delete/{cnp}`

**Implementation**: `GDPRController.java:52-60`

**Features**:
- Cascading deletion across all microservices
- Event-driven deletion via RabbitMQ
- Audit trail of deletion

### 4. Right to Data Anonymization
Alternative to deletion - anonymizes PII while retaining statistical records.

**Endpoint**: `POST /api/gdpr/anonymize/{cnp}`

**Implementation**: `GDPRController.java:70-79`

### 5. Consent Management
Track and manage user consent for data processing.

**Endpoints**:
- `GET /api/gdpr/consent/{cnp}` - Get consent history
- `PUT /api/gdpr/consent/{cnp}` - Update consent

**Implementation**: `GDPRController.java:88-114`

### 6. Audit Logging
Track all access and modifications to user data.

**Endpoint**: `GET /api/gdpr/audit/{cnp}`

**Implementation**: `GDPRController.java:124-133`

## Architecture

### Data Export Flow

```
Client Request
    ↓
API Gateway → Auth Service (GDPR Controller)
    ↓
GDPRService aggregates data from:
    ├── Auth Service (local)
    ├── Patient Service (REST call)
    ├── Appointment Service (REST call)
    ├── Dental Records Service (REST call)
    ├── X-Ray Service (REST call)
    ├── Treatment Service (REST call)
    └── Notification Service (REST call)
    ↓
Returns UserDataExportDTO
```

### Data Deletion Flow

```
Client Request
    ↓
API Gateway → Auth Service (GDPR Controller)
    ↓
GDPRService:
    ├── Delete local data (Auth DB)
    └── Publish deletion event to RabbitMQ
        ↓
RabbitMQ Exchange: gdpr.exchange
    ├── Patient Service (subscriber)
    ├── Appointment Service (subscriber)
    ├── Dental Records Service (subscriber)
    ├── X-Ray Service (subscriber)
    ├── Treatment Service (subscriber)
    └── Notification Service (subscriber)
        ↓
Each service deletes user data
```

## Implementation in Each Service

Each microservice needs to implement internal GDPR endpoints:

### Example: Patient Service

```java
@RestController
@RequestMapping("/api/internal/gdpr")
public class InternalGDPRController {

    @GetMapping("/export/{cnp}")
    public Map<String, Object> exportData(@PathVariable String cnp) {
        // Export all patient data
        return patientService.exportGDPRData(cnp);
    }

    @RabbitListener(queues = "gdpr.delete.patient")
    public void handleDeletion(Map<String, Object> event) {
        String cnp = (String) event.get("cnp");
        // Delete all patient data
        patientService.deleteGDPRData(cnp);
    }

    @RabbitListener(queues = "gdpr.anonymize.patient")
    public void handleAnonymization(Map<String, Object> event) {
        String cnp = (String) event.get("cnp");
        // Anonymize patient data
        patientService.anonymizeGDPRData(cnp);
    }
}
```

## RabbitMQ Configuration

### Exchanges and Queues

```java
@Configuration
public class GDPRRabbitConfig {

    @Bean
    public TopicExchange gdprExchange() {
        return new TopicExchange("gdpr.exchange");
    }

    @Bean
    public Queue deletionQueue() {
        return new Queue("gdpr.delete.patient");
    }

    @Bean
    public Queue anonymizationQueue() {
        return new Queue("gdpr.anonymize.patient");
    }

    @Bean
    public Binding deletionBinding() {
        return BindingBuilder
            .bind(deletionQueue())
            .to(gdprExchange())
            .with("gdpr.delete");
    }

    @Bean
    public Binding anonymizationBinding() {
        return BindingBuilder
            .bind(anonymizationQueue())
            .to(gdprExchange())
            .with("gdpr.anonymize");
    }
}
```

## Data Export Format

### Example Export Response

```json
{
  "cnp": "1234567890123",
  "exportDate": "2025-11-15T10:30:00",
  "format": "JSON",
  "personalInfo": {
    "cnp": "1234567890123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "userRole": "PATIENT",
    "isVerified": true,
    "createdAt": "2024-01-15T08:00:00",
    "updatedAt": "2024-11-10T14:20:00"
  },
  "patientData": {
    "personalData": {...},
    "generalAnamnesis": {...}
  },
  "appointments": [
    {
      "id": 1,
      "date": "2024-11-20T10:00:00",
      "status": "CONFIRMED",
      "notes": "Regular checkup"
    }
  ],
  "dentalRecords": {
    "interventions": [...],
    "problems": [...]
  },
  "xrays": [
    {
      "id": 1,
      "uploadDate": "2024-10-15",
      "type": "PANORAMIC",
      "fileUrl": "https://..."
    }
  ],
  "treatments": [...],
  "notifications": [...]
}
```

## Security Considerations

### 1. Authentication
- All GDPR endpoints require authentication
- JWT token validation
- Role-based access control

### 2. Authorization
```java
@PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
```

- Users can only access their own data
- Admins can access all data (for legal compliance)

### 3. Audit Logging
Every GDPR operation is logged:
- Who requested the operation
- When it was performed
- What data was accessed/deleted
- IP address of requester

### 4. Data Retention
- Deletion requests processed within 30 days
- Audit logs retained for legal compliance
- Some data may be retained for legal obligations

## Testing GDPR Endpoints

### 1. Export User Data

```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@denthelp.ro","password":"password123"}' \
  | jq -r '.token')

# Export data
curl -X GET http://localhost:8080/api/gdpr/export/2950101123456 \
  -H "Authorization: Bearer $TOKEN" \
  | jq . > user_data_export.json
```

### 2. Delete User Data

```bash
curl -X DELETE http://localhost:8080/api/gdpr/delete/2950101123456 \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Anonymize User Data

```bash
curl -X POST http://localhost:8080/api/gdpr/anonymize/2950101123456 \
  -H "Authorization: Bearer $TOKEN"
```

## Compliance Checklist

- [x] Right to Access (Article 15)
- [x] Right to Data Portability (Article 20)
- [x] Right to Erasure (Article 17)
- [x] Consent Management
- [x] Audit Logging
- [ ] Data Breach Notification (to be implemented)
- [ ] Privacy by Design documentation
- [ ] Data Protection Impact Assessment (DPIA)
- [ ] Privacy Policy update
- [ ] Terms of Service update

## Deployment Steps

### 1. Add GDPR Controllers to Services

Copy the controller and service examples to each microservice:
- Auth Service (main orchestrator)
- Patient Service
- Appointment Service
- Dental Records Service
- X-Ray Service
- Treatment Service
- Notification Service

### 2. Configure RabbitMQ Exchanges

Update `rabbitmq-init/definitions.json`:

```json
{
  "exchanges": [
    {
      "name": "gdpr.exchange",
      "type": "topic",
      "durable": true
    }
  ],
  "queues": [
    {"name": "gdpr.delete.patient"},
    {"name": "gdpr.delete.appointment"},
    {"name": "gdpr.delete.dental"},
    {"name": "gdpr.delete.xray"},
    {"name": "gdpr.delete.treatment"},
    {"name": "gdpr.delete.notification"}
  ]
}
```

### 3. Update API Gateway Routes

Ensure GDPR routes are exposed through API Gateway.

### 4. Deploy and Test

```bash
# Rebuild services
docker-compose build

# Start services
docker-compose up -d

# Test GDPR endpoints
./test-gdpr-endpoints.sh
```

## Legal Considerations

### Data Retention Policies
- User data: Retained while account active
- Deleted data: Purged immediately (except legal holds)
- Audit logs: Retained for 7 years
- Backup data: Purged within 90 days

### Exceptions to Deletion
Data may be retained if:
- Required by law
- Part of ongoing legal proceedings
- Necessary for public interest
- Part of research with safeguards

### User Communication
When processing GDPR requests:
1. Acknowledge receipt (within 72 hours)
2. Verify identity
3. Process request (within 30 days)
4. Confirm completion
5. Provide export file (if applicable)

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [GDPR Developer Guide](https://www.gdprdeveloper.com/)
- [Spring Security GDPR](https://spring.io/guides/gs/securing-web/)
- [Microservices GDPR Patterns](https://microservices.io/patterns/data/saga.html)

## Support

For questions about GDPR implementation:
- Review this documentation
- Check service-specific implementations
- Consult legal team for compliance questions

---

**Note**: These are example implementations. Always consult with legal counsel before deploying GDPR compliance features in production.
