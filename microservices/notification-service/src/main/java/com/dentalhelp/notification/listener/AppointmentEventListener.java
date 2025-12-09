package com.dentalhelp.notification.listener;

import com.dentalhelp.notification.event.AppointmentEvent;
import com.dentalhelp.notification.model.NotificationType;
import com.dentalhelp.notification.service.EmailService;
import com.dentalhelp.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentEventListener {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queue.appointment.notification}")
    public void handleAppointmentEvent(AppointmentEvent event) {
        try {
            switch (event.getEventType()) {
                case "CREATED":
                    handleAppointmentCreated(event);
                    break;
                case "MODIFIED":
                    handleAppointmentModified(event);
                    break;
                case "DELETED":
                    handleAppointmentDeleted(event);
                    break;
                case "CONFIRMED":
                    handleAppointmentConfirmed(event);
                    break;
                case "REJECTED":
                    handleAppointmentRejected(event);
                    break;
                default:
                    System.out.println("Unknown event type: " + event.getEventType());
            }
        } catch (Exception e) {
            System.err.println("Error processing appointment event: " + e.getMessage());
        }
    }

    private void handleAppointmentCreated(AppointmentEvent event) {
        // Create admin notification
        notificationService.createNotification(
                event.getAppointmentId(),
                event.getPatientCnp(),
                "New appointment request",
                NotificationType.NEW_APPOINTMENT
        );

        // Send email to patient
        if (event.getPatientEmail() != null) {
            emailService.sendEmail(
                    event.getPatientEmail(),
                    "Appointment Request Submitted",
                    "Your appointment request for " + event.getAppointmentDate() + " has been submitted successfully."
            );
        }
    }

    private void handleAppointmentModified(AppointmentEvent event) {
        if (event.getPatientEmail() != null) {
            emailService.sendEmail(
                    event.getPatientEmail(),
                    "Appointment Modified",
                    "Your appointment for " + event.getAppointmentDate() + " has been modified."
            );
        }
    }

    private void handleAppointmentDeleted(AppointmentEvent event) {
        if (event.getPatientEmail() != null) {
            emailService.sendAppointmentCancellationEmail(
                    event.getPatientEmail(),
                    event.getAppointmentDate()
            );
        }
    }

    private void handleAppointmentConfirmed(AppointmentEvent event) {
        if (event.getPatientEmail() != null) {
            emailService.sendAppointmentConfirmationEmail(
                    event.getPatientEmail(),
                    event.getAppointmentDate()
            );
        }
    }

    private void handleAppointmentRejected(AppointmentEvent event) {
        if (event.getPatientEmail() != null) {
            emailService.sendEmail(
                    event.getPatientEmail(),
                    "Appointment Request Rejected",
                    "Your appointment request for " + event.getAppointmentDate() + " has been rejected."
            );
        }
    }
}
