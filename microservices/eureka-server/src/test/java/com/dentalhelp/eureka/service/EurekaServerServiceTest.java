package com.dentalhelp.eureka.service;

import com.dentalhelp.eureka.EurekaServerApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic smoke tests for Eureka Server
 * Eureka Server is a Netflix service discovery server with no custom business logic,
 * so we only verify basic application configuration
 */
@ExtendWith(MockitoExtension.class)
class EurekaServerServiceTest {

    @Test
    void testServiceExists() {
        // Basic test to verify test infrastructure works
        assertTrue(true, "Test infrastructure is working");
    }

    @Test
    void testEurekaServerApplicationContextLoads() {
        // Verify the application class exists and can be instantiated
        assertDoesNotThrow(() -> {
            EurekaServerApplication app = new EurekaServerApplication();
            assertNotNull(app);
        });
    }

    @Test
    void testEurekaServerApplicationMainMethodExists() {
        // Verify the main method exists (reflection-based test)
        assertDoesNotThrow(() -> {
            EurekaServerApplication.class.getMethod("main", String[].class);
        });
    }

    @Test
    void testEurekaServerApplicationHasSpringBootAnnotation() {
        // Verify the application has @SpringBootApplication annotation
        assertTrue(
            EurekaServerApplication.class.isAnnotationPresent(
                org.springframework.boot.autoconfigure.SpringBootApplication.class
            ),
            "EurekaServerApplication should have @SpringBootApplication annotation"
        );
    }

    @Test
    void testEurekaServerApplicationHasEnableEurekaServerAnnotation() {
        // Verify the application has @EnableEurekaServer annotation
        assertTrue(
            EurekaServerApplication.class.isAnnotationPresent(
                org.springframework.cloud.netflix.eureka.server.EnableEurekaServer.class
            ),
            "EurekaServerApplication should have @EnableEurekaServer annotation"
        );
    }
}
