package com.dentalhelp.notification.listener;

import com.dentalhelp.notification.event.UserRegistrationEvent;
import com.dentalhelp.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserRegistrationEventListener {

    private final EmailService emailService;

    @RabbitListener(queues = "${rabbitmq.queue.user.notification}")
    public void handleUserRegistration(UserRegistrationEvent event) {
        try {
            emailService.sendEmail(
                    event.getEmail(),
                    "Welcome to DentHelp",
                    "Welcome " + event.getUsername() + "!\n\nThank you for registering with DentHelp."
            );
        } catch (Exception e) {
            System.err.println("Error processing user registration event: " + e.getMessage());
        }
    }
}
