package com.dentalhelp.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentRequestDto {
    private Long appointmentRequestId;
    private String patientCnp;
    private String appointmentReason;
    private String desiredAppointmentTime;
    private String requestDate;
}
