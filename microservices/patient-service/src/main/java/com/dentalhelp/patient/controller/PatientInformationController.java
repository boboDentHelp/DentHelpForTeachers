package com.dentalhelp.patient.controller;

import com.dentalhelp.patient.dto.ApiResponse;
import com.dentalhelp.patient.dto.PatientPersonalDataDto;
import com.dentalhelp.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/in/personalData")
@RequiredArgsConstructor
public class PatientInformationController {

    private final PatientService patientService;

    @PostMapping("/add-personal-data")
    public ResponseEntity<ApiResponse> addPersonalData(@RequestBody PatientPersonalDataDto dto) {
        patientService.addPersonalData(dto);
        return ResponseEntity.ok(ApiResponse.success("Personal data added successfully", null));
    }

    @PutMapping("/update-personal-data")
    public ResponseEntity<ApiResponse> updatePersonalData(@RequestBody PatientPersonalDataDto dto) {
        patientService.updatePersonalData(dto);
        return ResponseEntity.ok(ApiResponse.success("Personal data updated successfully", null));
    }

    @DeleteMapping("/delete-personal-data/{cnp}")
    public ResponseEntity<ApiResponse> deletePersonalData(@PathVariable String cnp) {
        patientService.deletePersonalData(cnp);
        return ResponseEntity.ok(ApiResponse.success("Personal data deleted successfully", null));
    }

    @GetMapping("/get-patient-personal-data/{cnp}")
    public ResponseEntity<ApiResponse> getPersonalData(@PathVariable String cnp) {
        PatientPersonalDataDto data = patientService.getPersonalDataByCnp(cnp);
        return ResponseEntity.ok(ApiResponse.success("Personal data retrieved successfully", data));
    }
}
