package com.dentalhelp.dentalrecords.repository;

import com.dentalhelp.dentalrecords.model.ToothProblem;
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
class ToothProblemRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ToothProblemRepository toothProblemRepository;

    private ToothProblem testProblem;

    @BeforeEach
    void setUp() {
        testProblem = new ToothProblem();
        testProblem.setPatientCnp("1234567890123");
        testProblem.setToothNumber(5);
        testProblem.setProblemDetails("Cavity");
        testProblem.setDateProblem("2024-12-01");
    }

    @Test
    void testSaveToothProblem() {
        // Act
        ToothProblem saved = toothProblemRepository.save(testProblem);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getProblemId());
        assertEquals(testProblem.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testProblem.getToothNumber(), saved.getToothNumber());
    }

    @Test
    void testFindByPatientCnpAndToothNumber() {
        // Arrange
        entityManager.persistAndFlush(testProblem);

        // Act
        List<ToothProblem> problems = toothProblemRepository.findByPatientCnpAndToothNumber("1234567890123", 5);

        // Assert
        assertEquals(1, problems.size());
        assertEquals(testProblem.getPatientCnp(), problems.get(0).getPatientCnp());
        assertEquals(testProblem.getToothNumber(), problems.get(0).getToothNumber());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testProblem);

        ToothProblem anotherProblem = new ToothProblem();
        anotherProblem.setPatientCnp("1234567890123");
        anotherProblem.setToothNumber(10);
        anotherProblem.setProblemDetails("Crack");
        anotherProblem.setDateProblem("2024-12-02");
        entityManager.persistAndFlush(anotherProblem);

        // Act
        List<ToothProblem> problems = toothProblemRepository.findByPatientCnp("1234567890123");

        // Assert
        assertEquals(2, problems.size());
        assertTrue(problems.stream().allMatch(p -> p.getPatientCnp().equals("1234567890123")));
    }

    @Test
    void testFindByProblemId() {
        // Arrange
        ToothProblem saved = entityManager.persistAndFlush(testProblem);

        // Act
        Optional<ToothProblem> found = toothProblemRepository.findByProblemId(saved.getProblemId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getProblemId(), found.get().getProblemId());
    }

    @Test
    void testFindByProblemId_NotFound() {
        // Act
        Optional<ToothProblem> found = toothProblemRepository.findByProblemId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteToothProblem() {
        // Arrange
        ToothProblem saved = entityManager.persistAndFlush(testProblem);
        Long problemId = saved.getProblemId();

        // Act
        toothProblemRepository.deleteById(problemId);
        entityManager.flush();

        // Assert
        Optional<ToothProblem> found = toothProblemRepository.findById(problemId);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateToothProblem() {
        // Arrange
        ToothProblem saved = entityManager.persistAndFlush(testProblem);

        // Act
        saved.setProblemDetails("Minor cavity");
        ToothProblem updated = toothProblemRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("Minor cavity", updated.getProblemDetails());
    }
}
