package com.dentalhelp.notification.service;

import com.dentalhelp.notification.dto.AdminNotificationDto;
import com.dentalhelp.notification.exception.ResourceNotFoundException;
import com.dentalhelp.notification.model.AdminNotification;
import com.dentalhelp.notification.model.NotificationStatus;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.repository.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AdminNotificationRepository notificationRepository;

    public List<AdminNotificationDto> getAllNotifications() {
        return notificationRepository.findAllByOrderByNotificationIdDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void createNotification(Long appointmentId, String patientCnp, String observations, NotificationType type) {
        AdminNotification notification = AdminNotification.builder()
                .appointmentId(appointmentId)
                .patientCnp(patientCnp)
                .observations(observations)
                .date(getCurrentDateTime())
                .notificationType(type)
                .notificationStatus(NotificationStatus.NEW)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        AdminNotification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setNotificationStatus(NotificationStatus.SEEN);
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        AdminNotification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notificationRepository.delete(notification);
    }

    private AdminNotificationDto convertToDto(AdminNotification notification) {
        return AdminNotificationDto.builder()
                .notificationId(notification.getNotificationId())
                .appointmentId(notification.getAppointmentId())
                .observations(notification.getObservations())
                .date(notification.getDate())
                .patientCnp(notification.getPatientCnp())
                .notificationType(notification.getNotificationType())
                .notificationStatus(notification.getNotificationStatus())
                .build();
    }

    private String getCurrentDateTime() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }
}
