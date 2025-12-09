package com.dentalhelp.dentalrecords.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ToothInterventionDto {
    private Long interventionId;
    private int toothNumber;
    private String isExtracted;
    private String patientCnp;
    private String dateIntervention;
    private String interventionDetails;
}
