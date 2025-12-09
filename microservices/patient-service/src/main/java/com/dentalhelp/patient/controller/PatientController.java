package com.dentalhelp.patient.controller;

import com.dentalhelp.patient.dto.ApiResponse;
import com.dentalhelp.patient.dto.PatientPersonalDataDto;
import com.dentalhelp.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final RestTemplate restTemplate;

    @GetMapping("/get-patients")
    public ResponseEntity<ApiResponse> getAllPatients() {
        try {
            // Get personal data from patient service
            List<PatientPersonalDataDto> personalDataList = patientService.getAllPatients();

            // Fetch auth data for each patient and combine
            List<Map<String, Object>> combinedPatients = new ArrayList<>();

            for (PatientPersonalDataDto personalData : personalDataList) {
                Map<String, Object> combined = new HashMap<>();
                combined.put("cnp", personalData.getPatientCnp());
                combined.put("addressStreet", personalData.getAddressStreet());
                combined.put("addressNumber", personalData.getAddressNumber());
                combined.put("addressCountry", personalData.getAddressCountry());
                combined.put("addressRegion", personalData.getAddressRegion());
                combined.put("phoneNumber", personalData.getPhoneNumber());
                combined.put("sex", personalData.getSex());
                combined.put("id", personalData.getIdPersonalData());

                try {
                    // Call auth service to get patient name and email
                    String authServiceUrl = "http://AUTH-SERVICE/api/admin/auth/get-patient-info/" + personalData.getPatientCnp();
                    ResponseEntity<Map> authResponse = restTemplate.getForEntity(authServiceUrl, Map.class);

                    if (authResponse.getStatusCode().is2xxSuccessful() && authResponse.getBody() != null) {
                        Map<String, Object> authData = (Map<String, Object>) authResponse.getBody().get("data");

                        // Add auth data to combined object
                        combined.put("firstName", authData.get("firstName"));
                        combined.put("lastName", authData.get("lastName"));
                        combined.put("email", authData.get("email"));
                        combined.put("userRole", authData.get("userRole"));
                    } else {
                        // Fallback values if auth service doesn't return success
                        combined.put("firstName", "Unknown");
                        combined.put("lastName", "Patient");
                        combined.put("email", "N/A");
                        combined.put("userRole", "PATIENT");
                    }
                } catch (Exception e) {
                    // If auth service call fails, use fallback values
                    System.err.println("⚠️ Failed to fetch auth data for CNP: " + personalData.getPatientCnp() + " - Using fallback values");
                    combined.put("firstName", "Unknown");
                    combined.put("lastName", "Patient");
                    combined.put("email", "N/A");
                    combined.put("userRole", "PATIENT");
                }

                combinedPatients.add(combined);
            }

            return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", combinedPatients));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve patients: " + e.getMessage()));
        }
    }

    @GetMapping("/get-patient-personal-data/{cnp}")
    public ResponseEntity<ApiResponse> getPatientPersonalData(@PathVariable String cnp) {
        PatientPersonalDataDto data = patientService.getPersonalDataByCnp(cnp);
        return ResponseEntity.ok(ApiResponse.success("Patient data retrieved successfully", data));
    }

    @PutMapping("/change-radiologist-to-patient/{cnp}")
    public ResponseEntity<ApiResponse> changeRadiologistToPatient(@PathVariable String cnp) {
        try {
            // Call auth service to change role
            String authServiceUrl = "http://AUTH-SERVICE/api/admin/auth/change-role-to-patient/" + cnp;
            restTemplate.put(authServiceUrl, null);

            return ResponseEntity.ok(ApiResponse.success("Role changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to change role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-personal-data/{cnp}")
    public ResponseEntity<ApiResponse> deletePersonalData(@PathVariable String cnp) {
        try {
            patientService.deletePersonalData(cnp);
            return ResponseEntity.ok(ApiResponse.success("Patient personal data deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to delete personal data: " + e.getMessage()));
        }
    }
}
