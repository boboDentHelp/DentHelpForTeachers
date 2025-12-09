package com.dentalhelp.notification.listener;

import com.dentalhelp.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailQueueListener {

    private final EmailService emailService;

    @RabbitListener(queues = "email.queue")
    public void handleEmailRequest(Map<String, String> emailData) {
        try {
            String to = emailData.get("to");
            String subject = emailData.get("subject");
            String body = emailData.get("body");

            log.info("Received email request from queue for: {}", to);

            emailService.sendEmail(to, subject, body);

            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error processing email from queue: {}", e.getMessage());
        }
    }
}
