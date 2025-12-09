package com.dentalhelp.auth.service;

import com.dentalhelp.auth.dto.*;
import com.dentalhelp.auth.exception.BadRequestException;
import com.dentalhelp.auth.exception.ResourceNotFoundException;
import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.model.UserRole;
import com.dentalhelp.auth.model.VerificationCode;
import com.dentalhelp.auth.repository.PatientRepository;
import com.dentalhelp.auth.repository.VerificationCodeRepository;
import com.dentalhelp.auth.repository.VerificationCodePasswordRepository;
import com.dentalhelp.auth.service.impl.AuthServiceImpl;
import com.dentalhelp.auth.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private VerificationCodeRepository verificationCodeRepository;

    @Mock
    private VerificationCodePasswordRepository verificationCodePasswordRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterDto registerDto;
    private LoginDto loginDto;
    private Patient testPatient;
    private BCryptPasswordEncoder realPasswordEncoder;

    @BeforeEach
    void setUp() {
        realPasswordEncoder = new BCryptPasswordEncoder();

        registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");
        registerDto.setPassword("Password123!");
        registerDto.setReTypePassword("Password123!");
        registerDto.setFirstName("John");
        registerDto.setLastName("Doe");
        registerDto.setCNP("1234567890123");

        loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("Password123!");

        testPatient = new Patient();
        testPatient.setEmail("test@example.com");
        // Use BCrypt to hash the password for testing
        testPatient.setPassword(realPasswordEncoder.encode("Password123!"));
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setUserRole(UserRole.PATIENT);

        // Mock passwordEncoder to use real encoding/matching for tests
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation ->
            realPasswordEncoder.encode(invocation.getArgument(0))
        );
        when(passwordEncoder.matches(anyString(), anyString())).thenAnswer(invocation ->
            realPasswordEncoder.matches(invocation.getArgument(0), invocation.getArgument(1))
        );
    }

    @Test
    void testRegister_Success() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(patientRepository.findByCNP(anyString())).thenReturn(Optional.empty());
        when(verificationCodeRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(verificationCodeRepository.save(any(VerificationCode.class))).thenReturn(new VerificationCode());

        // Act
        authService.register(registerDto);

        // Assert - method returns void, so just verify interactions
        verify(patientRepository).findByEmail(registerDto.getEmail());
        verify(patientRepository).findByCNP(registerDto.getCNP());
        verify(verificationCodeRepository).save(any(VerificationCode.class));
        verify(emailService).sendVerificationEmail(eq(registerDto.getEmail()), anyString());
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(registerDto));
        verify(patientRepository).findByEmail(registerDto.getEmail());
        verify(verificationCodeRepository, never()).save(any(VerificationCode.class));
    }

    @Test
    void testRegister_CNPAlreadyExists() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(patientRepository.findByCNP(anyString())).thenReturn(Optional.of(testPatient));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(registerDto));
        verify(patientRepository).findByCNP(registerDto.getCNP());
        verify(verificationCodeRepository, never()).save(any(VerificationCode.class));
    }

    @Test
    void testLogin_Success() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));

        // Act
        Patient result = authService.login(loginDto);

        // Assert
        assertNotNull(result);
        assertEquals(testPatient.getEmail(), result.getEmail());
        verify(patientRepository).findByEmail(loginDto.getEmail());
    }

    @Test
    void testLogin_UserNotFound() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> authService.login(loginDto));
        verify(patientRepository).findByEmail(loginDto.getEmail());
    }

    @Test
    void testForgotPassword_Success() {
        // Arrange
        ForgotPasswordDto forgotPasswordDto = new ForgotPasswordDto();
        forgotPasswordDto.setEmail("test@example.com");
        forgotPasswordDto.setNewPassword("NewPassword123!");

        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));
        when(verificationCodePasswordRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act
        authService.forgotPassword(forgotPasswordDto);

        // Assert - method returns void
        verify(patientRepository).findByEmail(forgotPasswordDto.getEmail());
        verify(verificationCodePasswordRepository).save(any());
        verify(emailService).sendPasswordResetEmail(eq(forgotPasswordDto.getEmail()), anyString());
    }

    @Test
    void testForgotPassword_UserNotFound() {
        // Arrange
        ForgotPasswordDto forgotPasswordDto = new ForgotPasswordDto();
        forgotPasswordDto.setEmail("nonexistent@example.com");
        forgotPasswordDto.setNewPassword("NewPassword123!");

        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> authService.forgotPassword(forgotPasswordDto));
        verify(patientRepository).findByEmail(forgotPasswordDto.getEmail());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void testRegister_InvalidData() {
        // Arrange
        RegisterDto invalidDto = new RegisterDto();
        invalidDto.setEmail("");  // Invalid email

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(invalidDto));
        verify(patientRepository, never()).save(any(Patient.class));
    }
}
