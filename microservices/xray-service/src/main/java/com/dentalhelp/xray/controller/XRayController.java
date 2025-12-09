package com.dentalhelp.xray.controller;

import com.dentalhelp.xray.dto.ApiResponse;
import com.dentalhelp.xray.dto.XRayDto;
import com.dentalhelp.xray.service.XRayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/patient/xray")
@RequiredArgsConstructor
public class XRayController {

    private final XRayService xrayService;

    @GetMapping("/get-patient-xrays/{cnp}")
    public ResponseEntity<ApiResponse> getPatientXRays(@PathVariable String cnp) {
        List<XRayDto> xrays = xrayService.getPatientXRays(cnp);
        return ResponseEntity.ok(ApiResponse.success("X-Rays retrieved successfully", xrays));
    }

    @PostMapping("/save-xray")
    public ResponseEntity<ApiResponse> saveXRay(
            @RequestParam("patientCnp") String patientCnp,
            @RequestParam("date") String date,
            @RequestParam("observations") String observations,
            @RequestParam("file") MultipartFile file) throws IOException {

        XRayDto savedXRay = xrayService.saveXRay(patientCnp, date, observations, file);
        return ResponseEntity.ok(ApiResponse.success("X-Ray uploaded successfully", savedXRay));
    }

    @PutMapping("/update-xray/{id}")
    public ResponseEntity<ApiResponse> updateXRay(
            @PathVariable Long id,
            @RequestParam("date") String date,
            @RequestParam("observations") String observations) {

        xrayService.updateXRay(id, date, observations);
        return ResponseEntity.ok(ApiResponse.success("X-Ray updated successfully", null));
    }

    @DeleteMapping("/delete-xray/{id}")
    public ResponseEntity<ApiResponse> deleteXRay(@PathVariable Long id) {
        xrayService.deleteXRay(id);
        return ResponseEntity.ok(ApiResponse.success("X-Ray deleted successfully", null));
    }
}
