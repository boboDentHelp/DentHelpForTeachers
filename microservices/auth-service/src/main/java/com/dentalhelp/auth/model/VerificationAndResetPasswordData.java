package com.dentalhelp.auth.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Embeddable
public class VerificationAndResetPasswordData {
    private String newPassword;
}
