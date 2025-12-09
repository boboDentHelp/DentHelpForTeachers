package com.dentalhelp.treatment.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentSheetDto {
    private Long treatmentNumber;
    private Long appointmentId;
    private String appointmentObservations;
    private String recommendations;
    private String medication;
}
