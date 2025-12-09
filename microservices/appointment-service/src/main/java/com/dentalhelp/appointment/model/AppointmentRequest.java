package com.dentalhelp.appointment.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointments_requests")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class AppointmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentRequestId;

    private String patientCnp;
    private String appointmentReason;
    private String desiredAppointmentTime;
    private String requestDate;
}
