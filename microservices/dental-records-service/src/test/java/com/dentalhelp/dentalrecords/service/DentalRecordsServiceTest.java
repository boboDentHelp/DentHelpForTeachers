package com.dentalhelp.dentalrecords.service;

import com.dentalhelp.dentalrecords.dto.ToothInterventionDto;
import com.dentalhelp.dentalrecords.dto.ToothProblemDto;
import com.dentalhelp.dentalrecords.exception.ResourceNotFoundException;
import com.dentalhelp.dentalrecords.model.ToothIntervention;
import com.dentalhelp.dentalrecords.model.ToothProblem;
import com.dentalhelp.dentalrecords.repository.ToothInterventionRepository;
import com.dentalhelp.dentalrecords.repository.ToothProblemRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DentalRecordsServiceTest {

    @Mock
    private ToothInterventionRepository toothInterventionRepository;

    @Mock
    private ToothProblemRepository toothProblemRepository;

    @InjectMocks
    private DentalRecordsService dentalRecordsService;

    private ToothIntervention testIntervention;
    private ToothInterventionDto testInterventionDto;
    private ToothProblem testProblem;
    private ToothProblemDto testProblemDto;
    private String patientCnp = "1234567890123";
    private int toothNumber = 15;

    @BeforeEach
    void setUp() {
        testIntervention = ToothIntervention.builder()
                .interventionId(1L)
                .patientCnp(patientCnp)
                .toothNumber(toothNumber)
                .dateIntervention("2024-01-15")
                .interventionDetails("Root canal")
                .isExtracted("false")
                .build();

        testInterventionDto = new ToothInterventionDto();
        testInterventionDto.setInterventionId(1L);
        testInterventionDto.setPatientCnp(patientCnp);
        testInterventionDto.setToothNumber(toothNumber);
        testInterventionDto.setDateIntervention("2024-01-15");
        testInterventionDto.setInterventionDetails("Root canal");
        testInterventionDto.setIsExtracted("false");

        testProblem = ToothProblem.builder()
                .problemId(1L)
                .patientCnp(patientCnp)
                .toothNumber(toothNumber)
                .dateProblem("2024-01-10")
                .problemDetails("Cavity detected")
                .build();

        testProblemDto = new ToothProblemDto();
        testProblemDto.setProblemId(1L);
        testProblemDto.setPatientCnp(patientCnp);
        testProblemDto.setToothNumber(toothNumber);
        testProblemDto.setDateProblem("2024-01-10");
        testProblemDto.setProblemDetails("Cavity detected");
    }

    // Tooth Intervention Tests

    @Test
    void testGetAllPatientToothIntervention_Success() {
        // Arrange
        when(toothInterventionRepository.findByPatientCnpAndToothNumber(patientCnp, toothNumber))
                .thenReturn(Arrays.asList(testIntervention));

        // Act
        List<ToothInterventionDto> result = dentalRecordsService.getAllPatientToothIntervention(patientCnp, toothNumber);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testIntervention.getInterventionId(), result.get(0).getInterventionId());
        assertEquals(testIntervention.getInterventionDetails(), result.get(0).getInterventionDetails());
        verify(toothInterventionRepository).findByPatientCnpAndToothNumber(patientCnp, toothNumber);
    }

    @Test
    void testGetAllPatientToothIntervention_FilterExtracted() {
        // Arrange
        ToothIntervention extractedIntervention = ToothIntervention.builder()
                .interventionId(2L)
                .patientCnp(patientCnp)
                .toothNumber(toothNumber)
                .dateIntervention("2024-01-20")
                .interventionDetails("Extraction")
                .isExtracted("true")
                .build();

        when(toothInterventionRepository.findByPatientCnpAndToothNumber(patientCnp, toothNumber))
                .thenReturn(Arrays.asList(testIntervention, extractedIntervention));

        // Act
        List<ToothInterventionDto> result = dentalRecordsService.getAllPatientToothIntervention(patientCnp, toothNumber);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size()); // Only non-extracted
        assertEquals(testIntervention.getInterventionId(), result.get(0).getInterventionId());
    }

    @Test
    void testGetAllPatientToothInterventions_Success() {
        // Arrange
        when(toothInterventionRepository.findByPatientCnp(patientCnp))
                .thenReturn(Arrays.asList(testIntervention));

        // Act
        List<ToothInterventionDto> result = dentalRecordsService.getAllPatientToothInterventions(patientCnp);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testIntervention.getInterventionId(), result.get(0).getInterventionId());
        verify(toothInterventionRepository).findByPatientCnp(patientCnp);
    }

    @Test
    void testGetPatientAllExtractedTooth_Success() {
        // Arrange
        ToothIntervention extractedIntervention = ToothIntervention.builder()
                .interventionId(2L)
                .patientCnp(patientCnp)
                .toothNumber(toothNumber)
                .dateIntervention("2024-01-20")
                .interventionDetails("Extraction")
                .isExtracted("true")
                .build();

        when(toothInterventionRepository.findByPatientCnpAndIsExtracted(patientCnp, "true"))
                .thenReturn(Arrays.asList(extractedIntervention));

        // Act
        List<ToothInterventionDto> result = dentalRecordsService.getPatientAllExtractedTooth(patientCnp);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("true", result.get(0).getIsExtracted());
        verify(toothInterventionRepository).findByPatientCnpAndIsExtracted(patientCnp, "true");
    }

    @Test
    void testAddNewIntervention_Success() {
        // Arrange
        when(toothInterventionRepository.save(any(ToothIntervention.class))).thenReturn(testIntervention);

        // Act
        dentalRecordsService.addNewIntervention(testInterventionDto);

        // Assert
        verify(toothInterventionRepository).save(any(ToothIntervention.class));
    }

    @Test
    void testDeleteIntervention_Success() {
        // Arrange
        when(toothInterventionRepository.findByInterventionId(1L))
                .thenReturn(Optional.of(testIntervention));

        // Act
        dentalRecordsService.deleteIntervention(1L);

        // Assert
        verify(toothInterventionRepository).findByInterventionId(1L);
        verify(toothInterventionRepository).delete(testIntervention);
    }

    @Test
    void testDeleteIntervention_NotFound() {
        // Arrange
        when(toothInterventionRepository.findByInterventionId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            dentalRecordsService.deleteIntervention(999L));
        verify(toothInterventionRepository).findByInterventionId(999L);
        verify(toothInterventionRepository, never()).delete(any());
    }

    @Test
    void testUpdateIntervention_Success() {
        // Arrange
        when(toothInterventionRepository.findByInterventionId(1L))
                .thenReturn(Optional.of(testIntervention));
        when(toothInterventionRepository.save(any(ToothIntervention.class)))
                .thenReturn(testIntervention);

        testInterventionDto.setInterventionDetails("Updated details");

        // Act
        dentalRecordsService.updateIntervention(testInterventionDto);

        // Assert
        verify(toothInterventionRepository).findByInterventionId(1L);
        verify(toothInterventionRepository).save(testIntervention);
        assertEquals("Updated details", testIntervention.getInterventionDetails());
    }

    @Test
    void testUpdateIntervention_NotFound() {
        // Arrange
        when(toothInterventionRepository.findByInterventionId(999L))
                .thenReturn(Optional.empty());
        testInterventionDto.setInterventionId(999L);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            dentalRecordsService.updateIntervention(testInterventionDto));
        verify(toothInterventionRepository).findByInterventionId(999L);
        verify(toothInterventionRepository, never()).save(any());
    }

    @Test
    void testDeleteTeethExtraction_Success() {
        // Act
        dentalRecordsService.deleteTeethExtraction(patientCnp, toothNumber);

        // Assert
        verify(toothInterventionRepository).deleteByPatientCnpAndToothNumber(patientCnp, toothNumber);
    }

    // Tooth Problem Tests

    @Test
    void testGetPatientToothProblems_Success() {
        // Arrange
        when(toothProblemRepository.findByPatientCnpAndToothNumber(patientCnp, toothNumber))
                .thenReturn(Arrays.asList(testProblem));

        // Act
        List<ToothProblemDto> result = dentalRecordsService.getPatientToothProblems(patientCnp, toothNumber);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProblem.getProblemId(), result.get(0).getProblemId());
        assertEquals(testProblem.getProblemDetails(), result.get(0).getProblemDetails());
        verify(toothProblemRepository).findByPatientCnpAndToothNumber(patientCnp, toothNumber);
    }

    @Test
    void testGetPatientAllToothProblems_Success() {
        // Arrange
        when(toothProblemRepository.findByPatientCnp(patientCnp))
                .thenReturn(Arrays.asList(testProblem));

        // Act
        List<ToothProblemDto> result = dentalRecordsService.getPatientAllToothProblems(patientCnp);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProblem.getProblemId(), result.get(0).getProblemId());
        verify(toothProblemRepository).findByPatientCnp(patientCnp);
    }

    @Test
    void testAddNewProblem_Success() {
        // Arrange
        when(toothProblemRepository.save(any(ToothProblem.class))).thenReturn(testProblem);

        // Act
        dentalRecordsService.addNewProblem(testProblemDto);

        // Assert
        verify(toothProblemRepository).save(any(ToothProblem.class));
    }

    @Test
    void testDeleteProblem_Success() {
        // Arrange
        when(toothProblemRepository.findByProblemId(1L))
                .thenReturn(Optional.of(testProblem));

        // Act
        dentalRecordsService.deleteProblem(1L);

        // Assert
        verify(toothProblemRepository).findByProblemId(1L);
        verify(toothProblemRepository).delete(testProblem);
    }

    @Test
    void testDeleteProblem_NotFound() {
        // Arrange
        when(toothProblemRepository.findByProblemId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            dentalRecordsService.deleteProblem(999L));
        verify(toothProblemRepository).findByProblemId(999L);
        verify(toothProblemRepository, never()).delete(any());
    }

    @Test
    void testUpdateProblem_Success() {
        // Arrange
        when(toothProblemRepository.findByProblemId(1L))
                .thenReturn(Optional.of(testProblem));
        when(toothProblemRepository.save(any(ToothProblem.class)))
                .thenReturn(testProblem);

        testProblemDto.setProblemDetails("Updated problem details");

        // Act
        dentalRecordsService.updateProblem(testProblemDto);

        // Assert
        verify(toothProblemRepository).findByProblemId(1L);
        verify(toothProblemRepository).save(testProblem);
        assertEquals("Updated problem details", testProblem.getProblemDetails());
    }

    @Test
    void testUpdateProblem_NotFound() {
        // Arrange
        when(toothProblemRepository.findByProblemId(999L))
                .thenReturn(Optional.empty());
        testProblemDto.setProblemId(999L);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            dentalRecordsService.updateProblem(testProblemDto));
        verify(toothProblemRepository).findByProblemId(999L);
        verify(toothProblemRepository, never()).save(any());
    }
}
