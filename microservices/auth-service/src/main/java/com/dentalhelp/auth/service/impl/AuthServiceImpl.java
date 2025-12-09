package com.dentalhelp.auth.service.impl;

import com.dentalhelp.auth.dto.*;
import com.dentalhelp.auth.exception.BadRequestException;
import com.dentalhelp.auth.exception.ResourceNotFoundException;
import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.model.UserRole;
import com.dentalhelp.auth.model.VerificationCode;
import com.dentalhelp.auth.model.VerificationCodePasswordChanging;
import com.dentalhelp.auth.repository.PatientRepository;
import com.dentalhelp.auth.repository.VerificationCodePasswordRepository;
import com.dentalhelp.auth.repository.VerificationCodeRepository;
import com.dentalhelp.auth.service.AuthService;
import com.dentalhelp.auth.service.EmailService;
import com.dentalhelp.auth.config.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PatientRepository patientRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final VerificationCodePasswordRepository verificationCodePasswordRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Patient login(LoginDto loginDto) {
        // Just fetch and return the patient - authentication is handled by Spring Security
        Optional<Patient> patientOptional = patientRepository.findByEmail(loginDto.getEmail());
        return patientOptional.orElseThrow(() ->
                new ResourceNotFoundException("The email is not registered"));
    }

    @Override
    @Transactional
    public void register(RegisterDto registerDto) {
        validateRegisterDto(registerDto);

        Optional<Patient> patientOptional = patientRepository.findByEmail(registerDto.getEmail());
        if (patientOptional.isPresent()) {
            throw new BadRequestException("Email already exists in db");
        }

        Optional<Patient> patientOptional1 = patientRepository.findByCNP(registerDto.getCNP());
        if (patientOptional1.isPresent()) {
            throw new BadRequestException("CNP already exists in db");
        }

        String email = registerDto.getEmail().trim();

        // Delete existing verification code if any and flush to ensure it's committed
        Optional<VerificationCode> existingCode = verificationCodeRepository.findByEmail(email);
        if (existingCode.isPresent()) {
            log.info("Deleting existing verification code for email: {}", email);
            verificationCodeRepository.delete(existingCode.get());
            verificationCodeRepository.flush(); // Force immediate database update
        }

        // Generate and send verification code
        String code = generateVerificationCode();
        log.info("Generated verification code for {}: {}", email, code);

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpirationTime(LocalDateTime.now().plusMinutes(10));

        // Store registration data
        com.dentalhelp.auth.model.VerificationAndRegisterData registerData =
                new com.dentalhelp.auth.model.VerificationAndRegisterData();
        registerData.setFirstName(registerDto.getFirstName());
        registerData.setLastName(registerDto.getLastName());
        registerData.setCnp(registerDto.getCNP());
        registerData.setPassword(registerDto.getPassword());
        registerData.setUserRole(registerDto.getUserRole() != null ? registerDto.getUserRole() : UserRole.PATIENT);

        verificationCode.setRegisterData(registerData);
        VerificationCode savedCode = verificationCodeRepository.save(verificationCode);
        verificationCodeRepository.flush(); // Force immediate database commit

        log.info("Saved verification code with ID: {} for email: {}", savedCode.getId(), email);
        log.debug("Saved code value: '{}'", savedCode.getCode());

        emailService.sendVerificationEmail(email, code);
    }

    @Override
    public void registerKid(RegisterKidDto registerKidDto) {
        Optional<Patient> patientOptional1 = patientRepository.findByCNP(registerKidDto.getCnp());
        if (patientOptional1.isPresent()) {
            throw new BadRequestException("CNP already exists in db");
        }

        Patient patient = new Patient();
        patient.setFirstName(registerKidDto.getFirstName());
        patient.setLastName(registerKidDto.getLastName());
        patient.setCNP(registerKidDto.getCnp());
        patient.setUserRole(UserRole.PATIENT);
        patient.setParent(registerKidDto.getParent());
        String password = passwordEncoder.encode("password");
        patient.setPassword(password);

        patientRepository.save(patient);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordDto forgotPasswordDto) {
        String email = forgotPasswordDto.getEmail().trim();

        Optional<Patient> optionalPatient = patientRepository.findByEmail(email);
        if (optionalPatient.isEmpty()) {
            throw new ResourceNotFoundException("There is no account associated with this email");
        }

        // Delete existing password reset code if any and flush to ensure it's committed
        Optional<VerificationCodePasswordChanging> existingCode =
                verificationCodePasswordRepository.findByEmail(email);
        if (existingCode.isPresent()) {
            log.info("Deleting existing password reset code for email: {}", email);
            verificationCodePasswordRepository.delete(existingCode.get());
            verificationCodePasswordRepository.flush(); // Force immediate database update
        }

        String code = generateVerificationCode();
        log.info("Generated password reset code for {}: {}", email, code);

        VerificationCodePasswordChanging passwordChanging = new VerificationCodePasswordChanging();
        passwordChanging.setEmail(email);
        passwordChanging.setCode(code);
        passwordChanging.setExpirationTime(LocalDateTime.now().plusMinutes(10));

        com.dentalhelp.auth.model.VerificationAndResetPasswordData resetData =
                new com.dentalhelp.auth.model.VerificationAndResetPasswordData();
        resetData.setNewPassword(forgotPasswordDto.getNewPassword());

        passwordChanging.setResetPasswordData(resetData);
        VerificationCodePasswordChanging savedCode = verificationCodePasswordRepository.save(passwordChanging);
        verificationCodePasswordRepository.flush(); // Force immediate database commit

        log.info("Saved password reset code with ID: {} for email: {}", savedCode.getId(), email);
        log.debug("Saved code value: '{}'", savedCode.getCode());

        emailService.sendPasswordResetEmail(email, code);
    }

    @Override
    public void sendVerificationCodePC(EmailDto emailDto) {
        Optional<Patient> optionalPatient = patientRepository.findByEmail(emailDto.getEmail());
        if (optionalPatient.isEmpty()) {
            throw new ResourceNotFoundException("There is no account associated with this email");
        }

        String code = generateVerificationCode();
        emailService.sendPasswordResetEmail(emailDto.getEmail(), code);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordDto changePasswordDto) {
        // Trim and normalize input
        String email = changePasswordDto.getEmail() != null ? changePasswordDto.getEmail().trim() : null;
        String inputCode = changePasswordDto.getVerificationCode() != null ? changePasswordDto.getVerificationCode().trim() : null;

        log.info("Changing password for email: {}", email);
        log.debug("Input code: '{}'", inputCode);

        Optional<VerificationCodePasswordChanging> optionalCode =
                verificationCodePasswordRepository.findByEmail(email);

        if (optionalCode.isEmpty()) {
            log.warn("No verification code found for email: {}", email);
            throw new BadRequestException("No verification code found for this email");
        }

        VerificationCodePasswordChanging verificationCode = optionalCode.get();
        String storedCode = verificationCode.getCode();

        log.debug("Stored code: '{}', Input code: '{}'", storedCode, inputCode);

        if (!storedCode.equals(inputCode)) {
            log.warn("Invalid verification code for password change. Email: {}, Expected: '{}', Got: '{}'",
                    email, storedCode, inputCode);
            throw new BadRequestException("Invalid verification code");
        }

        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            log.warn("Verification code expired for email: {}", email);
            throw new BadRequestException("Verification code has expired");
        }

        Optional<Patient> optionalPatient = patientRepository.findByEmail(email);
        if (optionalPatient.isEmpty()) {
            throw new ResourceNotFoundException("There is no account associated with this email");
        }

        Patient patient = optionalPatient.get();
        String encryptedPassword = passwordEncoder.encode(changePasswordDto.getNewPassword());
        patient.setPassword(encryptedPassword);

        patientRepository.save(patient);
        verificationCodePasswordRepository.delete(verificationCode);

        log.info("Password changed successfully for email: {}", email);
    }

    @Override
    @Transactional
    public AuthenticationResponse verifyRegistrationCode(VerificationDto verificationDto) {
        // Trim and normalize input
        String email = verificationDto.getEmail() != null ? verificationDto.getEmail().trim() : null;
        String inputCode = verificationDto.getCode() != null ? verificationDto.getCode().trim() : null;

        log.info("Verifying registration code for email: {}", email);
        log.debug("Input code: '{}'", inputCode);

        Optional<VerificationCode> optionalCode =
                verificationCodeRepository.findByEmail(email);

        if (optionalCode.isEmpty()) {
            log.warn("No verification code found for email: {}", email);
            throw new BadRequestException("No verification code found for this email");
        }

        VerificationCode verificationCode = optionalCode.get();
        String storedCode = verificationCode.getCode();

        log.debug("Stored code: '{}', Input code: '{}'", storedCode, inputCode);
        log.debug("Codes equal: {}", storedCode.equals(inputCode));

        if (!storedCode.equals(inputCode)) {
            log.warn("Invalid verification code for email: {}. Expected: '{}', Got: '{}'",
                    email, storedCode, inputCode);
            throw new BadRequestException("Invalid verification code");
        }

        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            log.warn("Verification code expired for email: {}", email);
            throw new BadRequestException("Verification code has expired");
        }

        // Create patient from stored registration data
        Patient patient = new Patient();
        patient.setFirstName(verificationCode.getRegisterData().getFirstName());
        patient.setLastName(verificationCode.getRegisterData().getLastName());
        patient.setCNP(verificationCode.getRegisterData().getCnp());
        patient.setEmail(email);
        patient.setUserRole(verificationCode.getRegisterData().getUserRole());
        String hashedPassword = passwordEncoder.encode(verificationCode.getRegisterData().getPassword());
        patient.setPassword(hashedPassword);

        patientRepository.save(patient);
        verificationCodeRepository.delete(verificationCode);

        log.info("Registration verified successfully for email: {}", email);
        String token = jwtService.generateToken(patient);
        return AuthenticationResponse.builder().token(token).build();
    }

    @Override
    @Transactional
    public AuthenticationResponse verifyPasswordResetCode(VerificationDto verificationDto) {
        // Trim and normalize input
        String email = verificationDto.getEmail() != null ? verificationDto.getEmail().trim() : null;
        String inputCode = verificationDto.getCode() != null ? verificationDto.getCode().trim() : null;

        log.info("Verifying password reset code for email: {}", email);
        log.debug("Input code: '{}'", inputCode);

        Optional<VerificationCodePasswordChanging> optionalCode =
                verificationCodePasswordRepository.findByEmail(email);

        if (optionalCode.isEmpty()) {
            log.warn("No password reset code found for email: {}", email);
            throw new BadRequestException("No verification code found for this email");
        }

        VerificationCodePasswordChanging verificationCode = optionalCode.get();
        String storedCode = verificationCode.getCode();

        log.debug("Stored code: '{}', Input code: '{}'", storedCode, inputCode);
        log.debug("Codes equal: {}", storedCode.equals(inputCode));

        if (!storedCode.equals(inputCode)) {
            log.warn("Invalid password reset code for email: {}. Expected: '{}', Got: '{}'",
                    email, storedCode, inputCode);
            throw new BadRequestException("Invalid verification code");
        }

        if (verificationCode.getExpirationTime().isBefore(LocalDateTime.now())) {
            log.warn("Password reset code expired for email: {}", email);
            throw new BadRequestException("Verification code has expired");
        }

        Optional<Patient> optionalPatient = patientRepository.findByEmail(email);
        if (optionalPatient.isEmpty()) {
            throw new ResourceNotFoundException("There is no account associated with this email");
        }

        Patient patient = optionalPatient.get();
        String encryptedPassword = passwordEncoder.encode(
                verificationCode.getResetPasswordData().getNewPassword()
        );
        patient.setPassword(encryptedPassword);

        patientRepository.save(patient);
        verificationCodePasswordRepository.delete(verificationCode);

        log.info("Password reset verified successfully for email: {}", email);
        String token = jwtService.generateToken(patient);
        return AuthenticationResponse.builder().token(token).build();
    }

    private void validateRegisterDto(RegisterDto registerDto) {
        if (registerDto.getFirstName() == null || registerDto.getFirstName().isBlank()) {
            throw new BadRequestException("The first name is invalid");
        }
        if (registerDto.getLastName() == null || registerDto.getLastName().isBlank()) {
            throw new BadRequestException("The second name is invalid");
        }
        if (registerDto.getEmail() == null || registerDto.getEmail().isBlank()) {
            throw new BadRequestException("The email is invalid");
        }
        if (registerDto.getPassword() == null || registerDto.getPassword().isBlank()) {
            throw new BadRequestException("The password is invalid");
        }
        if (registerDto.getCNP() == null || registerDto.getCNP().isBlank() || registerDto.getCNP().length() != 13) {
            throw new BadRequestException("The CNP is invalid");
        }
        if (!registerDto.getPassword().equals(registerDto.getReTypePassword())) {
            throw new BadRequestException("Passwords do not match");
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
