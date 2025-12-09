package com.dentalhelp.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.appointment}")
    private String appointmentExchange;

    @Value("${rabbitmq.queue.appointment.notification}")
    private String appointmentNotificationQueue;

    @Value("${rabbitmq.routing.appointment.notification}")
    private String appointmentNotificationRoutingKey;

    @Value("${rabbitmq.exchange.user}")
    private String userExchange;

    @Value("${rabbitmq.queue.user.notification}")
    private String userNotificationQueue;

    @Value("${rabbitmq.routing.user.notification}")
    private String userNotificationRoutingKey;

    @Value("${rabbitmq.exchange.email:email.exchange}")
    private String emailExchange;

    @Value("${rabbitmq.queue.email:email.queue}")
    private String emailQueue;

    @Value("${rabbitmq.routing.email:email.send}")
    private String emailRoutingKey;

    // Appointment Exchange and Queue
    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(appointmentExchange);
    }

    @Bean
    public Queue appointmentNotificationQueue() {
        return new Queue(appointmentNotificationQueue, true);
    }

    @Bean
    public Binding appointmentNotificationBinding() {
        return BindingBuilder
                .bind(appointmentNotificationQueue())
                .to(appointmentExchange())
                .with(appointmentNotificationRoutingKey);
    }

    // User Exchange and Queue
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(userExchange);
    }

    @Bean
    public Queue userNotificationQueue() {
        return new Queue(userNotificationQueue, true);
    }

    @Bean
    public Binding userNotificationBinding() {
        return BindingBuilder
                .bind(userNotificationQueue())
                .to(userExchange())
                .with(userNotificationRoutingKey);
    }

    // Email Exchange and Queue
    @Bean
    public TopicExchange emailExchange() {
        return new TopicExchange(emailExchange);
    }

    @Bean
    public Queue emailQueue() {
        return new Queue(emailQueue, true);
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder
                .bind(emailQueue())
                .to(emailExchange())
                .with(emailRoutingKey);
    }

    // Message Converter
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        return admin;
    }
}
