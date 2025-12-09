package com.dentalhelp.patient.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "patient_personal_data", indexes = {
    @Index(name = "idx_patient_cnp", columnList = "patientCnp")
})
public class PatientPersonalData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPersonalData;

    @Column(nullable = false, unique = true)
    private String patientCnp;
    private String addressStreet;
    private String addressNumber;
    private String addressCountry;
    private String addressRegion;
    private String phoneNumber;
    private String sex;
}
