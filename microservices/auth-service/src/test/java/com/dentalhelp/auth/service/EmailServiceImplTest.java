package com.dentalhelp.auth.service;

import com.dentalhelp.auth.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        // Mock void method
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendVerificationEmail_Success() {
        // Arrange
        String email = "test@example.com";
        String verificationCode = "123456";
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendVerificationEmail(email, verificationCode);

        // Assert
        verify(mailSender, times(1)).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage);
        assertEquals(email, sentMessage.getTo()[0]);
        assertNotNull(sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains(verificationCode));
    }

    @Test
    void testSendPasswordResetEmail_Success() {
        // Arrange
        String email = "test@example.com";
        String resetCode = "654321";
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendPasswordResetEmail(email, resetCode);

        // Assert
        verify(mailSender, times(1)).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage);
        assertEquals(email, sentMessage.getTo()[0]);
        assertNotNull(sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains(resetCode));
    }

    @Test
    void testSendVerificationEmail_WithNullEmail() {
        // Act & Assert
        assertThrows(Exception.class, () -> {
            emailService.sendVerificationEmail(null, "123456");
        });
    }

    @Test
    void testSendPasswordResetEmail_WithNullEmail() {
        // Act & Assert
        assertThrows(Exception.class, () -> {
            emailService.sendPasswordResetEmail(null, "654321");
        });
    }

    @Test
    void testSendVerificationEmail_MailSenderCalled() {
        // Arrange
        String email = "user@example.com";
        String code = "999999";

        // Act
        emailService.sendVerificationEmail(email, code);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendPasswordResetEmail_MailSenderCalled() {
        // Arrange
        String email = "user@example.com";
        String code = "888888";

        // Act
        emailService.sendPasswordResetEmail(email, code);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendVerificationEmail_MessageFormat() {
        // Arrange
        String email = "test@example.com";
        String code = "123456";
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendVerificationEmail(email, code);

        // Assert
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();

        assertNotNull(message.getSubject());
        assertNotNull(message.getText());
        assertNotNull(message.getTo());
        assertEquals(1, message.getTo().length);
    }

    @Test
    void testSendPasswordResetEmail_MessageFormat() {
        // Arrange
        String email = "reset@example.com";
        String code = "ABC123";
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendPasswordResetEmail(email, code);

        // Assert
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();

        assertNotNull(message.getSubject());
        assertNotNull(message.getText());
        assertNotNull(message.getTo());
        assertEquals(1, message.getTo().length);
    }
}
