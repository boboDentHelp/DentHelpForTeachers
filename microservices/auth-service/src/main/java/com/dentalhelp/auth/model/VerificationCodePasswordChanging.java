package com.dentalhelp.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "verification_code_password_changing")
public class VerificationCodePasswordChanging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String code;

    private LocalDateTime expirationTime;

    @Embedded
    private VerificationAndResetPasswordData resetPasswordData;
}
