package com.dentalhelp.notification.controller;

import com.dentalhelp.notification.dto.AdminNotificationDto;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.model.NotificationStatus;
import com.dentalhelp.notification.service.NotificationService;
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

@WebMvcTest(AdminNotificationController.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    private AdminNotificationDto notificationDto;

    @BeforeEach
    void setUp() {
        notificationDto = new AdminNotificationDto();
        notificationDto.setNotificationId(1L);
        notificationDto.setAppointmentId(100L);
        notificationDto.setPatientCnp("1234567890123");
        notificationDto.setObservations("Test notification");
        notificationDto.setDate("2024-12-01");
        notificationDto.setNotificationType(NotificationType.LATE_APPOINTMENT);
        notificationDto.setNotificationStatus(NotificationStatus.NEW);
    }

    @Test
    void testGetAllNotifications_Success() throws Exception {
        // Arrange
        List<AdminNotificationDto> notifications = Arrays.asList(notificationDto);
        when(notificationService.getAllNotifications()).thenReturn(notifications);

        // Act & Assert
        mockMvc.perform(get("/api/in/notifications/admin/get_notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(notificationService, times(1)).getAllNotifications();
    }

    @Test
    void testGetAllNotifications_EmptyList() throws Exception {
        // Arrange
        when(notificationService.getAllNotifications()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/in/notifications/admin/get_notifications"))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).getAllNotifications();
    }

    @Test
    void testSendLateAppointmentNotification_Success() throws Exception {
        // Arrange
        Long appointmentId = 100L;
        String patientCnp = "1234567890123";
        String observations = "Patient was late";

        doNothing().when(notificationService).createNotification(
            anyLong(), anyString(), anyString(), any(NotificationType.class));

        // Act & Assert
        mockMvc.perform(post("/api/in/notifications/admin/send_notification/late_appointment/" + appointmentId)
                .param("patientCnp", patientCnp)
                .param("observations", observations))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).createNotification(
            eq(appointmentId), eq(patientCnp), eq(observations), eq(NotificationType.LATE_APPOINTMENT));
    }

    @Test
    void testSendCancelAppointmentNotification_Success() throws Exception {
        // Arrange
        Long appointmentId = 100L;
        String patientCnp = "1234567890123";
        String observations = "Appointment cancelled";

        doNothing().when(notificationService).createNotification(
            anyLong(), anyString(), anyString(), any(NotificationType.class));

        // Act & Assert
        mockMvc.perform(post("/api/in/notifications/admin/send_notification/cancel_appointment/" + appointmentId)
                .param("patientCnp", patientCnp)
                .param("observations", observations))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).createNotification(
            eq(appointmentId), eq(patientCnp), eq(observations), eq(NotificationType.CANCEL_APPOINTMENT));
    }

    @Test
    void testMarkNotificationAsRead_Success() throws Exception {
        // Arrange
        Long notificationId = 1L;
        doNothing().when(notificationService).markAsRead(notificationId);

        // Act & Assert
        mockMvc.perform(put("/api/in/notifications/admin/read_notification/" + notificationId))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).markAsRead(notificationId);
    }

    @Test
    void testDeleteNotification_Success() throws Exception {
        // Arrange
        Long notificationId = 1L;
        doNothing().when(notificationService).deleteNotification(notificationId);

        // Act & Assert
        mockMvc.perform(delete("/api/in/notifications/admin/delete_notification/" + notificationId))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).deleteNotification(notificationId);
    }
}
