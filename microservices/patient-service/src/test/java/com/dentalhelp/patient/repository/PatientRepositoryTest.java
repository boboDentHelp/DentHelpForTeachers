package com.dentalhelp.patient.repository;

import com.dentalhelp.patient.model.PatientPersonalData;
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
class PatientRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PatientPersonalDataRepository patientRepository;

    private PatientPersonalData testPatient;

    @BeforeEach
    void setUp() {
        testPatient = new PatientPersonalData();
        testPatient.setPatientCnp("1234567890123");
        testPatient.setAddressStreet("Main Street");
        testPatient.setAddressNumber("123");
        testPatient.setAddressCountry("Romania");
        testPatient.setAddressRegion("Bucharest");
        testPatient.setPhoneNumber("0712345678");
        testPatient.setSex("M");
    }

    @Test
    void testSavePatient() {
        // Act
        PatientPersonalData saved = patientRepository.save(testPatient);
        entityManager.flush();

        // Assert
        assertNotNull(saved.getIdPersonalData());
        assertEquals(testPatient.getPatientCnp(), saved.getPatientCnp());
        assertEquals(testPatient.getAddressStreet(), saved.getAddressStreet());
        assertEquals(testPatient.getPhoneNumber(), saved.getPhoneNumber());
    }

    @Test
    void testFindByPatientCnp() {
        // Arrange
        entityManager.persistAndFlush(testPatient);

        // Act
        Optional<PatientPersonalData> found = patientRepository.findByPatientCnp("1234567890123");

        // Assert
        assertTrue(found.isPresent());
        assertEquals(testPatient.getPatientCnp(), found.get().getPatientCnp());
        assertEquals(testPatient.getAddressStreet(), found.get().getAddressStreet());
    }

    @Test
    void testFindByPatientCnp_NotFound() {
        // Act
        Optional<PatientPersonalData> found = patientRepository.findByPatientCnp("9999999999999");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteByPatientCnp() {
        // Arrange
        PatientPersonalData saved = entityManager.persistAndFlush(testPatient);
        String cnp = saved.getPatientCnp();

        // Act
        patientRepository.deleteByPatientCnp(cnp);
        entityManager.flush();

        // Assert
        Optional<PatientPersonalData> found = patientRepository.findByPatientCnp(cnp);
        assertFalse(found.isPresent());
    }

    @Test
    void testUpdatePatient() {
        // Arrange
        PatientPersonalData saved = entityManager.persistAndFlush(testPatient);

        // Act
        saved.setAddressStreet("Oak Avenue");
        saved.setAddressNumber("456");
        saved.setPhoneNumber("0798765432");
        PatientPersonalData updated = patientRepository.save(saved);
        entityManager.flush();

        // Assert
        assertEquals("Oak Avenue", updated.getAddressStreet());
        assertEquals("456", updated.getAddressNumber());
        assertEquals("0798765432", updated.getPhoneNumber());
    }

    @Test
    void testFindAll() {
        // Arrange
        entityManager.persistAndFlush(testPatient);

        PatientPersonalData another = new PatientPersonalData();
        another.setPatientCnp("9876543210987");
        another.setAddressStreet("Second Street");
        another.setAddressNumber("456");
        another.setAddressCountry("Romania");
        another.setAddressRegion("Cluj");
        another.setPhoneNumber("0798765432");
        another.setSex("F");
        entityManager.persistAndFlush(another);

        // Act
        List<PatientPersonalData> all = patientRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }

    @Test
    void testPatientWithAllFields() {
        // Arrange
        PatientPersonalData complete = new PatientPersonalData();
        complete.setPatientCnp("5555555555555");
        complete.setAddressStreet("Complete Street");
        complete.setAddressNumber("789");
        complete.setAddressCountry("Romania");
        complete.setAddressRegion("Timisoara");
        complete.setPhoneNumber("0755555555");
        complete.setSex("M");

        // Act
        PatientPersonalData saved = entityManager.persistAndFlush(complete);

        // Assert
        assertNotNull(saved.getIdPersonalData());
        assertEquals("5555555555555", saved.getPatientCnp());
        assertEquals("Complete Street", saved.getAddressStreet());
        assertEquals("789", saved.getAddressNumber());
        assertEquals("Romania", saved.getAddressCountry());
        assertEquals("Timisoara", saved.getAddressRegion());
        assertEquals("0755555555", saved.getPhoneNumber());
        assertEquals("M", saved.getSex());
    }

    @Test
    void testFindById() {
        // Arrange
        PatientPersonalData saved = entityManager.persistAndFlush(testPatient);
        Long id = saved.getIdPersonalData();

        // Act
        Optional<PatientPersonalData> found = patientRepository.findById(id);

        // Assert
        assertTrue(found.isPresent());
        assertEquals(id, found.get().getIdPersonalData());
        assertEquals(testPatient.getPatientCnp(), found.get().getPatientCnp());
    }
}
