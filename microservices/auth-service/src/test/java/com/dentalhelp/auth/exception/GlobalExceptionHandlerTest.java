package com.dentalhelp.auth.exception;

import com.dentalhelp.auth.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        // Initialize if needed
    }

    @Test
    void testHandleBadRequestException() {
        // Arrange
        String errorMessage = "Invalid credentials";
        BadRequestException exception = new BadRequestException(errorMessage);

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleBadRequest(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(errorMessage, response.getBody().getMessage());
    }

    @Test
    void testHandleResourceNotFoundException() {
        // Arrange
        String errorMessage = "User not found";
        ResourceNotFoundException exception = new ResourceNotFoundException(errorMessage);

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleResourceNotFound(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(errorMessage, response.getBody().getMessage());
    }

    @Test
    void testHandleGeneralException() {
        // Arrange
        String errorMessage = "Internal error occurred";
        Exception exception = new Exception(errorMessage);

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleGenericException(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("An error occurred"));
    }

    @Test
    void testBadRequestException_NullMessage() {
        // Arrange
        BadRequestException exception = new BadRequestException(null);

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleBadRequest(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testResourceNotFoundException_EmptyMessage() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException("");

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleResourceNotFound(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testExceptionTypes() {
        // Test that exceptions are runtime exceptions
        BadRequestException badRequest = new BadRequestException("test");
        ResourceNotFoundException notFound = new ResourceNotFoundException("test");

        assertTrue(badRequest instanceof RuntimeException);
        assertTrue(notFound instanceof RuntimeException);
    }
}
