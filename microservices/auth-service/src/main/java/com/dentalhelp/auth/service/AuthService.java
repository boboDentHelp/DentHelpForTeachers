package com.dentalhelp.auth.service;

import com.dentalhelp.auth.dto.*;
import com.dentalhelp.auth.model.Patient;

public interface AuthService {
    Patient login(LoginDto loginDto);
    void register(RegisterDto registerDto);
    void registerKid(RegisterKidDto registerKidDto);
    void forgotPassword(ForgotPasswordDto forgotPasswordDto);
    void sendVerificationCodePC(EmailDto emailDto);
    void changePassword(ChangePasswordDto changePasswordDto);
    AuthenticationResponse verifyRegistrationCode(VerificationDto verificationDto);
    AuthenticationResponse verifyPasswordResetCode(VerificationDto verificationDto);
}
