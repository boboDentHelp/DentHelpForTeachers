package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.AnamnesisAppointmentDto;
import com.dentalhelp.appointment.dto.ApiResponse;
import com.dentalhelp.appointment.model.AnamnesisAppointment;
import com.dentalhelp.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/in/appointment_request")
@RequiredArgsConstructor
public class AnamnesisAppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/saveAppointmentAnamnesis")
    public ResponseEntity<ApiResponse> saveAppointmentAnamnesis(@RequestBody AnamnesisAppointmentDto anamnesisDto) {
        appointmentService.saveAnamnesisAppointment(anamnesisDto);
        return ResponseEntity.ok(ApiResponse.success("Anamnesis saved successfully", null));
    }

    @GetMapping("/getAnamnesisAppointment/{appointmentId}")
    public ResponseEntity<ApiResponse> getAnamnesisAppointment(@PathVariable Long appointmentId) {
        AnamnesisAppointment anamnesis = appointmentService.getAnamnesisAppointment(appointmentId);

        AnamnesisAppointmentDto dto = new AnamnesisAppointmentDto();
        dto.setAnamneseAppointmentId(anamnesis.getAnamneseAppointmentId());
        dto.setAppointmentId(anamnesis.getAppointment().getAppointmentId());
        dto.setAppointmentReason(anamnesis.getAppointmentReason());
        dto.setCurrentMedication(anamnesis.getCurrentMedication());
        dto.setRecentMedication(anamnesis.getRecentMedication());
        dto.setPregnancy(anamnesis.getPregnancy());
        dto.setCurrentSymptoms(anamnesis.getCurrentSymptoms());

        return ResponseEntity.ok(ApiResponse.success("Anamnesis details", dto));
    }
}
