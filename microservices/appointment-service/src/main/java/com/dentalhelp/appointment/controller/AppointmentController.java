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

@RestController
@RequestMapping("/api/admin/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/make-appointment")
    public ResponseEntity<ApiResponse> saveAppointment(@RequestBody AppointmentDto appointmentDto) {
        appointmentService.saveAppointment(appointmentDto);
        return ResponseEntity.ok(ApiResponse.success("Appointment saved successfully", null));
    }

    @GetMapping("/get-appointments")
    public ResponseEntity<ApiResponse> getAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        List<AppointmentDto> appointmentDtos = new ArrayList<>();

        for (Appointment appointment : appointments) {
            AppointmentDto dto = new AppointmentDto();
            dto.setPatientCnp(appointment.getPatientCnp());
            dto.setAppointmentReason(appointment.getAppointmentReason());
            dto.setDate(appointment.getStartDateHour());
            dto.setHour(appointment.getEndDateHour());
            dto.setAppointmentId(appointment.getAppointmentId());
            appointmentDtos.add(dto);
        }

        return ResponseEntity.ok(ApiResponse.success("Appointments list", appointmentDtos));
    }

    @PutMapping("/modify-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse> modifyAppointment(
            @RequestBody AppointmentDto appointmentDto,
            @PathVariable Long appointmentId) {
        appointmentService.modifyAppointment(appointmentId, appointmentDto);
        return ResponseEntity.ok(ApiResponse.success("Appointment modified successfully", null));
    }

    @DeleteMapping("/delete-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse> deleteAppointment(@PathVariable Long appointmentId) {
        appointmentService.deleteAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted", null));
    }
}
