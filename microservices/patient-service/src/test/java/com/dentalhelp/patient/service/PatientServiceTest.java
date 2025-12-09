package com.dentalhelp.patient.service;

import com.dentalhelp.patient.dto.GeneralAnamnesisDto;
import com.dentalhelp.patient.dto.PatientPersonalDataDto;
import com.dentalhelp.patient.exception.ResourceNotFoundException;
import com.dentalhelp.patient.model.GeneralAnamnesis;
import com.dentalhelp.patient.model.PatientPersonalData;
import com.dentalhelp.patient.repository.GeneralAnamnesisRepository;
import com.dentalhelp.patient.repository.PatientPersonalDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientPersonalDataRepository personalDataRepository;

    @Mock
    private GeneralAnamnesisRepository anamnesisRepository;

    @InjectMocks
    private PatientService patientService;

    private PatientPersonalData testPersonalData;
    private PatientPersonalDataDto testPersonalDataDto;
    private GeneralAnamnesis testAnamnesis;
    private GeneralAnamnesisDto testAnamnesisDto;

    @BeforeEach
    void setUp() {
        // Setup test personal data
        testPersonalData = PatientPersonalData.builder()
                .idPersonalData(1L)
                .patientCnp("1234567890123")
                .addressStreet("Test Street")
                .addressNumber("123")
                .addressCountry("Romania")
                .addressRegion("Bucharest")
                .phoneNumber("0700123456")
                .sex("M")
                .build();

        testPersonalDataDto = PatientPersonalDataDto.builder()
                .patientCnp("1234567890123")
                .addressStreet("Test Street")
                .addressNumber("123")
                .addressCountry("Romania")
                .addressRegion("Bucharest")
                .phoneNumber("0700123456")
                .sex("M")
                .build();

        // Setup test anamnesis
        testAnamnesis = GeneralAnamnesis.builder()
                .idGeneralAnamnesis(1L)
                .patientCnp("1234567890123")
                .allergies("None")
                .alcoholConsumer("No")
                .smoker("No")
                .coagulationProblems("No")
                .medicalIntolerance("None")
                .previousDentalProblems("None")
                .build();

        testAnamnesisDto = GeneralAnamnesisDto.builder()
                .patientCnp("1234567890123")
                .allergies("None")
                .alcoholConsumer("No")
                .smoker("No")
                .coagulationProblems("No")
                .medicalIntolerance("None")
                .previousDentalProblems("None")
                .build();
    }

    // Personal Data Tests

    @Test
    void testGetPersonalDataByCnp_Success() {
        // Arrange
        when(personalDataRepository.findByPatientCnp(anyString())).thenReturn(Optional.of(testPersonalData));

        // Act
        PatientPersonalDataDto result = patientService.getPersonalDataByCnp("1234567890123");

        // Assert
        assertNotNull(result);
        assertEquals("1234567890123", result.getPatientCnp());
        assertEquals("Test Street", result.getAddressStreet());
        verify(personalDataRepository).findByPatientCnp("1234567890123");
    }

    @Test
    void testGetPersonalDataByCnp_NotFound() {
        // Arrange
        when(personalDataRepository.findByPatientCnp(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> patientService.getPersonalDataByCnp("9999999999999"));
        verify(personalDataRepository).findByPatientCnp("9999999999999");
    }

    @Test
    void testGetAllPatients_Success() {
        // Arrange
        PatientPersonalData data2 = PatientPersonalData.builder()
                .idPersonalData(2L)
                .patientCnp("9876543210987")
                .addressStreet("Another Street")
                .build();
        when(personalDataRepository.findAll()).thenReturn(Arrays.asList(testPersonalData, data2));

        // Act
        List<PatientPersonalDataDto> result = patientService.getAllPatients();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(personalDataRepository).findAll();
    }

    @Test
    void testAddPersonalData_Success() {
        // Arrange
        when(personalDataRepository.save(any(PatientPersonalData.class))).thenReturn(testPersonalData);

        // Act
        patientService.addPersonalData(testPersonalDataDto);

        // Assert
        verify(personalDataRepository).save(any(PatientPersonalData.class));
    }

    @Test
    void testUpdatePersonalData_Success() {
        // Arrange
        when(personalDataRepository.findByPatientCnp(anyString())).thenReturn(Optional.of(testPersonalData));
        when(personalDataRepository.save(any(PatientPersonalData.class))).thenReturn(testPersonalData);

        // Act
        patientService.updatePersonalData(testPersonalDataDto);

        // Assert
        verify(personalDataRepository).findByPatientCnp(testPersonalDataDto.getPatientCnp());
        verify(personalDataRepository).save(any(PatientPersonalData.class));
    }

    @Test
    void testUpdatePersonalData_NotFound() {
        // Arrange
        when(personalDataRepository.findByPatientCnp(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> patientService.updatePersonalData(testPersonalDataDto));
        verify(personalDataRepository).findByPatientCnp(testPersonalDataDto.getPatientCnp());
        verify(personalDataRepository, never()).save(any(PatientPersonalData.class));
    }

    @Test
    void testDeletePersonalData_Success() {
        // Act
        patientService.deletePersonalData("1234567890123");

        // Assert
        verify(personalDataRepository).deleteByPatientCnp("1234567890123");
    }

    // General Anamnesis Tests

    @Test
    void testGetAnamnesiByCnp_Success() {
        // Arrange
        when(anamnesisRepository.findByPatientCnp(anyString())).thenReturn(Optional.of(testAnamnesis));

        // Act
        GeneralAnamnesisDto result = patientService.getAnamnesiByCnp("1234567890123");

        // Assert
        assertNotNull(result);
        assertEquals("1234567890123", result.getPatientCnp());
        assertEquals("None", result.getAllergies());
        verify(anamnesisRepository).findByPatientCnp("1234567890123");
    }

    @Test
    void testGetAnamnesiByCnp_NotFound() {
        // Arrange
        when(anamnesisRepository.findByPatientCnp(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> patientService.getAnamnesiByCnp("9999999999999"));
        verify(anamnesisRepository).findByPatientCnp("9999999999999");
    }

    @Test
    void testAddGeneralAnamnesis_Success() {
        // Arrange
        when(anamnesisRepository.save(any(GeneralAnamnesis.class))).thenReturn(testAnamnesis);

        // Act
        patientService.addGeneralAnamnesis(testAnamnesisDto);

        // Assert
        verify(anamnesisRepository).save(any(GeneralAnamnesis.class));
    }

    @Test
    void testUpdateGeneralAnamnesis_Success() {
        // Arrange
        when(anamnesisRepository.findByPatientCnp(anyString())).thenReturn(Optional.of(testAnamnesis));
        when(anamnesisRepository.save(any(GeneralAnamnesis.class))).thenReturn(testAnamnesis);

        // Act
        patientService.updateGeneralAnamnesis(testAnamnesisDto);

        // Assert
        verify(anamnesisRepository).findByPatientCnp(testAnamnesisDto.getPatientCnp());
        verify(anamnesisRepository).save(any(GeneralAnamnesis.class));
    }

    @Test
    void testUpdateGeneralAnamnesis_NotFound() {
        // Arrange
        when(anamnesisRepository.findByPatientCnp(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> patientService.updateGeneralAnamnesis(testAnamnesisDto));
        verify(anamnesisRepository).findByPatientCnp(testAnamnesisDto.getPatientCnp());
        verify(anamnesisRepository, never()).save(any(GeneralAnamnesis.class));
    }

    @Test
    void testDeleteAnamnesis_Success() {
        // Act
        patientService.deleteAnamnesis("1234567890123");

        // Assert
        verify(anamnesisRepository).deleteByPatientCnp("1234567890123");
    }
}
