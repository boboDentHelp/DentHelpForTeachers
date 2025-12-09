package com.dentalhelp.treatment.controller;

import com.dentalhelp.treatment.dto.TreatmentSheetDto;
import com.dentalhelp.treatment.service.TreatmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TreatmentSheetController.class)
class TreatmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TreatmentService treatmentService;

    private TreatmentSheetDto treatmentDto;

    @BeforeEach
    void setUp() {
        treatmentDto = new TreatmentSheetDto();
        treatmentDto.setTreatmentNumber(1L);
        treatmentDto.setAppointmentId(100L);
        treatmentDto.setAppointmentObservations("Patient shows good progress");
        treatmentDto.setRecommendations("Continue with prescribed medication");
        treatmentDto.setMedication("Ibuprofen 400mg");
    }

    @Test
    void testGetTreatmentSheet_Success() throws Exception {
        // Arrange
        Long appointmentId = 100L;
        when(treatmentService.getTreatmentSheetByAppointmentId(anyLong())).thenReturn(treatmentDto);

        // Act & Assert
        mockMvc.perform(get("/api/in/treatment-sheet/get-treatment-sheet/" + appointmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appointmentId").value(appointmentId));

        verify(treatmentService, times(1)).getTreatmentSheetByAppointmentId(appointmentId);
    }

    @Test
    void testSaveTreatmentSheet_Success() throws Exception {
        // Arrange
        doNothing().when(treatmentService).saveTreatmentSheet(any(TreatmentSheetDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/in/treatment-sheet/save-treatment-sheet")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(treatmentDto)))
                .andExpect(status().isOk());

        verify(treatmentService, times(1)).saveTreatmentSheet(any(TreatmentSheetDto.class));
    }

    @Test
    void testUpdateTreatmentSheet_Success() throws Exception {
        // Arrange
        doNothing().when(treatmentService).updateTreatmentSheet(any(TreatmentSheetDto.class));

        // Act & Assert
        mockMvc.perform(put("/api/in/treatment-sheet/update-sheet-treatment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(treatmentDto)))
                .andExpect(status().isOk());

        verify(treatmentService, times(1)).updateTreatmentSheet(any(TreatmentSheetDto.class));
    }

    @Test
    void testDeleteTreatmentSheet_Success() throws Exception {
        // Arrange
        Long treatmentNumber = 1L;
        doNothing().when(treatmentService).deleteTreatmentSheet(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/in/treatment-sheet/delete-treatment-sheet/" + treatmentNumber))
                .andExpect(status().isOk());

        verify(treatmentService, times(1)).deleteTreatmentSheet(treatmentNumber);
    }

    @Test
    void testSaveTreatmentSheet_WithAllFields() throws Exception {
        // Arrange
        TreatmentSheetDto completeDto = new TreatmentSheetDto();
        completeDto.setAppointmentId(200L);
        completeDto.setAppointmentObservations("Detailed observations about the treatment");
        completeDto.setRecommendations("Follow-up in 2 weeks");
        completeDto.setMedication("Amoxicillin 500mg, 3 times daily");

        doNothing().when(treatmentService).saveTreatmentSheet(any(TreatmentSheetDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/in/treatment-sheet/save-treatment-sheet")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeDto)))
                .andExpect(status().isOk());

        verify(treatmentService, times(1)).saveTreatmentSheet(any(TreatmentSheetDto.class));
    }
}
