package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.ApiResponse;
import com.dentalhelp.appointment.dto.AppointmentRequestDto;
import com.dentalhelp.appointment.dto.ConfirmAppointmentDto;
import com.dentalhelp.appointment.model.AppointmentRequest;
import com.dentalhelp.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/confirm-appointments")
@RequiredArgsConstructor
public class ConfirmAppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/get-appointments-request")
    public ResponseEntity<ApiResponse> getAppointmentsRequest() {
        List<AppointmentRequest> requests = appointmentService.getAllAppointmentRequests();
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

        return ResponseEntity.ok(ApiResponse.success("All appointment requests", requestDtos));
    }

    @PostMapping("/save-appointments")
    public ResponseEntity<ApiResponse> confirmAppointment(@RequestBody ConfirmAppointmentDto confirmDto) {
        appointmentService.confirmAppointmentRequest(confirmDto);
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed successfully", null));
    }

    @PostMapping("/rejectAppointment/{requestId}")
    public ResponseEntity<ApiResponse> rejectAppointment(@PathVariable Long requestId) {
        appointmentService.rejectAppointmentRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Appointment request rejected", null));
    }
}
