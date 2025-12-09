package com.dentalhelp.appointment.exception;

import com.dentalhelp.appointment.dto.ApiResponse;
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
        String errorMessage = "Invalid request data";
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
        String errorMessage = "Resource not found";
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
        String errorMessage = "Internal server error occurred";
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
    void testHandleBadRequestException_NullMessage() {
        // Arrange
        BadRequestException exception = new BadRequestException(null);

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleBadRequest(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testHandleResourceNotFoundException_EmptyMessage() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException("");

        // Act
        ResponseEntity<ApiResponse> response = exceptionHandler.handleResourceNotFound(exception);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("", response.getBody().getMessage());
    }

    @Test
    void testExceptionCreation_BadRequest() {
        // Arrange
        String message = "Test bad request";

        // Act
        BadRequestException exception = new BadRequestException(message);

        // Assert
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testExceptionCreation_ResourceNotFound() {
        // Arrange
        String message = "Test resource not found";

        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException(message);

        // Assert
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testHandleMultipleExceptions() {
        // Arrange
        BadRequestException badRequest = new BadRequestException("Bad request");
        ResourceNotFoundException notFound = new ResourceNotFoundException("Not found");
        Exception general = new Exception("General error");

        // Act
        ResponseEntity<ApiResponse> response1 = exceptionHandler.handleBadRequest(badRequest);
        ResponseEntity<ApiResponse> response2 = exceptionHandler.handleResourceNotFound(notFound);
        ResponseEntity<ApiResponse> response3 = exceptionHandler.handleGenericException(general);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response1.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, response2.getStatusCode());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response3.getStatusCode());
    }
}
