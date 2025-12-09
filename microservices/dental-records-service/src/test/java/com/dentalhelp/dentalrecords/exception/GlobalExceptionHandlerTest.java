package com.dentalhelp.dentalrecords.exception;

import com.dentalhelp.dentalrecords.dto.ApiResponse;
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
        String errorMessage = "Invalid dental record data";
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
        String errorMessage = "Dental record not found";
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
        String errorMessage = "Database error";
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
    void testExceptionMessages() {
        // Test with various messages
        BadRequestException badRequest1 = new BadRequestException("Error 1");
        BadRequestException badRequest2 = new BadRequestException("Error 2");

        assertNotEquals(badRequest1.getMessage(), badRequest2.getMessage());
        assertEquals("Error 1", badRequest1.getMessage());
        assertEquals("Error 2", badRequest2.getMessage());
    }
}
