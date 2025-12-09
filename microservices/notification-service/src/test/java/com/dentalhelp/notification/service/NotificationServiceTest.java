package com.dentalhelp.notification.service;

import com.dentalhelp.notification.dto.AdminNotificationDto;
import com.dentalhelp.notification.exception.ResourceNotFoundException;
import com.dentalhelp.notification.model.AdminNotification;
import com.dentalhelp.notification.model.NotificationStatus;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.repository.AdminNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private AdminNotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private AdminNotification testNotification;
    private String patientCnp = "1234567890123";
    private Long appointmentId = 100L;

    @BeforeEach
    void setUp() {
        testNotification = AdminNotification.builder()
                .notificationId(1L)
                .appointmentId(appointmentId)
                .patientCnp(patientCnp)
                .observations("Patient requires follow-up")
                .date("2024-01-15 14:30:00")
                .notificationType(NotificationType.NEW_APPOINTMENT)
                .notificationStatus(NotificationStatus.NEW)
                .build();
    }

    @Test
    void testGetAllNotifications_Success() {
        // Arrange
        AdminNotification notification2 = AdminNotification.builder()
                .notificationId(2L)
                .appointmentId(200L)
                .patientCnp("9876543210987")
                .observations("Urgent case")
                .date("2024-01-16 10:00:00")
                .notificationType(NotificationType.CANCEL_APPOINTMENT)
                .notificationStatus(NotificationStatus.SEEN)
                .build();

        when(notificationRepository.findAllByOrderByNotificationIdDesc())
                .thenReturn(Arrays.asList(notification2, testNotification));

        // Act
        List<AdminNotificationDto> result = notificationService.getAllNotifications();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(notification2.getNotificationId(), result.get(0).getNotificationId());
        assertEquals(testNotification.getNotificationId(), result.get(1).getNotificationId());
        verify(notificationRepository).findAllByOrderByNotificationIdDesc();
    }

    @Test
    void testGetAllNotifications_EmptyList() {
        // Arrange
        when(notificationRepository.findAllByOrderByNotificationIdDesc())
                .thenReturn(Arrays.asList());

        // Act
        List<AdminNotificationDto> result = notificationService.getAllNotifications();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(notificationRepository).findAllByOrderByNotificationIdDesc();
    }

    @Test
    void testCreateNotification_NewAppointment() {
        // Arrange
        String observations = "New appointment scheduled";
        when(notificationRepository.save(any(AdminNotification.class)))
                .thenReturn(testNotification);

        // Act
        notificationService.createNotification(appointmentId, patientCnp, observations, NotificationType.NEW_APPOINTMENT);

        // Assert
        verify(notificationRepository).save(any(AdminNotification.class));
    }

    @Test
    void testCreateNotification_CancelledAppointment() {
        // Arrange
        String observations = "Appointment cancelled";
        when(notificationRepository.save(any(AdminNotification.class)))
                .thenReturn(testNotification);

        // Act
        notificationService.createNotification(appointmentId, patientCnp, observations, NotificationType.CANCEL_APPOINTMENT);

        // Assert
        verify(notificationRepository).save(any(AdminNotification.class));
    }

    @Test
    void testCreateNotification_VerifiesDefaultStatus() {
        // Arrange
        String observations = "Test notification";
        AdminNotification[] capturedNotification = new AdminNotification[1];

        when(notificationRepository.save(any(AdminNotification.class)))
                .thenAnswer(invocation -> {
                    capturedNotification[0] = invocation.getArgument(0);
                    return capturedNotification[0];
                });

        // Act
        notificationService.createNotification(appointmentId, patientCnp, observations, NotificationType.NEW_APPOINTMENT);

        // Assert
        assertNotNull(capturedNotification[0]);
        assertEquals(NotificationStatus.NEW, capturedNotification[0].getNotificationStatus());
        assertEquals(appointmentId, capturedNotification[0].getAppointmentId());
        assertEquals(patientCnp, capturedNotification[0].getPatientCnp());
        assertEquals(observations, capturedNotification[0].getObservations());
        assertEquals(NotificationType.NEW_APPOINTMENT, capturedNotification[0].getNotificationType());
    }

    @Test
    void testMarkAsRead_Success() {
        // Arrange
        when(notificationRepository.findByNotificationId(1L))
                .thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(AdminNotification.class)))
                .thenReturn(testNotification);

        // Act
        notificationService.markAsRead(1L);

        // Assert
        verify(notificationRepository).findByNotificationId(1L);
        verify(notificationRepository).save(testNotification);
        assertEquals(NotificationStatus.SEEN, testNotification.getNotificationStatus());
    }

    @Test
    void testMarkAsRead_NotFound() {
        // Arrange
        when(notificationRepository.findByNotificationId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            notificationService.markAsRead(999L));
        verify(notificationRepository).findByNotificationId(999L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void testDeleteNotification_Success() {
        // Arrange
        when(notificationRepository.findByNotificationId(1L))
                .thenReturn(Optional.of(testNotification));

        // Act
        notificationService.deleteNotification(1L);

        // Assert
        verify(notificationRepository).findByNotificationId(1L);
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void testDeleteNotification_NotFound() {
        // Arrange
        when(notificationRepository.findByNotificationId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            notificationService.deleteNotification(999L));
        verify(notificationRepository).findByNotificationId(999L);
        verify(notificationRepository, never()).delete(any());
    }

    @Test
    void testConvertToDto() {
        // Arrange
        when(notificationRepository.findAllByOrderByNotificationIdDesc())
                .thenReturn(Arrays.asList(testNotification));

        // Act
        List<AdminNotificationDto> result = notificationService.getAllNotifications();

        // Assert - verify DTO conversion is correct
        AdminNotificationDto dto = result.get(0);
        assertEquals(testNotification.getNotificationId(), dto.getNotificationId());
        assertEquals(testNotification.getAppointmentId(), dto.getAppointmentId());
        assertEquals(testNotification.getPatientCnp(), dto.getPatientCnp());
        assertEquals(testNotification.getObservations(), dto.getObservations());
        assertEquals(testNotification.getDate(), dto.getDate());
        assertEquals(testNotification.getNotificationType(), dto.getNotificationType());
        assertEquals(testNotification.getNotificationStatus(), dto.getNotificationStatus());
    }
}
