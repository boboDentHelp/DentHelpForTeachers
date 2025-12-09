package com.dentalhelp.treatment.repository;

import com.dentalhelp.treatment.model.TreatmentSheet;
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
class TreatmentSheetRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TreatmentSheetRepository treatmentRepository;

    private TreatmentSheet testTreatmentSheet;

    @BeforeEach
    void setUp() {
        testTreatmentSheet = new TreatmentSheet();
        testTreatmentSheet.setAppointmentId(100L);
        testTreatmentSheet.setAppointmentObservations("Patient shows good progress after root canal treatment");
        testTreatmentSheet.setRecommendations("Continue with prescribed medication and avoid hard foods");
        testTreatmentSheet.setMedication("Ibuprofen 400mg twice daily for 5 days");
    }

    @Test
    void testSaveTreatmentSheet() {
        // Act
        TreatmentSheet saved = treatmentRepository.save(testTreatmentSheet);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getTreatmentNumber());
        assertEquals(testTreatmentSheet.getAppointmentId(), saved.getAppointmentId());
        assertEquals(testTreatmentSheet.getAppointmentObservations(), saved.getAppointmentObservations());
        assertEquals(testTreatmentSheet.getRecommendations(), saved.getRecommendations());
    }

    @Test
    void testFindByAppointmentId() {
        // Arrange
        entityManager.persistAndFlush(testTreatmentSheet);

        // Act
        Optional<TreatmentSheet> found = treatmentRepository.findByAppointmentId(100L);

        // Assert
        assertTrue(found.isPresent());
        assertEquals(testTreatmentSheet.getAppointmentId(), found.get().getAppointmentId());
        assertEquals(testTreatmentSheet.getAppointmentObservations(), found.get().getAppointmentObservations());
    }

    @Test
    void testFindByAppointmentId_NotFound() {
        // Act
        Optional<TreatmentSheet> found = treatmentRepository.findByAppointmentId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testFindByTreatmentNumber() {
        // Arrange
        TreatmentSheet saved = entityManager.persistAndFlush(testTreatmentSheet);

        // Act
        Optional<TreatmentSheet> found = treatmentRepository.findByTreatmentNumber(saved.getTreatmentNumber());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getTreatmentNumber(), found.get().getTreatmentNumber());
    }

    @Test
    void testFindByTreatmentNumber_NotFound() {
        // Act
        Optional<TreatmentSheet> found = treatmentRepository.findByTreatmentNumber(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteTreatmentSheet() {
        // Arrange
        TreatmentSheet saved = entityManager.persistAndFlush(testTreatmentSheet);
        Long treatmentNumber = saved.getTreatmentNumber();

        // Act
        treatmentRepository.deleteById(treatmentNumber);
        entityManager.flush();

        // Assert
        Optional<TreatmentSheet> found = treatmentRepository.findById(treatmentNumber);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateTreatmentSheet() {
        // Arrange
        TreatmentSheet saved = entityManager.persistAndFlush(testTreatmentSheet);

        // Act
        saved.setAppointmentObservations("Updated observations - significant improvement");
        saved.setRecommendations("Updated recommendations - reduce medication dosage");
        saved.setMedication("Ibuprofen 200mg once daily");
        TreatmentSheet updated = treatmentRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("Updated observations - significant improvement", updated.getAppointmentObservations());
        assertEquals("Updated recommendations - reduce medication dosage", updated.getRecommendations());
        assertEquals("Ibuprofen 200mg once daily", updated.getMedication());
    }

    @Test
    void testFindAll() {
        // Arrange
        entityManager.persistAndFlush(testTreatmentSheet);

        TreatmentSheet another = new TreatmentSheet();
        another.setAppointmentId(101L);
        another.setAppointmentObservations("Routine checkup completed successfully");
        another.setRecommendations("Continue regular dental hygiene");
        another.setMedication("None required");
        entityManager.persistAndFlush(another);

        // Act
        List<TreatmentSheet> all = treatmentRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }

    @Test
    void testTreatmentSheetWithAllFields() {
        // Arrange
        TreatmentSheet complete = new TreatmentSheet();
        complete.setAppointmentId(200L);
        complete.setAppointmentObservations("Comprehensive dental examination performed. Patient shows excellent oral health.");
        complete.setRecommendations("Schedule follow-up in 6 months. Continue current oral hygiene routine.");
        complete.setMedication("Fluoride treatment applied - no additional medication required");

        // Act
        TreatmentSheet saved = entityManager.persistAndFlush(complete);

        // Assert
        assertNotNull(saved.getTreatmentNumber());
        assertEquals(200L, saved.getAppointmentId());
        assertTrue(saved.getAppointmentObservations().contains("Comprehensive dental examination"));
        assertTrue(saved.getRecommendations().contains("Schedule follow-up"));
        assertTrue(saved.getMedication().contains("Fluoride treatment"));
    }

    @Test
    void testMultipleTreatmentsForDifferentAppointments() {
        // Arrange
        TreatmentSheet treatment1 = new TreatmentSheet();
        treatment1.setAppointmentId(300L);
        treatment1.setAppointmentObservations("First treatment");
        treatment1.setRecommendations("First recommendations");
        treatment1.setMedication("First medication");
        entityManager.persistAndFlush(treatment1);

        TreatmentSheet treatment2 = new TreatmentSheet();
        treatment2.setAppointmentId(301L);
        treatment2.setAppointmentObservations("Second treatment");
        treatment2.setRecommendations("Second recommendations");
        treatment2.setMedication("Second medication");
        entityManager.persistAndFlush(treatment2);

        // Act
        Optional<TreatmentSheet> found1 = treatmentRepository.findByAppointmentId(300L);
        Optional<TreatmentSheet> found2 = treatmentRepository.findByAppointmentId(301L);

        // Assert
        assertTrue(found1.isPresent());
        assertTrue(found2.isPresent());
        assertEquals("First treatment", found1.get().getAppointmentObservations());
        assertEquals("Second treatment", found2.get().getAppointmentObservations());
    }
}
