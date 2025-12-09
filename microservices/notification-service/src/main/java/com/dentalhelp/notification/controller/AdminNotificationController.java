package com.dentalhelp.notification.controller;

import com.dentalhelp.notification.dto.AdminNotificationDto;
import com.dentalhelp.notification.dto.ApiResponse;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.service.EmailService;
import com.dentalhelp.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/in/notifications/admin")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @GetMapping("/get_notifications")
    public ResponseEntity<ApiResponse> getNotifications() {
        List<AdminNotificationDto> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @PostMapping("/send_notification/late_appointment/{id}")
    public ResponseEntity<ApiResponse> sendLateAppointmentNotification(
            @PathVariable Long id,
            @RequestParam String patientCnp,
            @RequestParam String observations) {

        notificationService.createNotification(id, patientCnp, observations, NotificationType.LATE_APPOINTMENT);
        return ResponseEntity.ok(ApiResponse.success("Late appointment notification created", null));
    }

    @PostMapping("/send_notification/cancel_appointment/{id}")
    public ResponseEntity<ApiResponse> sendCancelAppointmentNotification(
            @PathVariable Long id,
            @RequestParam String patientCnp,
            @RequestParam String observations) {

        notificationService.createNotification(id, patientCnp, observations, NotificationType.CANCEL_APPOINTMENT);
        return ResponseEntity.ok(ApiResponse.success("Cancel appointment notification created", null));
    }

    @PutMapping("/read_notification/{id}")
    public ResponseEntity<ApiResponse> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @DeleteMapping("/delete_notification/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }
}
