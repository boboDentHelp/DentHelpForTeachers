package com.dentalhelp.appointment.service;

import com.dentalhelp.appointment.dto.*;
import com.dentalhelp.appointment.event.AppointmentEvent;
import com.dentalhelp.appointment.exception.ResourceNotFoundException;
import com.dentalhelp.appointment.model.AnamnesisAppointment;
import com.dentalhelp.appointment.model.Appointment;
import com.dentalhelp.appointment.model.AppointmentRequest;
import com.dentalhelp.appointment.repository.AnamnesisAppointmentRepository;
import com.dentalhelp.appointment.repository.AppointmentRepository;
import com.dentalhelp.appointment.repository.AppointmentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.dentalhelp.appointment.config.RabbitMQConfig.APPOINTMENT_EXCHANGE;
import static com.dentalhelp.appointment.config.RabbitMQConfig.APPOINTMENT_ROUTING_KEY;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentRequestRepository appointmentRequestRepository;
    private final AnamnesisAppointmentRepository anamnesisAppointmentRepository;
    private final RabbitTemplate rabbitTemplate;

    // Appointment CRUD Operations

    public Appointment saveAppointment(AppointmentDto appointmentDto) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentReason(appointmentDto.getAppointmentReason());
        appointment.setPatientCnp(appointmentDto.getPatientCnp());
        appointment.setStartDateHour(appointmentDto.getDate());
        appointment.setEndDateHour(appointmentDto.getHour());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Publish event for notification service
        publishAppointmentCreatedEvent(savedAppointment);

        return savedAppointment;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getPatientAppointments(String patientCnp) {
        return appointmentRepository.findByPatientCnp(patientCnp);
    }

    public Appointment getAppointmentById(Long appointmentId) {
        return appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
    }

    @Transactional
    public void modifyAppointment(Long appointmentId, AppointmentDto appointmentDto) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        appointment.setStartDateHour(appointmentDto.getDate());
        appointment.setEndDateHour(appointmentDto.getHour());
        appointment.setAppointmentReason(appointmentDto.getAppointmentReason());

        appointmentRepository.save(appointment);

        // Publish event for notification
        publishAppointmentModifiedEvent(appointment);
    }

    @Transactional
    public void deleteAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        appointmentRepository.delete(appointment);

        // Publish event for notification
        publishAppointmentDeletedEvent(appointment);
    }

    // Appointment Request Operations

    public AppointmentRequest createAppointmentRequest(AppointmentRequestDto requestDto) {
        AppointmentRequest request = AppointmentRequest.builder()
                .patientCnp(requestDto.getPatientCnp())
                .appointmentReason(requestDto.getAppointmentReason())
                .desiredAppointmentTime(requestDto.getDesiredAppointmentTime())
                .requestDate(requestDto.getRequestDate())
                .build();

        AppointmentRequest savedRequest = appointmentRequestRepository.save(request);

        // Publish event for admin notification
        publishAppointmentRequestCreatedEvent(savedRequest);

        return savedRequest;
    }

    public List<AppointmentRequest> getAllAppointmentRequests() {
        return appointmentRequestRepository.findAll();
    }

    public List<AppointmentRequest> getPatientAppointmentRequests(String patientCnp) {
        return appointmentRequestRepository.findByPatientCnp(patientCnp);
    }

    @Transactional
    public Appointment confirmAppointmentRequest(ConfirmAppointmentDto confirmDto) {
        AppointmentRequest request = appointmentRequestRepository.findByAppointmentRequestId(confirmDto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment request not found"));

        // Create appointment from request
        Appointment appointment = new Appointment();
        appointment.setPatientCnp(request.getPatientCnp());
        appointment.setAppointmentReason(request.getAppointmentReason());
        appointment.setStartDateHour(confirmDto.getDate());
        appointment.setEndDateHour(confirmDto.getHour());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Delete the request
        appointmentRequestRepository.delete(request);

        // Publish confirmation event
        publishAppointmentConfirmedEvent(savedAppointment);

        return savedAppointment;
    }

    @Transactional
    public void rejectAppointmentRequest(Long requestId) {
        AppointmentRequest request = appointmentRequestRepository.findByAppointmentRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment request not found"));

        appointmentRequestRepository.delete(request);

        // Publish rejection event
        publishAppointmentRejectedEvent(request);
    }

    @Transactional
    public void updateAppointmentRequest(Long requestId, AppointmentRequestDto requestDto) {
        AppointmentRequest request = appointmentRequestRepository.findByAppointmentRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment request not found"));

        request.setAppointmentReason(requestDto.getAppointmentReason());
        request.setDesiredAppointmentTime(requestDto.getDesiredAppointmentTime());

        appointmentRequestRepository.save(request);
    }

    @Transactional
    public void deleteAppointmentRequest(Long requestId) {
        AppointmentRequest request = appointmentRequestRepository.findByAppointmentRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment request not found"));

        appointmentRequestRepository.delete(request);
    }

    // Anamnesis Operations

    public AnamnesisAppointment saveAnamnesisAppointment(AnamnesisAppointmentDto anamnesisDto) {
        Appointment appointment = appointmentRepository.findByAppointmentId(anamnesisDto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AnamnesisAppointment anamnesis = AnamnesisAppointment.builder()
                .appointmentReason(anamnesisDto.getAppointmentReason())
                .currentMedication(anamnesisDto.getCurrentMedication())
                .recentMedication(anamnesisDto.getRecentMedication())
                .pregnancy(anamnesisDto.getPregnancy())
                .currentSymptoms(anamnesisDto.getCurrentSymptoms())
                .appointment(appointment)
                .build();

        return anamnesisAppointmentRepository.save(anamnesis);
    }

    public AnamnesisAppointment getAnamnesisAppointment(Long appointmentId) {
        return anamnesisAppointmentRepository.findByAppointment_AppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnesis not found for appointment: " + appointmentId));
    }

    // Event Publishing Methods

    private void publishAppointmentCreatedEvent(Appointment appointment) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(appointment.getAppointmentId())
                    .patientCnp(appointment.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(appointment.getStartDateHour() != null ? appointment.getStartDateHour().toString() : null)
                    .eventType("CREATED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to publish appointment created event: " + e.getMessage());
        }
    }

    private void publishAppointmentModifiedEvent(Appointment appointment) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(appointment.getAppointmentId())
                    .patientCnp(appointment.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(appointment.getStartDateHour() != null ? appointment.getStartDateHour().toString() : null)
                    .eventType("MODIFIED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("Failed to publish appointment modified event: " + e.getMessage());
        }
    }

    private void publishAppointmentDeletedEvent(Appointment appointment) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(appointment.getAppointmentId())
                    .patientCnp(appointment.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(appointment.getStartDateHour() != null ? appointment.getStartDateHour().toString() : null)
                    .eventType("DELETED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("Failed to publish appointment deleted event: " + e.getMessage());
        }
    }

    private void publishAppointmentRequestCreatedEvent(AppointmentRequest request) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(null) // No appointment ID yet for requests
                    .patientCnp(request.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(request.getDesiredAppointmentTime() != null ? request.getDesiredAppointmentTime().toString() : null)
                    .eventType("CREATED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("Failed to publish appointment request event: " + e.getMessage());
        }
    }

    private void publishAppointmentConfirmedEvent(Appointment appointment) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(appointment.getAppointmentId())
                    .patientCnp(appointment.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(appointment.getStartDateHour() != null ? appointment.getStartDateHour().toString() : null)
                    .eventType("CONFIRMED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("Failed to publish appointment confirmed event: " + e.getMessage());
        }
    }

    private void publishAppointmentRejectedEvent(AppointmentRequest request) {
        try {
            AppointmentEvent event = AppointmentEvent.builder()
                    .appointmentId(null) // No appointment ID for rejected requests
                    .patientCnp(request.getPatientCnp())
                    .patientEmail(null) // Email will be fetched by notification service if needed
                    .appointmentDate(request.getDesiredAppointmentTime() != null ? request.getDesiredAppointmentTime().toString() : null)
                    .eventType("REJECTED")
                    .build();

            rabbitTemplate.convertAndSend(
                    APPOINTMENT_EXCHANGE,
                    APPOINTMENT_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            System.err.println("Failed to publish appointment rejected event: " + e.getMessage());
        }
    }
}
