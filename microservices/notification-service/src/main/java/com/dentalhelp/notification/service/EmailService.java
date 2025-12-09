package com.dentalhelp.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendAppointmentReminderEmail(String recipientEmail, String appointmentDate) {
        String subject = "Reminder: Programare la dentist";
        String body = "Bună ziua,\n\nAceasta este o reamintire că aveți o programare la data de "
                + appointmentDate + ".\n\nVă mulțumim!";
        sendEmail(recipientEmail, subject, body);
    }

    public void sendAppointmentConfirmationEmail(String recipientEmail, String appointmentDate) {
        String subject = "Programare confirmată";
        String body = "Bună ziua,\n\nProgramarea dumneavoastră pentru data de "
                + appointmentDate + " a fost confirmată.\n\nVă mulțumim!";
        sendEmail(recipientEmail, subject, body);
    }

    public void sendAppointmentCancellationEmail(String recipientEmail, String appointmentDate) {
        String subject = "Programare anulată";
        String body = "Bună ziua,\n\nProgramarea dumneavoastră pentru data de "
                + appointmentDate + " a fost anulată.\n\nVă mulțumim!";
        sendEmail(recipientEmail, subject, body);
    }
}
