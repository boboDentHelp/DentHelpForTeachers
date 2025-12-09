package com.dentalhelp.treatment.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "treatment_sheets")
public class TreatmentSheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long treatmentNumber;

    private Long appointmentId;
    private String appointmentObservations;
    private String recommendations;
    private String medication;
}
