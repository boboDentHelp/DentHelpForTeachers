package com.dentalhelp.dentalrecords.repository;

import com.dentalhelp.dentalrecords.model.ToothIntervention;
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
class ToothInterventionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ToothInterventionRepository toothInterventionRepository;

    private ToothIntervention testIntervention;

    @BeforeEach
    void setUp() {
        testIntervention = new ToothIntervention();
        testIntervention.setPatientCnp("1234567890123");
        testIntervention.setToothNumber(5);
        testIntervention.setInterventionDetails("Composite filling");
        testIntervention.setDateIntervention("2024-12-01");
        testIntervention.setIsExtracted("false");
    }

    @Test
    void testSaveToothIntervention() {
        // Act
        ToothIntervention saved = toothInterventionRepository.save(testIntervention);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getInterventionId());
        assertEquals(testIntervention.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testIntervention.getToothNumber(), saved.getToothNumber());
    }

    @Test
    void testFindByPatientCnpAndToothNumber() {
        // Arrange
        entityManager.persistAndFlush(testIntervention);

        // Act
        List<ToothIntervention> interventions = toothInterventionRepository.findByPatientCnpAndToothNumber("1234567890123", 5);

        // Assert
        assertEquals(1, interventions.size());
        assertEquals(testIntervention.getPatientCnp(), interventions.get(0).getPatientCnp());
        assertEquals(testIntervention.getToothNumber(), interventions.get(0).getToothNumber());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testIntervention);

        ToothIntervention another = new ToothIntervention();
        another.setPatientCnp("1234567890123");
        another.setToothNumber(10);
        another.setInterventionDetails("Root canal treatment");
        another.setDateIntervention("2024-12-02");
        another.setIsExtracted("false");
        entityManager.persistAndFlush(another);

        // Act
        List<ToothIntervention> interventions = toothInterventionRepository.findByPatientCnp("1234567890123");

        // Assert
        assertEquals(2, interventions.size());
        assertTrue(interventions.stream().allMatch(i -> i.getPatientCnp().equals("1234567890123")));
    }

    @Test
    void testFindByPatientCnpAndIsExtracted() {
        // Arrange
        testIntervention.setIsExtracted("true");
        testIntervention.setInterventionDetails("EXTRACTION");
        entityManager.persistAndFlush(testIntervention);

        ToothIntervention nonExtracted = new ToothIntervention();
        nonExtracted.setPatientCnp("1234567890123");
        nonExtracted.setToothNumber(10);
        nonExtracted.setInterventionDetails("Filling");
        nonExtracted.setDateIntervention("2024-12-03");
        nonExtracted.setIsExtracted("false");
        entityManager.persistAndFlush(nonExtracted);

        // Act
        List<ToothIntervention> extracted = toothInterventionRepository.findByPatientCnpAndIsExtracted("1234567890123", "true");

        // Assert
        assertEquals(1, extracted.size());
        assertEquals("true", extracted.get(0).getIsExtracted());
    }

    @Test
    void testFindByInterventionId() {
        // Arrange
        ToothIntervention saved = entityManager.persistAndFlush(testIntervention);

        // Act
        Optional<ToothIntervention> found = toothInterventionRepository.findByInterventionId(saved.getInterventionId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getInterventionId(), found.get().getInterventionId());
    }

    @Test
    void testFindByInterventionId_NotFound() {
        // Act
        Optional<ToothIntervention> found = toothInterventionRepository.findByInterventionId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteByPatientCnpAndToothNumber() {
        // Arrange
        entityManager.persistAndFlush(testIntervention);

        // Act
        toothInterventionRepository.deleteByPatientCnpAndToothNumber("1234567890123", 5);
        entityManager.flush();

        // Assert
        List<ToothIntervention> remaining = toothInterventionRepository.findByPatientCnpAndToothNumber("1234567890123", 5);
        assertTrue(remaining.isEmpty());
    }

    @Test
    void testUpdateToothIntervention() {
        // Arrange
        ToothIntervention saved = entityManager.persistAndFlush(testIntervention);

        // Act
        saved.setInterventionDetails("Updated to root canal");
        ToothIntervention updated = toothInterventionRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("Updated to root canal", updated.getInterventionDetails());
    }
}
