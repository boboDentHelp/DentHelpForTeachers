package com.dentalhelp.patient.controller;

import com.dentalhelp.patient.dto.PatientPersonalDataDto;
import com.dentalhelp.patient.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientService patientService;

    private PatientPersonalDataDto patientDto;

    @BeforeEach
    void setUp() {
        patientDto = new PatientPersonalDataDto();
        patientDto.setIdPersonalData(1L);
        patientDto.setPatientCnp("1234567890123");
        patientDto.setAddressStreet("Main Street");
        patientDto.setAddressNumber("123");
        patientDto.setAddressCountry("Romania");
        patientDto.setAddressRegion("Bucharest");
        patientDto.setPhoneNumber("0712345678");
        patientDto.setSex("M");
    }

    @Test
    void testGetAllPatients_Success() throws Exception {
        // Arrange
        List<PatientPersonalDataDto> patients = Arrays.asList(patientDto);
        when(patientService.getAllPatients()).thenReturn(patients);

        // Act & Assert
        mockMvc.perform(get("/api/admin/patient/get-patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(patientService, times(1)).getAllPatients();
    }

    @Test
    void testGetAllPatients_EmptyList() throws Exception {
        // Arrange
        when(patientService.getAllPatients()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/admin/patient/get-patients"))
                .andExpect(status().isOk());

        verify(patientService, times(1)).getAllPatients();
    }

    @Test
    void testGetPatientPersonalData_Success() throws Exception {
        // Arrange
        String cnp = "1234567890123";
        when(patientService.getPersonalDataByCnp(anyString())).thenReturn(patientDto);

        // Act & Assert
        mockMvc.perform(get("/api/admin/patient/get-patient-personal-data/" + cnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.patientCnp").value(cnp));

        verify(patientService, times(1)).getPersonalDataByCnp(cnp);
    }

    @Test
    void testGetPatientPersonalData_WithAllFields() throws Exception {
        // Arrange
        String cnp = "1234567890123";
        PatientPersonalDataDto completeDto = new PatientPersonalDataDto();
        completeDto.setIdPersonalData(1L);
        completeDto.setPatientCnp(cnp);
        completeDto.setAddressStreet("Main Street");
        completeDto.setAddressNumber("123");
        completeDto.setAddressCountry("Romania");
        completeDto.setAddressRegion("Bucharest");
        completeDto.setPhoneNumber("0712345678");
        completeDto.setSex("F");

        when(patientService.getPersonalDataByCnp(anyString())).thenReturn(completeDto);

        // Act & Assert
        mockMvc.perform(get("/api/admin/patient/get-patient-personal-data/" + cnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.patientCnp").value(cnp))
                .andExpect(jsonPath("$.data.addressStreet").value("Main Street"))
                .andExpect(jsonPath("$.data.phoneNumber").value("0712345678"));

        verify(patientService, times(1)).getPersonalDataByCnp(cnp);
    }
}
