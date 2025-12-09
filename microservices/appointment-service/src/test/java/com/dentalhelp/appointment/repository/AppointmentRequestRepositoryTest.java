package com.dentalhelp.appointment.repository;

import com.dentalhelp.appointment.model.AppointmentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class AppointmentRequestRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AppointmentRequestRepository appointmentRequestRepository;

    private AppointmentRequest testRequest;

    @BeforeEach
    void setUp() {
        testRequest = new AppointmentRequest();
        testRequest.setPatientCnp("1234567890123");
        testRequest.setDesiredAppointmentTime("2024-12-15T10:00:00");
        testRequest.setAppointmentReason("Regular checkup");
    }

    @Test
    void testSaveAppointmentRequest() {
        // Act
        AppointmentRequest saved = appointmentRequestRepository.save(testRequest);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getAppointmentRequestId());
        assertEquals(testRequest.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testRequest.getAppointmentReason(), saved.getAppointmentReason());
    }

    @Test
    void testFindByAppointmentRequestId() {
        // Arrange
        AppointmentRequest saved = entityManager.persistAndFlush(testRequest);

        // Act
        Optional<AppointmentRequest> found = appointmentRequestRepository.findByAppointmentRequestId(saved.getAppointmentRequestId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getAppointmentRequestId(), found.get().getAppointmentRequestId());
    }

    @Test
    void testFindByAppointmentRequestId_NotFound() {
        // Act
        Optional<AppointmentRequest> found = appointmentRequestRepository.findByAppointmentRequestId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testRequest);

        AppointmentRequest another = new AppointmentRequest();
        another.setPatientCnp("1234567890123");
        another.setDesiredAppointmentTime("2024-12-16T14:00:00");
        another.setAppointmentReason("Followup");
        entityManager.persistAndFlush(another);

        // Act
        List<AppointmentRequest> requests = appointmentRequestRepository.findByPatientCnp("1234567890123");

        // Assert
        assertEquals(2, requests.size());
        assertTrue(requests.stream().allMatch(r -> r.getPatientCnp().equals("1234567890123")));
    }

    @Test
    void testFindByPatientCnp_NoResults() {
        // Act
        List<AppointmentRequest> requests = appointmentRequestRepository.findByPatientCnp("9999999999999");

        // Assert
        assertTrue(requests.isEmpty());
    }

    @Test
    void testDeleteAppointmentRequest() {
        // Arrange
        AppointmentRequest saved = entityManager.persistAndFlush(testRequest);
        Long requestId = saved.getAppointmentRequestId();

        // Act
        appointmentRequestRepository.deleteById(requestId);
        entityManager.flush();

        // Assert
        Optional<AppointmentRequest> found = appointmentRequestRepository.findById(requestId);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateAppointmentRequest() {
        // Arrange
        AppointmentRequest saved = entityManager.persistAndFlush(testRequest);

        // Act
        saved.setDesiredAppointmentTime("2024-12-20T10:00:00");
        AppointmentRequest updated = appointmentRequestRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("2024-12-20T10:00:00", updated.getDesiredAppointmentTime());
    }

    @Test
    void testFindAllRequests() {
        // Arrange
        entityManager.persistAndFlush(testRequest);

        AppointmentRequest another = new AppointmentRequest();
        another.setPatientCnp("5555555555555");
        another.setDesiredAppointmentTime("2024-12-17T11:00:00");
        another.setAppointmentReason("Treatment");
        entityManager.persistAndFlush(another);

        // Act
        List<AppointmentRequest> all = appointmentRequestRepository.findAll();

        // Assert - Should have two requests
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(r -> r.getPatientCnp().equals("1234567890123")));
        assertTrue(all.stream().anyMatch(r -> r.getPatientCnp().equals("5555555555555")));
    }
}
