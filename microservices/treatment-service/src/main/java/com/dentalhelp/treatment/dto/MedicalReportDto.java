package com.dentalhelp.treatment.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalReportDto {
    private Long id;
    private Long appointmentId;
    private String treatmentDetails;
    private String medication;
    private String date;
    private String hour;
}
