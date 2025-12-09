package com.dentalhelp.auth.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Embeddable
public class VerificationAndRegisterData {
    private String firstName;
    private String lastName;
    private String cnp;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;
}
