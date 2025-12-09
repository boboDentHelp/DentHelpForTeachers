package com.dentalhelp.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * GDPR User Data Export DTO
 *
 * Contains all user data from all microservices for GDPR compliance
 * Implements Article 15 (Right to Access) and Article 20 (Data Portability)
 *
 * @author DentalHelp Team
 * @version 1.0
 */
@Data
public class UserDataExportDTO {

    /**
     * Metadata
     */
    private String cnp;
    private LocalDateTime exportDate;
    private String format = "JSON";

    /**
     * Personal Information (Auth Service)
     */
    private Map<String, Object> personalInfo;

    /**
     * Patient Data (Patient Service)
     * - Personal data
     * - General anamnesis
     * - Medical history
     */
    private Map<String, Object> patientData;

    /**
     * Appointments (Appointment Service)
     * - All past and future appointments
     * - Appointment requests
     */
    private Map<String, Object> appointments;

    /**
     * Dental Records (Dental Records Service)
     * - Tooth interventions
     * - Tooth problems
     * - Dental history
     */
    private Map<String, Object> dentalRecords;

    /**
     * X-Rays (X-Ray Service)
     * - X-ray images
     * - X-ray metadata
     */
    private Map<String, Object> xrays;

    /**
     * Treatments (Treatment Service)
     * - Treatment sheets
     * - Medical reports
     * - Medications
     */
    private Map<String, Object> treatments;

    /**
     * Notifications (Notification Service)
     * - Email notifications
     * - Notification history
     */
    private Map<String, Object> notifications;

    /**
     * Consent History
     * - Data processing consents
     * - Consent timestamps
     */
    private Map<String, Object> consentHistory;

    /**
     * Audit Log
     * - Data access history
     * - Data modification history
     */
    private Map<String, Object> auditLog;
}
