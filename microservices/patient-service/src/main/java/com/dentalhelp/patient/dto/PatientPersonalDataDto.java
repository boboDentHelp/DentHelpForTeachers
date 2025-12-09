package com.dentalhelp.patient.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientPersonalDataDto {
    private Long idPersonalData;
    private String patientCnp;
    private String addressStreet;
    private String addressNumber;
    private String addressCountry;
    private String addressRegion;
    private String phoneNumber;
    private String sex;
}
