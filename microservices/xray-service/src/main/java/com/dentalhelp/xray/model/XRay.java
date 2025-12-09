package com.dentalhelp.xray.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "xrays")
public class XRay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long xrayId;

    private String patientCnp;
    private String date;
    private String filePath;
    private String observations;
}
