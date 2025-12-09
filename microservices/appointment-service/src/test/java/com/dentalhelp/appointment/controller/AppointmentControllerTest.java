package com.dentalhelp.appointment.controller;

import com.dentalhelp.appointment.dto.AppointmentDto;
import com.dentalhelp.appointment.model.Appointment;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    private AppointmentDto appointmentDto;

    @BeforeEach
    void setUp() {
        appointmentDto = new AppointmentDto();
        appointmentDto.setDate("2024-12-01");
        appointmentDto.setHour("10:00");
        appointmentDto.setPatientCnp("1234567890123");
        appointmentDto.setAppointmentReason("Regular checkup");
    }

    @Test
    void testSaveAppointment_Success() throws Exception {
        // Arrange
        doNothing().when(appointmentService).saveAppointment(any(AppointmentDto.class));

        // Act & Assert
        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentDto)))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).saveAppointment(any(AppointmentDto.class));
    }

    @Test
    void testGetAppointments_Success() throws Exception {
        // Arrange
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(1L);
        appointment.setPatientCnp("1234567890123");
        appointment.setAppointmentReason("Regular checkup");
        appointment.setStartDateHour("2024-12-01");
        appointment.setEndDateHour("10:00");
        List<Appointment> appointments = Arrays.asList(appointment);
        when(appointmentService.getAllAppointments()).thenReturn(appointments);

        // Act & Assert
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(appointmentService, times(1)).getAllAppointments();
    }

    @Test
    void testModifyAppointment_Success() throws Exception {
        // Arrange
        Long appointmentId = 1L;
        doNothing().when(appointmentService).modifyAppointment(eq(appointmentId), any(AppointmentDto.class));

        // Act & Assert
        mockMvc.perform(put("/api/appointments/" + appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentDto)))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).modifyAppointment(eq(appointmentId), any(AppointmentDto.class));
    }

    @Test
    void testDeleteAppointment_Success() throws Exception {
        // Arrange
        Long appointmentId = 1L;
        doNothing().when(appointmentService).deleteAppointment(appointmentId);

        // Act & Assert
        mockMvc.perform(delete("/api/appointments/" + appointmentId))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).deleteAppointment(appointmentId);
    }

    @Test
    void testSaveAppointment_WithInvalidData() throws Exception {
        // Arrange
        AppointmentDto invalidDto = new AppointmentDto();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isOk()); // Controller may not validate, service layer will

        verify(appointmentService, times(1)).saveAppointment(any(AppointmentDto.class));
    }

    @Test
    void testGetAppointments_EmptyList() throws Exception {
        // Arrange
        when(appointmentService.getAllAppointments()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(appointmentService, times(1)).getAllAppointments();
    }
}
