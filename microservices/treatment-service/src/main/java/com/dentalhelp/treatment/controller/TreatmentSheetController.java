package com.dentalhelp.treatment.controller;

import com.dentalhelp.treatment.dto.ApiResponse;
import com.dentalhelp.treatment.dto.TreatmentSheetDto;
import com.dentalhelp.treatment.service.TreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/in/treatment-sheet")
@RequiredArgsConstructor
public class TreatmentSheetController {

    private final TreatmentService treatmentService;

    @GetMapping("/get-treatment-sheet/{appointmentId}")
    public ResponseEntity<ApiResponse> getTreatmentSheet(@PathVariable Long appointmentId) {
        TreatmentSheetDto sheet = treatmentService.getTreatmentSheetByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Treatment sheet retrieved successfully", sheet));
    }

    @PostMapping("/save-treatment-sheet")
    public ResponseEntity<ApiResponse> saveTreatmentSheet(@RequestBody TreatmentSheetDto dto) {
        treatmentService.saveTreatmentSheet(dto);
        return ResponseEntity.ok(ApiResponse.success("Treatment sheet saved successfully", null));
    }

    @PutMapping("/update-sheet-treatment")
    public ResponseEntity<ApiResponse> updateTreatmentSheet(@RequestBody TreatmentSheetDto dto) {
        treatmentService.updateTreatmentSheet(dto);
        return ResponseEntity.ok(ApiResponse.success("Treatment sheet updated successfully", null));
    }

    @DeleteMapping("/delete-treatment-sheet/{treatmentNumber}")
    public ResponseEntity<ApiResponse> deleteTreatmentSheet(@PathVariable Long treatmentNumber) {
        treatmentService.deleteTreatmentSheet(treatmentNumber);
        return ResponseEntity.ok(ApiResponse.success("Treatment sheet deleted successfully", null));
    }
}
