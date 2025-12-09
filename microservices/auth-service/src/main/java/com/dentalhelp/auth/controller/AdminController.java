package com.dentalhelp.auth.controller;

import com.dentalhelp.auth.dto.ApiResponse;
import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.model.UserRole;
import com.dentalhelp.auth.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @GetMapping("/auth/get-patient-info/{cnp}")
    public ResponseEntity<ApiResponse> getPatientInfo(@PathVariable String cnp) {
        Patient patient = patientRepository.findByCNP(cnp)
                .orElseThrow(() -> new RuntimeException("Patient not found with CNP: " + cnp));

        Map<String, Object> patientInfo = new HashMap<>();
        patientInfo.put("firstName", patient.getFirstName());
        patientInfo.put("lastName", patient.getLastName());
        patientInfo.put("email", patient.getEmail());
        patientInfo.put("cnp", patient.getCNP());
        patientInfo.put("userRole", patient.getUserRole());

        return ResponseEntity.ok(ApiResponse.success("Patient info retrieved successfully", patientInfo));
    }

    @PostMapping("/patient/addPatient")
    public ResponseEntity<ApiResponse> addPatient(@RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            String firstName = (String) request.get("firstName");
            String lastName = (String) request.get("lastName");
            String cnp = (String) request.get("cnp");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String userRoleStr = (String) request.get("userRole");

            if (firstName == null || lastName == null || cnp == null || email == null || password == null || userRoleStr == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Missing required fields"));
            }

            // Check if user already exists
            if (patientRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email already exists"));
            }

            if (patientRepository.findByCNP(cnp).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("CNP already exists"));
            }

            // Create new patient
            Patient patient = new Patient();
            patient.setFirstName(firstName);
            patient.setLastName(lastName);
            patient.setCNP(cnp);
            patient.setEmail(email);
            patient.setPassword(passwordEncoder.encode(password));
            patient.setUserRole(UserRole.valueOf(userRoleStr));

            patientRepository.save(patient);

            // Create patient personal data in patient-service
            try {
                Map<String, Object> personalDataRequest = new HashMap<>();
                personalDataRequest.put("patientCnp", cnp);
                personalDataRequest.put("addressStreet", "");
                personalDataRequest.put("addressNumber", "");
                personalDataRequest.put("addressCountry", "");
                personalDataRequest.put("addressRegion", "");
                personalDataRequest.put("phoneNumber", "");
                personalDataRequest.put("sex", "");

                String patientServiceUrl = "http://PATIENT-SERVICE/api/in/personalData/add-personal-data";
                restTemplate.postForEntity(patientServiceUrl, personalDataRequest, Map.class);

                System.out.println("✅ [AUTH] Created patient personal data in patient-service for CNP: " + cnp);
            } catch (Exception e) {
                System.err.println("⚠️ [AUTH] Failed to create patient personal data in patient-service: " + e.getMessage());
                // Continue - patient is created in auth-service, personal data can be added later
            }

            Map<String, Object> response = new HashMap<>();
            response.put("cnp", patient.getCNP());
            response.put("email", patient.getEmail());
            response.put("firstName", patient.getFirstName());
            response.put("lastName", patient.getLastName());

            return ResponseEntity.ok(ApiResponse.success("Patient created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create patient: " + e.getMessage()));
        }
    }

    @PutMapping("/auth/change-role-to-patient/{cnp}")
    public ResponseEntity<ApiResponse> changeRoleToPatient(@PathVariable String cnp) {
        try {
            Patient patient = patientRepository.findByCNP(cnp)
                    .orElseThrow(() -> new RuntimeException("Patient not found with CNP: " + cnp));

            patient.setUserRole(UserRole.PATIENT);
            patientRepository.save(patient);

            return ResponseEntity.ok(ApiResponse.success("Role changed to PATIENT successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to change role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/patient/delete-patient/{cnp}")
    public ResponseEntity<ApiResponse> deletePatient(@PathVariable String cnp) {
        try {
            // Find patient first
            Patient patient = patientRepository.findByCNP(cnp)
                    .orElseThrow(() -> new RuntimeException("Patient not found with CNP: " + cnp));

            // Delete patient personal data from patient-service
            try {
                String patientServiceUrl = "http://PATIENT-SERVICE/api/admin/patient/delete-personal-data/" + cnp;
                restTemplate.delete(patientServiceUrl);
                System.out.println("✅ [AUTH] Deleted patient personal data from patient-service for CNP: " + cnp);
            } catch (Exception e) {
                System.err.println("⚠️ [AUTH] Failed to delete patient personal data from patient-service: " + e.getMessage());
                // Continue - we'll delete the user anyway
            }

            // Delete patient from auth-service
            patientRepository.delete(patient);
            System.out.println("✅ [AUTH] Deleted patient from auth-service for CNP: " + cnp);

            return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete patient: " + e.getMessage()));
        }
    }
}
