package com.dentalhelp.patient.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeneralAnamnesisDto {
    private Long idGeneralAnamnesis;
    private String patientCnp;
    private String allergies;
    private String alcoholConsumer;
    private String smoker;
    private String coagulationProblems;
    private String medicalIntolerance;
    private String previousDentalProblems;
}
