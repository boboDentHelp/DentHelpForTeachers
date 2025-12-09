package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.ApiResponse;
import com.dentalhelp.appointment.dto.AppointmentRequestDto;
import com.dentalhelp.appointment.model.AppointmentRequest;
import com.dentalhelp.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/in/appointment_request")
@RequiredArgsConstructor
public class AppointmentRequestController {

    private final AppointmentService appointmentService;

    @PostMapping("/add_appointment_request")
    public ResponseEntity<ApiResponse> addAppointmentRequest(@RequestBody AppointmentRequestDto requestDto) {
        appointmentService.createAppointmentRequest(requestDto);
        return ResponseEntity.ok(ApiResponse.success("Appointment request sent successfully", null));
    }

    @GetMapping("/get_patient_requests/{patientCnp}")
    public ResponseEntity<ApiResponse> getPatientRequests(@PathVariable String patientCnp) {
        List<AppointmentRequest> requests = appointmentService.getPatientAppointmentRequests(patientCnp);
        List<AppointmentRequestDto> requestDtos = new ArrayList<>();

        for (AppointmentRequest request : requests) {
            AppointmentRequestDto dto = new AppointmentRequestDto();
            dto.setAppointmentRequestId(request.getAppointmentRequestId());
            dto.setPatientCnp(request.getPatientCnp());
            dto.setAppointmentReason(request.getAppointmentReason());
            dto.setDesiredAppointmentTime(request.getDesiredAppointmentTime());
            dto.setRequestDate(request.getRequestDate());
            requestDtos.add(dto);
        }

        return ResponseEntity.ok(ApiResponse.success("Patient appointment requests", requestDtos));
    }

    @PutMapping("/update_request/{requestId}")
    public ResponseEntity<ApiResponse> updateRequest(
            @PathVariable Long requestId,
            @RequestBody AppointmentRequestDto requestDto) {
        appointmentService.updateAppointmentRequest(requestId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Request updated successfully", null));
    }

    @DeleteMapping("/delete_request/{requestId}")
    public ResponseEntity<ApiResponse> deleteRequest(@PathVariable Long requestId) {
        appointmentService.deleteAppointmentRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Request deleted successfully", null));
    }
}
