package com.dentalhelp.auth.dto;

import com.dentalhelp.auth.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterDto {
    private String firstName;
    private String lastName;
    private String CNP;
    private String email;
    private String password;
    private String reTypePassword;
    private UserRole userRole;
}
