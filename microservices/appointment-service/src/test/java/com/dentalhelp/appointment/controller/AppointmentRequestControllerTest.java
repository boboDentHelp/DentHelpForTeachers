package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.AppointmentRequestDto;
import com.dentalhelp.appointment.model.AppointmentRequest;
import com.dentalhelp.appointment.service.AppointmentService;
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

@WebMvcTest(AppointmentRequestController.class)
class AppointmentRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    private AppointmentRequestDto requestDto;

    @BeforeEach
    void setUp() {
        requestDto = new AppointmentRequestDto();
        requestDto.setPatientCnp("1234567890123");
        requestDto.setDesiredAppointmentTime("2024-12-15T10:00:00");
        requestDto.setAppointmentReason("Regular checkup");
    }

    @Test
    void testAddAppointmentRequest_Success() throws Exception {
        // Arrange
        doNothing().when(appointmentService).createAppointmentRequest(any(AppointmentRequestDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/appointment-requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).createAppointmentRequest(any(AppointmentRequestDto.class));
    }

    @Test
    void testGetPatientRequests_Success() throws Exception {
        // Arrange
        String patientCnp = "1234567890123";
        AppointmentRequest request = new AppointmentRequest();
        request.setAppointmentRequestId(1L);
        request.setPatientCnp("1234567890123");
        request.setAppointmentReason("Regular checkup");
        request.setDesiredAppointmentTime("2024-12-15T10:00:00");
        request.setRequestDate("2024-12-01");
        List<AppointmentRequest> requests = Arrays.asList(request);
        when(appointmentService.getPatientAppointmentRequests(anyString())).thenReturn(requests);

        // Act & Assert
        mockMvc.perform(get("/api/appointment-requests/patient/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(appointmentService, times(1)).getPatientAppointmentRequests(patientCnp);
    }

    @Test
    void testUpdateRequest_Success() throws Exception {
        // Arrange
        Long requestId = 1L;
        doNothing().when(appointmentService).updateAppointmentRequest(anyLong(), any(AppointmentRequestDto.class));

        // Act & Assert
        mockMvc.perform(put("/api/appointment-requests/" + requestId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).updateAppointmentRequest(eq(requestId), any(AppointmentRequestDto.class));
    }

    @Test
    void testDeleteRequest_Success() throws Exception {
        // Arrange
        Long requestId = 1L;
        doNothing().when(appointmentService).deleteAppointmentRequest(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/appointment-requests/" + requestId))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).deleteAppointmentRequest(requestId);
    }

    @Test
    void testGetPatientRequests_EmptyList() throws Exception {
        // Arrange
        String patientCnp = "9999999999999";
        when(appointmentService.getPatientAppointmentRequests(anyString())).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/appointment-requests/patient/" + patientCnp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(appointmentService, times(1)).getPatientAppointmentRequests(patientCnp);
    }
}
