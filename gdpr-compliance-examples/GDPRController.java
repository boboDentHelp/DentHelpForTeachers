package com.dentalhelp.auth.controller;

import com.dentalhelp.auth.dto.UserDataExportDTO;
import com.dentalhelp.auth.service.GDPRService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * GDPR Compliance Controller
 *
 * Implements GDPR requirements for data protection:
 * - Right to access (Article 15)
 * - Right to data portability (Article 20)
 * - Right to erasure/deletion (Article 17)
 *
 * @author DentalHelp Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/gdpr")
@RequiredArgsConstructor
@Tag(name = "GDPR Compliance", description = "GDPR data protection endpoints")
public class GDPRController {

    private final GDPRService gdprService;

    /**
     * GDPR Article 15: Right to Access
     * Export all user data in a portable format
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Complete user data export
     */
    @Operation(
        summary = "Export user data",
        description = "Exports all personal data associated with the user (GDPR Article 15 & 20)"
    )
    @GetMapping("/export/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<UserDataExportDTO> exportUserData(@PathVariable String cnp) {
        UserDataExportDTO exportData = gdprService.exportUserData(cnp);
        return ResponseEntity.ok(exportData);
    }

    /**
     * GDPR Article 17: Right to Erasure
     * Delete all user data and account
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Confirmation of deletion
     */
    @Operation(
        summary = "Delete user data",
        description = "Permanently deletes all user data and account (GDPR Article 17)"
    )
    @DeleteMapping("/delete/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserData(@PathVariable String cnp) {
        gdprService.deleteUserData(cnp);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /**
     * Request data anonymization instead of deletion
     * Anonymizes personal data while retaining statistical records
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Confirmation of anonymization
     */
    @Operation(
        summary = "Anonymize user data",
        description = "Anonymizes personal identifiable information while retaining anonymized records"
    )
    @PostMapping("/anonymize/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> anonymizeUserData(@PathVariable String cnp) {
        gdprService.anonymizeUserData(cnp);
        return ResponseEntity.ok().build();
    }

    /**
     * Get user consent history
     * Track consent for data processing
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Consent history
     */
    @Operation(
        summary = "Get consent history",
        description = "Retrieves user's consent history for data processing"
    )
    @GetMapping("/consent/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getConsentHistory(@PathVariable String cnp) {
        // Implementation would return consent tracking data
        return ResponseEntity.ok().build();
    }

    /**
     * Update user consent preferences
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Updated consent preferences
     */
    @Operation(
        summary = "Update consent",
        description = "Updates user's consent preferences for data processing"
    )
    @PutMapping("/consent/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateConsent(@PathVariable String cnp, @RequestBody Object consentData) {
        // Implementation would update consent preferences
        return ResponseEntity.ok().build();
    }

    /**
     * Get data processing audit log
     * Track all access to user data for compliance
     *
     * @param cnp Patient CNP (unique identifier)
     * @return Audit log of data access
     */
    @Operation(
        summary = "Get data access audit log",
        description = "Retrieves audit log of all access to user's personal data"
    )
    @GetMapping("/audit/{cnp}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getDataAccessAudit(@PathVariable String cnp) {
        // Implementation would return audit trail
        return ResponseEntity.ok().build();
    }
}
