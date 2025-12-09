package com.dentalhelp.appointment.service;

import com.dentalhelp.appointment.dto.*;
import com.dentalhelp.appointment.exception.ResourceNotFoundException;
import com.dentalhelp.appointment.model.AnamnesisAppointment;
import com.dentalhelp.appointment.model.Appointment;
import com.dentalhelp.appointment.model.AppointmentRequest;
import com.dentalhelp.appointment.repository.AnamnesisAppointmentRepository;
import com.dentalhelp.appointment.repository.AppointmentRepository;
import com.dentalhelp.appointment.repository.AppointmentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentRequestRepository appointmentRequestRepository;

    @Mock
    private AnamnesisAppointmentRepository anamnesisAppointmentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private AppointmentService appointmentService;

    private Appointment testAppointment;
    private AppointmentDto testAppointmentDto;
    private AppointmentRequest testAppointmentRequest;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        testAppointment = new Appointment();
        testAppointment.setAppointmentId(1L);
        testAppointment.setPatientCnp("1234567890123");
        testAppointment.setAppointmentReason("Checkup");
        testAppointment.setStartDateHour(now.toString());
        testAppointment.setEndDateHour(now.plusHours(1).toString());

        testAppointmentDto = new AppointmentDto();
        testAppointmentDto.setPatientCnp("1234567890123");
        testAppointmentDto.setAppointmentReason("Checkup");
        testAppointmentDto.setDate(now.toString());
        testAppointmentDto.setHour(now.plusHours(1).toString());

        testAppointmentRequest = AppointmentRequest.builder()
                .appointmentRequestId(1L)
                .patientCnp("1234567890123")
                .appointmentReason("Consultation")
                .desiredAppointmentTime(now.toString())
                .requestDate(now.toString())
                .build();
    }

    @Test
    void testSaveAppointment_Success() {
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);
        Appointment result = appointmentService.saveAppointment(testAppointmentDto);
        assertNotNull(result);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void testGetAllAppointments_Success() {
        when(appointmentRepository.findAll()).thenReturn(Arrays.asList(testAppointment));
        List<Appointment> result = appointmentService.getAllAppointments();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(appointmentRepository).findAll();
    }

    @Test
    void testGetAppointmentById_Success() {
        when(appointmentRepository.findByAppointmentId(anyLong())).thenReturn(Optional.of(testAppointment));
        Appointment result = appointmentService.getAppointmentById(1L);
        assertNotNull(result);
        verify(appointmentRepository).findByAppointmentId(1L);
    }

    @Test
    void testGetAppointmentById_NotFound() {
        when(appointmentRepository.findByAppointmentId(anyLong())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getAppointmentById(999L));
    }

    @Test
    void testModifyAppointment_Success() {
        when(appointmentRepository.findByAppointmentId(anyLong())).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);
        appointmentService.modifyAppointment(1L, testAppointmentDto);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void testDeleteAppointment_Success() {
        when(appointmentRepository.findByAppointmentId(anyLong())).thenReturn(Optional.of(testAppointment));
        appointmentService.deleteAppointment(1L);
        verify(appointmentRepository).delete(testAppointment);
    }

    @Test
    void testCreateAppointmentRequest_Success() {
        AppointmentRequestDto requestDto = new AppointmentRequestDto();
        requestDto.setPatientCnp("1234567890123");
        requestDto.setAppointmentReason("Consultation");

        when(appointmentRequestRepository.save(any(AppointmentRequest.class))).thenReturn(testAppointmentRequest);
        AppointmentRequest result = appointmentService.createAppointmentRequest(requestDto);
        assertNotNull(result);
        verify(appointmentRequestRepository).save(any(AppointmentRequest.class));
    }
}
