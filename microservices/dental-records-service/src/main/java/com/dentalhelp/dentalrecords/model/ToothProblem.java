package com.dentalhelp.dentalrecords.model;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "teeth_problems")
public class ToothProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long problemId;

    private int toothNumber;
    private String patientCnp;
    private String dateProblem;
    private String problemDetails;
}
