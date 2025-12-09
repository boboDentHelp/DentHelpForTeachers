package com.dentalhelp.auth.config;

import com.dentalhelp.auth.model.Patient;
import com.dentalhelp.auth.model.UserRole;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set a test secret key
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY",
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");

        testPatient = new Patient();
        testPatient.setCNP("1234567890123");
        testPatient.setEmail("test@example.com");
        testPatient.setPassword("password");
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setUserRole(UserRole.PATIENT);

        userDetails = User.builder()
            .username("test@example.com")
            .password("password")
            .authorities(new ArrayList<>())
            .build();
    }

    @Test
    void testGenerateToken_Success() {
        // Act
        String token = jwtService.generateToken(testPatient);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void testExtractEmail_Success() {
        // Arrange
        String token = jwtService.generateToken(testPatient);

        // Act
        String email = jwtService.extractUsername(token);

        // Assert
        assertEquals("test@example.com", email);
    }

    @Test
    void testIsTokenValid_ValidToken() {
        // Arrange
        String token = jwtService.generateToken(testPatient);

        // Act
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testIsTokenValid_InvalidUser() {
        // Arrange
        String token = jwtService.generateToken(testPatient);
        UserDetails differentUser = User.builder()
            .username("different@example.com")
            .password("password")
            .authorities(new ArrayList<>())
            .build();

        // Act
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testExtractEmail_MalformedToken() {
        // Act & Assert
        assertThrows(MalformedJwtException.class, () -> {
            jwtService.extractUsername("invalid.token.here");
        });
    }

    @Test
    void testExtractEmail_NullToken() {
        // Act & Assert
        assertThrows(Exception.class, () -> {
            jwtService.extractUsername(null);
        });
    }

    @Test
    void testGenerateToken_NullPatient() {
        // Act & Assert
        assertThrows(Exception.class, () -> {
            jwtService.generateToken(null);
        });
    }

    @Test
    void testTokenContainsCorrectClaims() {
        // Arrange
        String token = jwtService.generateToken(testPatient);

        // Act
        String extractedEmail = jwtService.extractUsername(token);

        // Assert
        assertEquals(testPatient.getEmail(), extractedEmail);
    }

    @Test
    void testMultipleTokensForSameUser() {
        // Arrange & Act
        String token1 = jwtService.generateToken(testPatient);
        try {
            Thread.sleep(10); // Small delay to ensure different timestamps
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String token2 = jwtService.generateToken(testPatient);

        // Assert - tokens should be different but both valid
        assertNotEquals(token1, token2);
        assertTrue(jwtService.isTokenValid(token1, userDetails));
        assertTrue(jwtService.isTokenValid(token2, userDetails));
    }

    @Test
    void testGenerateToken_DifferentUsers() {
        // Arrange
        Patient patient2 = new Patient();
        patient2.setCNP("9876543210987");
        patient2.setEmail("another@example.com");
        patient2.setPassword("password");
        patient2.setFirstName("Jane");
        patient2.setLastName("Smith");
        patient2.setUserRole(UserRole.PATIENT);

        // Act
        String token1 = jwtService.generateToken(testPatient);
        String token2 = jwtService.generateToken(patient2);

        // Assert
        assertNotEquals(token1, token2);
        assertEquals("test@example.com", jwtService.extractUsername(token1));
        assertEquals("another@example.com", jwtService.extractUsername(token2));
    }
}
