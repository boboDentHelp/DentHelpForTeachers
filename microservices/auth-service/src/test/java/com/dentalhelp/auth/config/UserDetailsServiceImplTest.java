package com.dentalhelp.auth.config;

import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.model.UserRole;
import com.dentalhelp.auth.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testPatient = new Patient();
        testPatient.setCNP("1234567890123");
        testPatient.setEmail("test@example.com");
        testPatient.setPassword("hashedPassword");
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setUserRole(UserRole.PATIENT);
    }

    @Test
    void testLoadUserByUsername_Success() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername("test@example.com");

        // Assert
        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
        assertEquals("hashedPassword", userDetails.getPassword());
        verify(patientRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void testLoadUserByUsername_UserNotFound() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername("nonexistent@example.com");
        });
        verify(patientRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void testLoadUserByUsername_NullEmail() {
        // Arrange
        when(patientRepository.findByEmail(null)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername(null);
        });
    }

    @Test
    void testLoadUserByUsername_EmptyEmail() {
        // Arrange
        when(patientRepository.findByEmail("")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername("");
        });
    }

    @Test
    void testLoadUserByUsername_ReturnsCorrectAuthorities() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername("test@example.com");

        // Assert
        assertNotNull(userDetails.getAuthorities());
        assertTrue(userDetails.isEnabled());
        assertTrue(userDetails.isAccountNonExpired());
        assertTrue(userDetails.isAccountNonLocked());
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    @Test
    void testLoadUserByUsername_MultipleCallsSameUser() {
        // Arrange
        when(patientRepository.findByEmail(anyString())).thenReturn(Optional.of(testPatient));

        // Act
        UserDetails userDetails1 = userDetailsService.loadUserByUsername("test@example.com");
        UserDetails userDetails2 = userDetailsService.loadUserByUsername("test@example.com");

        // Assert
        assertNotNull(userDetails1);
        assertNotNull(userDetails2);
        assertEquals(userDetails1.getUsername(), userDetails2.getUsername());
        verify(patientRepository, times(2)).findByEmail("test@example.com");
    }

    @Test
    void testLoadUserByUsername_DifferentRoles() {
        // Arrange - PATIENT role
        when(patientRepository.findByEmail("patient@example.com")).thenReturn(Optional.of(testPatient));

        // Create admin patient
        Patient adminPatient = new Patient();
        adminPatient.setCNP("9876543210987");
        adminPatient.setEmail("admin@example.com");
        adminPatient.setPassword("adminPass");
        adminPatient.setUserRole(UserRole.ADMIN);
        when(patientRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminPatient));

        // Act
        UserDetails patientDetails = userDetailsService.loadUserByUsername("patient@example.com");
        UserDetails adminDetails = userDetailsService.loadUserByUsername("admin@example.com");

        // Assert
        assertNotNull(patientDetails);
        assertNotNull(adminDetails);
        assertEquals("patient@example.com", patientDetails.getUsername());
        assertEquals("admin@example.com", adminDetails.getUsername());
    }
}
