package com.dentalhelp.appointment.repository;

import com.dentalhelp.appointment.model.Appointment;
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
class AppointmentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        testAppointment = new Appointment();
        testAppointment.setStartDateHour("2024-12-01T10:00:00");
        testAppointment.setEndDateHour("2024-12-01T11:00:00");
        testAppointment.setPatientCnp("1234567890123");
        testAppointment.setAppointmentReason("Regular checkup");
    }

    @Test
    void testSaveAppointment() {
        // Act
        Appointment saved = appointmentRepository.save(testAppointment);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getAppointmentId());
        assertEquals(testAppointment.getStartDateHour(), saved.getStartDateHour());
        assertEquals(testAppointment.getEndDateHour(), saved.getEndDateHour());
        assertEquals(testAppointment.getPatientCnp(), saved.getPatientCnp());
    }

    @Test
    void testFindByAppointmentId() {
        // Arrange
        Appointment saved = entityManager.persistAndFlush(testAppointment);

        // Act
        Optional<Appointment> found = appointmentRepository.findByAppointmentId(saved.getAppointmentId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getAppointmentId(), found.get().getAppointmentId());
        assertEquals(testAppointment.getPatientCnp(), found.get().getPatientCnp());
    }

    @Test
    void testFindByAppointmentId_NotFound() {
        // Act
        Optional<Appointment> found = appointmentRepository.findByAppointmentId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testAppointment);

        Appointment anotherAppointment = new Appointment();
        anotherAppointment.setStartDateHour("2024-12-02T11:00:00");
        anotherAppointment.setEndDateHour("2024-12-02T12:00:00");
        anotherAppointment.setPatientCnp("1234567890123"); // Same patient
        anotherAppointment.setAppointmentReason("Follow-up");
        entityManager.persistAndFlush(anotherAppointment);

        // Act
        List<Appointment> appointments = appointmentRepository.findByPatientCnp("1234567890123");

        // Assert
        assertEquals(2, appointments.size());
        assertTrue(appointments.stream().allMatch(a -> a.getPatientCnp().equals("1234567890123")));
    }

    @Test
    void testFindByPatientCnp_NoResults() {
        // Act
        List<Appointment> appointments = appointmentRepository.findByPatientCnp("0000000000000");

        // Assert
        assertTrue(appointments.isEmpty());
    }

    @Test
    void testDeleteAppointment() {
        // Arrange
        Appointment saved = entityManager.persistAndFlush(testAppointment);
        Long appointmentId = saved.getAppointmentId();

        // Act
        appointmentRepository.deleteById(appointmentId);
        entityManager.flush();

        // Assert
        Optional<Appointment> found = appointmentRepository.findById(appointmentId);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateAppointment() {
        // Arrange
        Appointment saved = entityManager.persistAndFlush(testAppointment);

        // Act
        saved.setStartDateHour("2024-12-05T14:00:00");
        saved.setEndDateHour("2024-12-05T15:00:00");
        Appointment updated = appointmentRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("2024-12-05T14:00:00", updated.getStartDateHour());
        assertEquals("2024-12-05T15:00:00", updated.getEndDateHour());
        assertEquals(saved.getAppointmentId(), updated.getAppointmentId());
    }

    @Test
    void testFindAll() {
        // Arrange
        entityManager.persistAndFlush(testAppointment);

        Appointment another = new Appointment();
        another.setStartDateHour("2024-12-02T11:00:00");
        another.setEndDateHour("2024-12-02T12:00:00");
        another.setPatientCnp("9999999999999");
        another.setAppointmentReason("Cleaning");
        entityManager.persistAndFlush(another);

        // Act
        List<Appointment> all = appointmentRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }
}
