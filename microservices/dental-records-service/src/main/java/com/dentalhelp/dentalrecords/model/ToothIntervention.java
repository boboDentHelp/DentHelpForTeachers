package com.dentalhelp.dentalrecords.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "teeth_interventions")
public class ToothIntervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interventionId;

    private int toothNumber;
    private String isExtracted;
    private String patientCnp;
    private String dateIntervention;
    private String interventionDetails;
}
