package com.dentalhelp.notification.repository;

import com.dentalhelp.notification.model.AdminNotification;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.model.NotificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class NotificationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AdminNotificationRepository notificationRepository;

    private AdminNotification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = new AdminNotification();
        testNotification.setAppointmentId(100L);
        testNotification.setPatientCnp("1234567890123");
        testNotification.setObservations("Appointment reminder");
        testNotification.setDate("2024-12-01");
        testNotification.setNotificationType(NotificationType.LATE_APPOINTMENT);
        testNotification.setNotificationStatus(NotificationStatus.NEW);
    }

    @Test
    void testSaveNotification() {
        // Act
        AdminNotification saved = notificationRepository.save(testNotification);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getNotificationId());
        assertEquals(testNotification.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testNotification.getObservations(), saved.getObservations());
        assertEquals(testNotification.getNotificationType(), saved.getNotificationType());
    }

    @Test
    void testFindByNotificationId() {
        // Arrange
        AdminNotification saved = entityManager.persistAndFlush(testNotification);

        // Act
        Optional<AdminNotification> found = notificationRepository.findByNotificationId(saved.getNotificationId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getNotificationId(), found.get().getNotificationId());
    }

    @Test
    void testFindByNotificationId_NotFound() {
        // Act
        Optional<AdminNotification> found = notificationRepository.findByNotificationId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testFindAllByOrderByNotificationIdDesc() {
        // Arrange
        entityManager.persistAndFlush(testNotification);

        AdminNotification another = new AdminNotification();
        another.setAppointmentId(101L);
        another.setPatientCnp("9876543210987");
        another.setObservations("Treatment completed");
        another.setDate("2024-12-02");
        another.setNotificationType(NotificationType.CANCEL_APPOINTMENT);
        another.setNotificationStatus(NotificationStatus.NEW);
        entityManager.persistAndFlush(another);

        // Act
        List<AdminNotification> notifications = notificationRepository.findAllByOrderByNotificationIdDesc();

        // Assert
        assertEquals(2, notifications.size());
        // Verify descending order
        assertTrue(notifications.get(0).getNotificationId() > notifications.get(1).getNotificationId());
    }

    @Test
    void testDeleteNotification() {
        // Arrange
        AdminNotification saved = entityManager.persistAndFlush(testNotification);
        Long notificationId = saved.getNotificationId();

        // Act
        notificationRepository.deleteById(notificationId);
        entityManager.flush();

        // Assert
        Optional<AdminNotification> found = notificationRepository.findById(notificationId);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateNotificationStatus() {
        // Arrange
        AdminNotification saved = entityManager.persistAndFlush(testNotification);
        assertEquals(NotificationStatus.NEW, saved.getNotificationStatus());

        // Act
        saved.setNotificationStatus(NotificationStatus.SEEN);
        AdminNotification updated = notificationRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals(NotificationStatus.SEEN, updated.getNotificationStatus());
    }

    @Test
    void testFindAll() {
        // Arrange
        entityManager.persistAndFlush(testNotification);

        AdminNotification another = new AdminNotification();
        another.setAppointmentId(102L);
        another.setPatientCnp("1111111111111");
        another.setObservations("Different notification");
        another.setDate("2024-12-03");
        another.setNotificationType(NotificationType.LATE_APPOINTMENT);
        another.setNotificationStatus(NotificationStatus.SEEN);
        entityManager.persistAndFlush(another);

        // Act
        List<AdminNotification> all = notificationRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }

    @Test
    void testNotificationWithAllFields() {
        // Arrange
        AdminNotification complete = new AdminNotification();
        complete.setAppointmentId(200L);
        complete.setPatientCnp("5555555555555");
        complete.setObservations("Complete notification test");
        complete.setDate("2024-12-10");
        complete.setNotificationType(NotificationType.CANCEL_APPOINTMENT);
        complete.setNotificationStatus(NotificationStatus.NEW);

        // Act
        AdminNotification saved = entityManager.persistAndFlush(complete);

        // Assert
        assertNotNull(saved.getNotificationId());
        assertEquals(200L, saved.getAppointmentId());
        assertEquals("5555555555555", saved.getPatientCnp());
        assertEquals("Complete notification test", saved.getObservations());
        assertEquals("2024-12-10", saved.getDate());
        assertEquals(NotificationType.CANCEL_APPOINTMENT, saved.getNotificationType());
        assertEquals(NotificationStatus.NEW, saved.getNotificationStatus());
    }
}
