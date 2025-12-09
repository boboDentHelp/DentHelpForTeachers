package com.dentalhelp.auth.service.impl;

import com.dentalhelp.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static com.dentalhelp.auth.config.RabbitMQConfig.EMAIL_EXCHANGE;
import static com.dentalhelp.auth.config.RabbitMQConfig.EMAIL_ROUTING_KEY;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final RabbitTemplate rabbitTemplate;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String email, String code) {
        // Log code to console for easy testing/debugging
        log.info("====================================");
        log.info("VERIFICATION CODE for {}: {}", email, code);
        log.info("====================================");

        // Send email asynchronously so it doesn't block the response
        sendEmailAsync(email, "Verification Code - Dental Help",
            "Your verification code is: " + code + "\n\nThis code will expire in 10 minutes.");
    }

    @Override
    public void sendPasswordResetEmail(String email, String code) {
        // Log code to console for easy testing/debugging
        log.info("====================================");
        log.info("PASSWORD RESET CODE for {}: {}", email, code);
        log.info("====================================");

        // Send email asynchronously so it doesn't block the response
        sendEmailAsync(email, "Password Reset Code - Dental Help",
            "Your password reset code is: " + code + "\n\nThis code will expire in 10 minutes.");
    }

    @Async
    private void sendEmailAsync(String to, String subject, String body) {
        // This runs in a separate thread - completely non-blocking!
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            // Send email - this may take time but won't block the API response
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);

        } catch (Exception e) {
            log.warn("Failed to send email directly to {}, trying RabbitMQ fallback: {}", to, e.getMessage());
            try {
                // Fallback to RabbitMQ for async processing
                Map<String, String> emailData = new HashMap<>();
                emailData.put("to", to);
                emailData.put("subject", subject);
                emailData.put("body", body);
                rabbitTemplate.convertAndSend(EMAIL_EXCHANGE, EMAIL_ROUTING_KEY, emailData);
                log.info("Email queued in RabbitMQ for {}", to);
            } catch (Exception rabbitEx) {
                log.error("Failed to queue email in RabbitMQ for {}: {}", to, rabbitEx.getMessage());
                // Even if both fail, we don't care - code is already logged
            }
        }
    }
}
