package com.dentalhelp.treatment.controller;

import com.dentalhelp.treatment.dto.ApiResponse;
import com.dentalhelp.treatment.dto.MedicalReportDto;
import com.dentalhelp.treatment.service.TreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/patients/medical-record")
@RequiredArgsConstructor
public class MedicalReportController {

    private final TreatmentService treatmentService;

    @GetMapping("/get-medical-record/{appointmentId}")
    public ResponseEntity<ApiResponse> getMedicalReport(@PathVariable Long appointmentId) {
        MedicalReportDto report = treatmentService.getMedicalReportByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Medical report retrieved successfully", report));
    }

    @PostMapping("/new-medical-record")
    public ResponseEntity<ApiResponse> saveMedicalReport(@RequestBody MedicalReportDto dto) {
        treatmentService.saveMedicalReport(dto);
        return ResponseEntity.ok(ApiResponse.success("Medical report saved successfully", null));
    }

    @PutMapping("/update-medical-record")
    public ResponseEntity<ApiResponse> updateMedicalReport(@RequestBody MedicalReportDto dto) {
        treatmentService.updateMedicalReport(dto);
        return ResponseEntity.ok(ApiResponse.success("Medical report updated successfully", null));
    }

    @DeleteMapping("/delete-medical-record/{id}")
    public ResponseEntity<ApiResponse> deleteMedicalReport(@PathVariable Long id) {
        treatmentService.deleteMedicalReport(id);
        return ResponseEntity.ok(ApiResponse.success("Medical report deleted successfully", null));
    }
}
