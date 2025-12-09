package com.dentalhelp.xray.controller;

import com.dentalhelp.xray.service.AzureBlobStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for XrayController
 * These tests verify that the REST endpoints are wired correctly
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class XrayControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AzureBlobStorageService azureBlobStorageService;

    @Test
    void testContextLoads() {
        // Basic test that application context loads successfully
        assertNotNull(mockMvc);
        assertNotNull(objectMapper);
    }

    @Test
    void testHealthEndpoint() throws Exception {
        // Test actuator health endpoint
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
