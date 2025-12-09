package com.dentalhelp.patient.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "general_anamnesis")
public class GeneralAnamnesis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGeneralAnamnesis;

    private String patientCnp;
    private String allergies;
    private String alcoholConsumer;
    private String smoker;
    private String coagulationProblems;
    private String medicalIntolerance;
    private String previousDentalProblems;
}
