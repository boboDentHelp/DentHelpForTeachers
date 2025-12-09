package com.dentalhelp.xray.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class XRayDto {
    private Long xrayId;
    private String patientCnp;
    private String date;
    private String filePath;
    private String observations;
}
