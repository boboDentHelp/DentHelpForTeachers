package com.dentalhelp.dentalrecords.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ToothProblemDto {
    private Long problemId;
    private int toothNumber;
    private String patientCnp;
    private String dateProblem;
    private String problemDetails;
}
