package com.dentalhelp.appointment.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentEvent implements Serializable {
    private Long appointmentId;
    private String patientCnp;
    private String patientEmail;
    private String appointmentDate;
    private String eventType; // CREATED, MODIFIED, DELETED, CONFIRMED, REJECTED
}
