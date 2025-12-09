package com.dentalhelp.appointment.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
@Builder
@Table(name = "anamnesis_appointments")
public class AnamnesisAppointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long anamneseAppointmentId;

    private String appointmentReason;
    private String currentMedication;
    private String recentMedication;
    private String pregnancy;
    private String currentSymptoms;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "fk_appointment_id", referencedColumnName = "appointmentId")
    private Appointment appointment;
}
