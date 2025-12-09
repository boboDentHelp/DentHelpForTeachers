package com.dentalhelp.appointment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(name = "appointments", indexes = {
    @Index(name = "idx_patient_cnp", columnList = "patientCnp"),
    @Index(name = "idx_start_date", columnList = "startDateHour")
})
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    private String appointmentReason;
    private String startDateHour;
    private String endDateHour;

    @Column(nullable = false)
    private String patientCnp;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private AnamnesisAppointment anamnesisAppointment;
}
