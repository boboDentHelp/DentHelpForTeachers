package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.ApiResponse;
import com.dentalhelp.appointment.dto.AppointmentDto;
import com.dentalhelp.appointment.model.Appointment;
import com.dentalhelp.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient/appointments")
@RequiredArgsConstructor
public class PatientAppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/get-patient-appointments")
    public ResponseEntity<ApiResponse> getPatientAppointments(@RequestBody Map<String, String> request) {
        // Extract CNP from request body
        String patientCnp = request.get("patientCnp");

        System.out.println("📋 [APPOINTMENT] Fetching appointments for CNP: " + patientCnp);

        if (patientCnp == null || patientCnp.trim().isEmpty()) {
            System.err.println("❌ [APPOINTMENT] CNP is null or empty!");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Patient CNP is required"));
        }

        List<Appointment> appointments = appointmentService.getPatientAppointments(patientCnp);
        System.out.println("✅ [APPOINTMENT] Found " + appointments.size() + " appointments for CNP: " + patientCnp);

        List<AppointmentDto> appointmentDtos = new ArrayList<>();

        for (Appointment appointment : appointments) {
            AppointmentDto dto = new AppointmentDto();
            dto.setPatientCnp(appointment.getPatientCnp());
            dto.setAppointmentReason(appointment.getAppointmentReason());
            dto.setDate(appointment.getStartDateHour());
            dto.setHour(appointment.getEndDateHour());
            dto.setAppointmentId(appointment.getAppointmentId());
            appointmentDtos.add(dto);

            System.out.println("   📅 Appointment ID: " + appointment.getAppointmentId() +
                    ", Date: " + appointment.getStartDateHour() +
                    ", Reason: " + appointment.getAppointmentReason());
        }

        System.out.println("🚀 [APPOINTMENT] Returning " + appointmentDtos.size() + " appointments to frontend");
        return ResponseEntity.ok(ApiResponse.success("Patient appointments", appointmentDtos));
    }
}
