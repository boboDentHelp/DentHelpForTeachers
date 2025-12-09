package com.dentalhelp.dentalrecords.controller;

import com.dentalhelp.dentalrecords.dto.ToothProblemDto;
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

@WebMvcTest(ToothProblemController.class)
class ToothProblemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DentalRecordsService dentalRecordsService;

    private ToothProblemDto toothProblemDto;

    @BeforeEach
    void setUp() {
        toothProblemDto = new ToothProblemDto();
        toothProblemDto.setPatientCnp("1234567890123");
        toothProblemDto.setToothNumber(5);
        toothProblemDto.setProblemDetails("Cavity detected");
        toothProblemDto.setDateProblem("2024-12-01");
    }

    @Test
    void testGetPatientToothProblems_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        Integer toothNumber = 5;
        List<ToothProblemDto> problems = Arrays.asList(toothProblemDto);
        when(dentalRecordsService.getPatientToothProblems(anyString(), anyInt())).thenReturn(problems);

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/problems/" + patientCnp + "/" + toothNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(dentalRecordsService, times(1)).getPatientToothProblems(patientCnp, toothNumber);
    }

    @Test
    void testGetPatientAllToothProblems_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        List<ToothProblemDto> problems = Arrays.asList(toothProblemDto);
        when(dentalRecordsService.getPatientAllToothProblems(anyString())).thenReturn(problems);

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/problems/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(dentalRecordsService, times(1)).getPatientAllToothProblems(patientCnp);
    }

    @Test
    void testAddNewProblem_Success() throws Exception {
        // Arrange
        doNothing().when(dentalRecordsService).addNewProblem(any(ToothProblemDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/dental-records/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(toothProblemDto)))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).addNewProblem(any(ToothProblemDto.class));
    }

    @Test
    void testDeleteProblem_Success() throws Exception {
        // Arrange
        Long problemId = 1L;
        doNothing().when(dentalRecordsService).deleteProblem(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/dental-records/problems/" + problemId))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).deleteProblem(problemId);
    }

    @Test
    void testEditProblem_Success() throws Exception {
        // Arrange
        Long problemId = 1L;
        toothProblemDto.setProblemId(problemId);
        doNothing().when(dentalRecordsService).updateProblem(any(ToothProblemDto.class));

        // Act & Assert
        mockMvc.perform(put("/api/dental-records/problems/" + problemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(toothProblemDto)))
                .andExpect(status().isOk());

        verify(dentalRecordsService, times(1)).updateProblem(any(ToothProblemDto.class));
    }

    @Test
    void testGetPatientAllToothProblems_EmptyList() throws Exception {
        // Arrange
        String patientCnp = "9999999999999";
        when(dentalRecordsService.getPatientAllToothProblems(anyString())).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/dental-records/problems/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(dentalRecordsService, times(1)).getPatientAllToothProblems(patientCnp);
    }
}
