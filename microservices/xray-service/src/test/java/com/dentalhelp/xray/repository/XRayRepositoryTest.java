package com.dentalhelp.xray.repository;

import com.dentalhelp.xray.model.XRay;
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
class XRayRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private XRayRepository xRayRepository;

    private XRay testXRay;

    @BeforeEach
    void setUp() {
        testXRay = new XRay();
        testXRay.setPatientCnp("1234567890123");
        testXRay.setObservations("Panoramic X-Ray");
        testXRay.setDate("2024-12-01");
        testXRay.setFilePath("https://storage.azure.com/xray123.jpg");
    }

    @Test
    void testSaveXRay() {
        // Act
        XRay saved = xRayRepository.save(testXRay);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getXrayId());
        assertEquals(testXRay.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testXRay.getObservations(), saved.getObservations());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testXRay);

        XRay anotherXRay = new XRay();
        anotherXRay.setPatientCnp("1234567890123");
        anotherXRay.setObservations("Periapical X-Ray");
        anotherXRay.setDate("2024-12-02");
        anotherXRay.setFilePath("https://storage.azure.com/xray456.jpg");
        entityManager.persistAndFlush(anotherXRay);

        // Act
        List<XRay> xrays = xRayRepository.findByPatientCnp("1234567890123");

        // Assert
        assertEquals(2, xrays.size());
        assertTrue(xrays.stream().allMatch(x -> x.getPatientCnp().equals("1234567890123")));
    }

    @Test
    void testFindByPatientCnp_NoResults() {
        // Act
        List<XRay> xrays = xRayRepository.findByPatientCnp("9999999999999");

        // Assert
        assertTrue(xrays.isEmpty());
    }

    @Test
    void testFindByXrayId() {
        // Arrange
        XRay saved = entityManager.persistAndFlush(testXRay);

        // Act
        Optional<XRay> found = xRayRepository.findByXrayId(saved.getXrayId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals(saved.getXrayId(), found.get().getXrayId());
    }

    @Test
    void testFindByXrayId_NotFound() {
        // Act
        Optional<XRay> found = xRayRepository.findByXrayId(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteXRay() {
        // Arrange
        XRay saved = entityManager.persistAndFlush(testXRay);
        Long xrayId = saved.getXrayId();

        // Act
        xRayRepository.deleteById(xrayId);
        entityManager.flush();

        // Assert
        Optional<XRay> found = xRayRepository.findById(xrayId);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdateXRay() {
        // Arrange
        XRay saved = entityManager.persistAndFlush(testXRay);

        // Act
        saved.setObservations("Updated X-Ray Description");
        XRay updated = xRayRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("Updated X-Ray Description", updated.getObservations());
    }

    @Test
    void testFindAll() {
        // Arrange
        entityManager.persistAndFlush(testXRay);

        XRay another = new XRay();
        another.setPatientCnp("9876543210987");
        another.setObservations("Another X-Ray");
        another.setDate("2024-12-03");
        another.setFilePath("https://storage.azure.com/xray789.jpg");
        entityManager.persistAndFlush(another);

        // Act
        List<XRay> all = xRayRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }
}
