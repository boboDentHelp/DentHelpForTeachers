package com.dentalhelp.dentalrecords.controller;

import com.dentalhelp.dentalrecords.dto.ToothInterventionDto;
import com.dentalhelp.dentalrecords.service.DentalRecordsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ToothInterventionController.class)
class ToothInterventionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DentalRecordsService dentalRecordsService;

    private ToothInterventionDto interventionDto;

    @BeforeEach
    void setUp() {
        interventionDto = new ToothInterventionDto();
        interventionDto.setPatientCnp("1234567890123");
        interventionDto.setToothNumber(5);
        interventionDto.setInterventionDetails("Composite filling");
        interventionDto.setDateIntervention("2024-12-01");
        interventionDto.setIsExtracted("false");
    }

    @Test
    void testGetPatientToothHistory_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        Integer toothNumber = 5;
        List<ToothInterventionDto> interventions = Arrays.asList(interventionDto);
        when(dentalRecordsService.getAllPatientToothIntervention(anyString(), anyInt())).thenReturn(interventions);

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/interventions/" + patientCnp + "/" + toothNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(dentalRecordsService, times(1)).getAllPatientToothIntervention(patientCnp, toothNumber);
    }

    @Test
    void testGetPatientAllToothHistory_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        List<ToothInterventionDto> interventions = Arrays.asList(interventionDto);
        when(dentalRecordsService.getAllPatientToothInterventions(anyString())).thenReturn(interventions);

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/interventions/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(dentalRecordsService, times(1)).getAllPatientToothInterventions(patientCnp);
    }

    @Test
    void testGetPatientAllExtractedTooth_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        List<ToothInterventionDto> extractedTeeth = Arrays.asList(interventionDto);
        when(dentalRecordsService.getPatientAllExtractedTooth(anyString())).thenReturn(extractedTeeth);

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/interventions/extracted/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(dentalRecordsService, times(1)).getPatientAllExtractedTooth(patientCnp);
    }

    @Test
    void testAddNewIntervention_Success() throws Exception {
        // Arrange
        doNothing().when(dentalRecordsService).addNewIntervention(any(ToothInterventionDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/dental-records/interventions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interventionDto)))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).addNewIntervention(any(ToothInterventionDto.class));
    }

    @Test
    void testDeleteIntervention_Success() throws Exception {
        // Arrange
        Long interventionId = 1L;
        doNothing().when(dentalRecordsService).deleteIntervention(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/dental-records/interventions/" + interventionId))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).deleteIntervention(interventionId);
    }

    @Test
    void testEditIntervention_Success() throws Exception {
        // Arrange
        Long interventionId = 1L;
        interventionDto.setInterventionId(interventionId);
        doNothing().when(dentalRecordsService).updateIntervention(any(ToothInterventionDto.class));

        // Act & Assert
        mockMvc.perform(put("/api/dental-records/interventions/" + interventionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interventionDto)))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).updateIntervention(any(ToothInterventionDto.class));
    }

    @Test
    void testDeleteExtraction_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        Integer toothNumber = 5;
        doNothing().when(dentalRecordsService).deleteTeethExtraction(anyString(), anyInt());

        // Act & Assert
        mockMvc.perform(delete("/api/dental-records/interventions/extracted/" + patientCnp + "/" + toothNumber))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).deleteTeethExtraction(patientCnp, toothNumber);
    }
}
