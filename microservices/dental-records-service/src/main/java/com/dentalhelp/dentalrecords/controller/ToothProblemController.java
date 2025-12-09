package com.dentalhelp.dentalrecords.controller;

import com.dentalhelp.dentalrecords.dto.ApiResponse;
import com.dentalhelp.dentalrecords.dto.ToothProblemDto;
import com.dentalhelp.dentalrecords.service.DentalRecordsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/in/teeth/problems")
@RequiredArgsConstructor
public class ToothProblemController {

    private final DentalRecordsService dentalRecordsService;

    @GetMapping("/get_patient_tooth_problems/{cnp}/{toothNumber}")
    public ResponseEntity<ApiResponse> getPatientToothProblems(
            @PathVariable String cnp,
            @PathVariable int toothNumber) {
        List<ToothProblemDto> problems = dentalRecordsService
                .getPatientToothProblems(cnp, toothNumber);
        return ResponseEntity.ok(ApiResponse.success("Problems extracted successfully", problems));
    }

    @GetMapping("/get_patient_all_tooth_problems/{cnp}")
    public ResponseEntity<ApiResponse> getPatientAllToothProblems(@PathVariable String cnp) {
        List<ToothProblemDto> problems = dentalRecordsService
                .getPatientAllToothProblems(cnp);
        return ResponseEntity.ok(ApiResponse.success("Problems extracted successfully", problems));
    }

    @PostMapping("/addNewProblem")
    public ResponseEntity<ApiResponse> addNewProblem(@RequestBody ToothProblemDto dto) {
        dentalRecordsService.addNewProblem(dto);
        return ResponseEntity.ok(ApiResponse.success("New problem added successfully", null));
    }

    @DeleteMapping("/deleteProblem/{problemId}")
    public ResponseEntity<ApiResponse> deleteProblem(@PathVariable Long problemId) {
        dentalRecordsService.deleteProblem(problemId);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully", null));
    }

    @PutMapping("/editProblem")
    public ResponseEntity<ApiResponse> editProblem(@RequestBody ToothProblemDto dto) {
        dentalRecordsService.updateProblem(dto);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", null));
    }
}
