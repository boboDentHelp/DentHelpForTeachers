package com.dentalhelp.dentalrecords.controller;

import com.dentalhelp.dentalrecords.dto.ApiResponse;
import com.dentalhelp.dentalrecords.dto.ToothInterventionDto;
import com.dentalhelp.dentalrecords.service.DentalRecordsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/in/teeth")
@RequiredArgsConstructor
public class ToothInterventionController {

    private final DentalRecordsService dentalRecordsService;

    @GetMapping("/get_patient_tooth_history/{cnp}/{toothNumber}")
    public ResponseEntity<ApiResponse> getPatientToothHistory(
            @PathVariable String cnp,
            @PathVariable int toothNumber) {
        List<ToothInterventionDto> interventions = dentalRecordsService
                .getAllPatientToothIntervention(cnp, toothNumber);
        return ResponseEntity.ok(ApiResponse.success("Interventions extracted successfully", interventions));
    }

    @GetMapping("/get_patient_all_tooth_history/{cnp}")
    public ResponseEntity<ApiResponse> getPatientAllToothHistory(@PathVariable String cnp) {
        List<ToothInterventionDto> interventions = dentalRecordsService
                .getAllPatientToothInterventions(cnp);
        return ResponseEntity.ok(ApiResponse.success("Interventions extracted successfully", interventions));
    }

    @GetMapping("/get_patient_all_extracted_tooth/{cnp}")
    public ResponseEntity<ApiResponse> getPatientAllExtractedTooth(@PathVariable String cnp) {
        List<ToothInterventionDto> interventions = dentalRecordsService
                .getPatientAllExtractedTooth(cnp);
        return ResponseEntity.ok(ApiResponse.success("Extracted teeth retrieved successfully", interventions));
    }

    @PostMapping("/addNewIntervention")
    public ResponseEntity<ApiResponse> addNewIntervention(@RequestBody ToothInterventionDto dto) {
        dentalRecordsService.addNewIntervention(dto);
        return ResponseEntity.ok(ApiResponse.success("New intervention added successfully", null));
    }

    @DeleteMapping("/deleteIntervention/{interventionId}")
    public ResponseEntity<ApiResponse> deleteIntervention(@PathVariable Long interventionId) {
        dentalRecordsService.deleteIntervention(interventionId);
        return ResponseEntity.ok(ApiResponse.success("Intervention deleted successfully", null));
    }

    @PutMapping("/editIntervention")
    public ResponseEntity<ApiResponse> editIntervention(@RequestBody ToothInterventionDto dto) {
        dentalRecordsService.updateIntervention(dto);
        return ResponseEntity.ok(ApiResponse.success("Intervention updated successfully", null));
    }

    @DeleteMapping("/deleteExtraction/{cnp}/{toothNumber}")
    public ResponseEntity<ApiResponse> deleteExtraction(
            @PathVariable String cnp,
            @PathVariable int toothNumber) {
        dentalRecordsService.deleteTeethExtraction(cnp, toothNumber);
        return ResponseEntity.ok(ApiResponse.success("Teeth extraction deleted successfully", null));
    }
}
