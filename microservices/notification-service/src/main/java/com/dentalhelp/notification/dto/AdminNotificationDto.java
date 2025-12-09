package com.dentalhelp.notification.dto;

import com.dentalhelp.notification.model.NotificationStatus;
import com.dentalhelp.notification.model.NotificationType;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminNotificationDto {
    private Long notificationId;
    private Long appointmentId;
    private String observations;
    private String date;
    private String patientCnp;
    private NotificationType notificationType;
    private NotificationStatus notificationStatus;
}
