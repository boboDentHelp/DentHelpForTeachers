package com.dentalhelp.patient.controller;

import com.dentalhelp.patient.dto.ApiResponse;
import com.dentalhelp.patient.dto.GeneralAnamnesisDto;
import com.dentalhelp.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/in/general-anamnesis")
@RequiredArgsConstructor
public class GeneralAnamnesisController {

    private final PatientService patientService;

    @PostMapping("/add-general-anamnesis-patient")
    public ResponseEntity<ApiResponse> addGeneralAnamnesis(@RequestBody GeneralAnamnesisDto dto) {
        patientService.addGeneralAnamnesis(dto);
        return ResponseEntity.ok(ApiResponse.success("General anamnesis added successfully", null));
    }

    @PutMapping("/update-general-anamnesis")
    public ResponseEntity<ApiResponse> updateGeneralAnamnesis(@RequestBody GeneralAnamnesisDto dto) {
        patientService.updateGeneralAnamnesis(dto);
        return ResponseEntity.ok(ApiResponse.success("General anamnesis updated successfully", null));
    }

    @GetMapping("/get-general-anamnesis/{cnp}")
    public ResponseEntity<ApiResponse> getGeneralAnamnesis(@PathVariable String cnp) {
        GeneralAnamnesisDto data = patientService.getAnamnesiByCnp(cnp);
        return ResponseEntity.ok(ApiResponse.success("General anamnesis retrieved successfully", data));
    }

    @DeleteMapping("/delete-general-anamnesis/{cnp}")
    public ResponseEntity<ApiResponse> deleteGeneralAnamnesis(@PathVariable String cnp) {
        patientService.deleteAnamnesis(cnp);
        return ResponseEntity.ok(ApiResponse.success("General anamnesis deleted successfully", null));
    }
}
