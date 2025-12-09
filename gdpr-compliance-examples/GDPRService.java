package com.dentalhelp.auth.service;

import com.dentalhelp.auth.dto.UserDataExportDTO;
import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * GDPR Compliance Service
 *
 * Implements GDPR data protection requirements:
 * - Data export (Article 15, 20)
 * - Data deletion (Article 17)
 * - Data anonymization
 * - Consent management
 * - Audit logging
 *
 * @author DentalHelp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GDPRService {

    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Export all user data across all microservices
     * GDPR Article 15 (Right to Access) and Article 20 (Data Portability)
     *
     * @param cnp Patient CNP
     * @return Complete user data export
     */
    @Transactional(readOnly = true)
    public UserDataExportDTO exportUserData(String cnp) {
        log.info("GDPR: Exporting data for user CNP: {}", cnp);

        UserDataExportDTO exportData = new UserDataExportDTO();
        exportData.setExportDate(LocalDateTime.now());
        exportData.setCnp(cnp);

        // 1. Export from Auth Service (current service)
        Patient patient = patientRepository.findByCnp(cnp)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        exportData.setPersonalInfo(buildPersonalInfo(patient));

        // 2. Export from Patient Service (personal data, anamnesis)
        try {
            String patientServiceUrl = "http://PATIENT-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> patientData = restTemplate.getForObject(patientServiceUrl, Map.class);
            exportData.setPatientData(patientData);
        } catch (Exception e) {
            log.error("Failed to export patient service data", e);
            exportData.setPatientData(Map.of("error", "Data retrieval failed"));
        }

        // 3. Export from Appointment Service
        try {
            String appointmentServiceUrl = "http://APPOINTMENT-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> appointments = restTemplate.getForObject(appointmentServiceUrl, Map.class);
            exportData.setAppointments(appointments);
        } catch (Exception e) {
            log.error("Failed to export appointment data", e);
            exportData.setAppointments(Map.of("error", "Data retrieval failed"));
        }

        // 4. Export from Dental Records Service
        try {
            String dentalRecordsUrl = "http://DENTAL-RECORDS-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> dentalRecords = restTemplate.getForObject(dentalRecordsUrl, Map.class);
            exportData.setDentalRecords(dentalRecords);
        } catch (Exception e) {
            log.error("Failed to export dental records", e);
            exportData.setDentalRecords(Map.of("error", "Data retrieval failed"));
        }

        // 5. Export from X-Ray Service
        try {
            String xrayServiceUrl = "http://XRAY-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> xrays = restTemplate.getForObject(xrayServiceUrl, Map.class);
            exportData.setXrays(xrays);
        } catch (Exception e) {
            log.error("Failed to export x-ray data", e);
            exportData.setXrays(Map.of("error", "Data retrieval failed"));
        }

        // 6. Export from Treatment Service
        try {
            String treatmentServiceUrl = "http://TREATMENT-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> treatments = restTemplate.getForObject(treatmentServiceUrl, Map.class);
            exportData.setTreatments(treatments);
        } catch (Exception e) {
            log.error("Failed to export treatment data", e);
            exportData.setTreatments(Map.of("error", "Data retrieval failed"));
        }

        // 7. Export from Notification Service
        try {
            String notificationServiceUrl = "http://NOTIFICATION-SERVICE/api/internal/gdpr/export/" + cnp;
            Map<String, Object> notifications = restTemplate.getForObject(notificationServiceUrl, Map.class);
            exportData.setNotifications(notifications);
        } catch (Exception e) {
            log.error("Failed to export notification data", e);
            exportData.setNotifications(Map.of("error", "Data retrieval failed"));
        }

        log.info("GDPR: Data export completed for user CNP: {}", cnp);

        // Audit log
        publishAuditEvent("DATA_EXPORT", cnp);

        return exportData;
    }

    /**
     * Delete all user data across all microservices
     * GDPR Article 17 (Right to Erasure)
     *
     * This is a cascading deletion across all services
     *
     * @param cnp Patient CNP
     */
    @Transactional
    public void deleteUserData(String cnp) {
        log.warn("GDPR: Initiating data deletion for user CNP: {}", cnp);

        Patient patient = patientRepository.findByCnp(cnp)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Publish deletion event to all services via RabbitMQ
        Map<String, Object> deletionEvent = new HashMap<>();
        deletionEvent.put("cnp", cnp);
        deletionEvent.put("email", patient.getEmail());
        deletionEvent.put("timestamp", LocalDateTime.now().toString());
        deletionEvent.put("reason", "GDPR_DELETION_REQUEST");

        // Send deletion events to all services
        rabbitTemplate.convertAndSend("gdpr.exchange", "gdpr.delete", deletionEvent);

        // Delete from local database (Auth Service)
        patientRepository.delete(patient);

        log.info("GDPR: Data deletion completed for user CNP: {}", cnp);

        // Audit log
        publishAuditEvent("DATA_DELETION", cnp);
    }

    /**
     * Anonymize user data
     * Alternative to deletion - retains statistical records
     *
     * @param cnp Patient CNP
     */
    @Transactional
    public void anonymizeUserData(String cnp) {
        log.info("GDPR: Anonymizing data for user CNP: {}", cnp);

        Patient patient = patientRepository.findByCnp(cnp)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Anonymize personal identifiable information
        patient.setEmail("anonymized_" + patient.getId() + "@deleted.local");
        patient.setFirstName("ANONYMIZED");
        patient.setLastName("USER");
        patient.setCnp("ANONYMIZED_" + patient.getId());

        patientRepository.save(patient);

        // Publish anonymization event to other services
        Map<String, Object> anonymizationEvent = new HashMap<>();
        anonymizationEvent.put("cnp", cnp);
        anonymizationEvent.put("timestamp", LocalDateTime.now().toString());
        anonymizationEvent.put("reason", "GDPR_ANONYMIZATION_REQUEST");

        rabbitTemplate.convertAndSend("gdpr.exchange", "gdpr.anonymize", anonymizationEvent);

        log.info("GDPR: Data anonymization completed for user CNP: {}", cnp);

        // Audit log
        publishAuditEvent("DATA_ANONYMIZATION", cnp);
    }

    /**
     * Build personal info map from patient entity
     */
    private Map<String, Object> buildPersonalInfo(Patient patient) {
        Map<String, Object> info = new HashMap<>();
        info.put("cnp", patient.getCnp());
        info.put("firstName", patient.getFirstName());
        info.put("lastName", patient.getLastName());
        info.put("email", patient.getEmail());
        info.put("userRole", patient.getUserRole());
        info.put("isVerified", patient.getIsVerified());
        info.put("createdAt", patient.getCreatedAt());
        info.put("updatedAt", patient.getUpdatedAt());
        return info;
    }

    /**
     * Publish audit event for GDPR operations
     */
    private void publishAuditEvent(String action, String cnp) {
        Map<String, Object> auditEvent = new HashMap<>();
        auditEvent.put("action", action);
        auditEvent.put("cnp", cnp);
        auditEvent.put("timestamp", LocalDateTime.now().toString());
        auditEvent.put("service", "AUTH-SERVICE");

        rabbitTemplate.convertAndSend("audit.exchange", "audit.gdpr", auditEvent);
    }
}
