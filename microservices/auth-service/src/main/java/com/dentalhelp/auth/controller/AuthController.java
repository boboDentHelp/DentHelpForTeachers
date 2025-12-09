package com.dentalhelp.auth.controller;

import com.dentalhelp.auth.config.JwtService;
import com.dentalhelp.auth.dto.*;
import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginDto loginDto) {
        // Validate input
        if (loginDto.getEmail() == null || loginDto.getEmail().isBlank()) {
            throw new RuntimeException("The email is not valid");
        }
        if (loginDto.getPassword() == null || loginDto.getPassword().isBlank()) {
            throw new RuntimeException("The password is not valid");
        }

        // Authenticate using Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getEmail(),
                        loginDto.getPassword()
                )
        );

        // Get patient details
        Patient patient = authService.login(loginDto);
        String token = jwtService.generateToken(patient);
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(token)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterDto registerDto) {
        authService.register(registerDto);
        return ResponseEntity.ok(ApiResponse.success("Code sent successfully", null));
    }

    @PostMapping("/register/verification")
    public ResponseEntity<AuthenticationResponse> verifyRegistration(@RequestBody VerificationDto verificationDto) {
        AuthenticationResponse response = authService.verifyRegistrationCode(verificationDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/kid")
    public ResponseEntity<ApiResponse> registerKid(@RequestBody RegisterKidDto registerKidDto) {
        authService.registerKid(registerKidDto);
        return ResponseEntity.ok(ApiResponse.success("Kid saved successfully", null));
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody ForgotPasswordDto forgotPasswordDto) {
        authService.forgotPassword(forgotPasswordDto);
        return ResponseEntity.ok(ApiResponse.success("The code for password resetting was sent", null));
    }

    @PostMapping("/forgot-password/send-verification-code")
    public ResponseEntity<ApiResponse> sendVerificationCode(@RequestBody EmailDto emailDto) {
        authService.sendVerificationCodePC(emailDto);
        return ResponseEntity.ok(ApiResponse.success("The code was sent successfully", null));
    }

    @PutMapping("/changePassword")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody ChangePasswordDto changePasswordDto) {
        authService.changePassword(changePasswordDto);
        return ResponseEntity.ok(ApiResponse.success("The password was changed successfully", null));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<AuthenticationResponse> verifyPasswordReset(@RequestBody VerificationDto verificationDto) {
        AuthenticationResponse response = authService.verifyPasswordResetCode(verificationDto);
        return ResponseEntity.ok(response);
    }
}
