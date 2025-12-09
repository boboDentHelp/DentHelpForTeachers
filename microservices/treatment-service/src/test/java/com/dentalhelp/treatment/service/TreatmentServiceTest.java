package com.dentalhelp.treatment.service;

import com.dentalhelp.treatment.dto.MedicalReportDto;
import com.dentalhelp.treatment.dto.TreatmentSheetDto;
import com.dentalhelp.treatment.exception.ResourceNotFoundException;
import com.dentalhelp.treatment.model.MedicalReport;
import com.dentalhelp.treatment.model.TreatmentSheet;
import com.dentalhelp.treatment.repository.MedicalReportRepository;
import com.dentalhelp.treatment.repository.TreatmentSheetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TreatmentServiceTest {

    @Mock
    private TreatmentSheetRepository treatmentSheetRepository;

    @Mock
    private MedicalReportRepository medicalReportRepository;

    @InjectMocks
    private TreatmentService treatmentService;

    private TreatmentSheet testTreatmentSheet;
    private TreatmentSheetDto testTreatmentSheetDto;
    private MedicalReport testMedicalReport;
    private MedicalReportDto testMedicalReportDto;

    @BeforeEach
    void setUp() {
        testTreatmentSheet = TreatmentSheet.builder()
                .treatmentNumber(1L)
                .appointmentId(100L)
                .appointmentObservations("Patient shows improvement")
                .recommendations("Continue treatment")
                .medication("Ibuprofen 400mg")
                .build();

        testTreatmentSheetDto = TreatmentSheetDto.builder()
                .treatmentNumber(1L)
                .appointmentId(100L)
                .appointmentObservations("Patient shows improvement")
                .recommendations("Continue treatment")
                .medication("Ibuprofen 400mg")
                .build();

        testMedicalReport = MedicalReport.builder()
                .id(1L)
                .appointmentId(100L)
                .treatmentDetails("Root canal treatment completed")
                .medication("Amoxicillin 500mg")
                .date("2024-01-15")
                .hour("14:30")
                .build();

        testMedicalReportDto = MedicalReportDto.builder()
                .id(1L)
                .appointmentId(100L)
                .treatmentDetails("Root canal treatment completed")
                .medication("Amoxicillin 500mg")
                .date("2024-01-15")
                .hour("14:30")
                .build();
    }

    // Treatment Sheet Tests

    @Test
    void testGetTreatmentSheetByAppointmentId_Success() {
        // Arrange
        when(treatmentSheetRepository.findByAppointmentId(100L))
                .thenReturn(Optional.of(testTreatmentSheet));

        // Act
        TreatmentSheetDto result = treatmentService.getTreatmentSheetByAppointmentId(100L);

        // Assert
        assertNotNull(result);
        assertEquals(testTreatmentSheet.getTreatmentNumber(), result.getTreatmentNumber());
        assertEquals(testTreatmentSheet.getAppointmentId(), result.getAppointmentId());
        assertEquals(testTreatmentSheet.getAppointmentObservations(), result.getAppointmentObservations());
        assertEquals(testTreatmentSheet.getRecommendations(), result.getRecommendations());
        assertEquals(testTreatmentSheet.getMedication(), result.getMedication());
        verify(treatmentSheetRepository).findByAppointmentId(100L);
    }

    @Test
    void testGetTreatmentSheetByAppointmentId_NotFound() {
        // Arrange
        when(treatmentSheetRepository.findByAppointmentId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.getTreatmentSheetByAppointmentId(999L));
        verify(treatmentSheetRepository).findByAppointmentId(999L);
    }

    @Test
    void testSaveTreatmentSheet_Success() {
        // Arrange
        when(treatmentSheetRepository.save(any(TreatmentSheet.class)))
                .thenReturn(testTreatmentSheet);

        // Act
        treatmentService.saveTreatmentSheet(testTreatmentSheetDto);

        // Assert
        verify(treatmentSheetRepository).save(any(TreatmentSheet.class));
    }

    @Test
    void testUpdateTreatmentSheet_Success() {
        // Arrange
        when(treatmentSheetRepository.findByTreatmentNumber(1L))
                .thenReturn(Optional.of(testTreatmentSheet));
        when(treatmentSheetRepository.save(any(TreatmentSheet.class)))
                .thenReturn(testTreatmentSheet);

        testTreatmentSheetDto.setAppointmentObservations("Updated observations");
        testTreatmentSheetDto.setRecommendations("Updated recommendations");
        testTreatmentSheetDto.setMedication("Updated medication");

        // Act
        treatmentService.updateTreatmentSheet(testTreatmentSheetDto);

        // Assert
        verify(treatmentSheetRepository).findByTreatmentNumber(1L);
        verify(treatmentSheetRepository).save(testTreatmentSheet);
        assertEquals("Updated observations", testTreatmentSheet.getAppointmentObservations());
        assertEquals("Updated recommendations", testTreatmentSheet.getRecommendations());
        assertEquals("Updated medication", testTreatmentSheet.getMedication());
    }

    @Test
    void testUpdateTreatmentSheet_NotFound() {
        // Arrange
        when(treatmentSheetRepository.findByTreatmentNumber(999L))
                .thenReturn(Optional.empty());
        testTreatmentSheetDto.setTreatmentNumber(999L);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.updateTreatmentSheet(testTreatmentSheetDto));
        verify(treatmentSheetRepository).findByTreatmentNumber(999L);
        verify(treatmentSheetRepository, never()).save(any());
    }

    @Test
    void testDeleteTreatmentSheet_Success() {
        // Arrange
        when(treatmentSheetRepository.findByTreatmentNumber(1L))
                .thenReturn(Optional.of(testTreatmentSheet));

        // Act
        treatmentService.deleteTreatmentSheet(1L);

        // Assert
        verify(treatmentSheetRepository).findByTreatmentNumber(1L);
        verify(treatmentSheetRepository).delete(testTreatmentSheet);
    }

    @Test
    void testDeleteTreatmentSheet_NotFound() {
        // Arrange
        when(treatmentSheetRepository.findByTreatmentNumber(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.deleteTreatmentSheet(999L));
        verify(treatmentSheetRepository).findByTreatmentNumber(999L);
        verify(treatmentSheetRepository, never()).delete(any());
    }

    // Medical Report Tests

    @Test
    void testGetMedicalReportByAppointmentId_Success() {
        // Arrange
        when(medicalReportRepository.findByAppointmentId(100L))
                .thenReturn(Optional.of(testMedicalReport));

        // Act
        MedicalReportDto result = treatmentService.getMedicalReportByAppointmentId(100L);

        // Assert
        assertNotNull(result);
        assertEquals(testMedicalReport.getId(), result.getId());
        assertEquals(testMedicalReport.getAppointmentId(), result.getAppointmentId());
        assertEquals(testMedicalReport.getTreatmentDetails(), result.getTreatmentDetails());
        assertEquals(testMedicalReport.getMedication(), result.getMedication());
        assertEquals(testMedicalReport.getDate(), result.getDate());
        assertEquals(testMedicalReport.getHour(), result.getHour());
        verify(medicalReportRepository).findByAppointmentId(100L);
    }

    @Test
    void testGetMedicalReportByAppointmentId_NotFound() {
        // Arrange
        when(medicalReportRepository.findByAppointmentId(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.getMedicalReportByAppointmentId(999L));
        verify(medicalReportRepository).findByAppointmentId(999L);
    }

    @Test
    void testSaveMedicalReport_Success() {
        // Arrange
        when(medicalReportRepository.save(any(MedicalReport.class)))
                .thenReturn(testMedicalReport);

        // Act
        treatmentService.saveMedicalReport(testMedicalReportDto);

        // Assert
        verify(medicalReportRepository).save(any(MedicalReport.class));
    }

    @Test
    void testUpdateMedicalReport_Success() {
        // Arrange
        when(medicalReportRepository.findById(1L))
                .thenReturn(Optional.of(testMedicalReport));
        when(medicalReportRepository.save(any(MedicalReport.class)))
                .thenReturn(testMedicalReport);

        testMedicalReportDto.setTreatmentDetails("Updated treatment details");
        testMedicalReportDto.setMedication("Updated medication");
        testMedicalReportDto.setDate("2024-02-20");
        testMedicalReportDto.setHour("15:00");

        // Act
        treatmentService.updateMedicalReport(testMedicalReportDto);

        // Assert
        verify(medicalReportRepository).findById(1L);
        verify(medicalReportRepository).save(testMedicalReport);
        assertEquals("Updated treatment details", testMedicalReport.getTreatmentDetails());
        assertEquals("Updated medication", testMedicalReport.getMedication());
        assertEquals("2024-02-20", testMedicalReport.getDate());
        assertEquals("15:00", testMedicalReport.getHour());
    }

    @Test
    void testUpdateMedicalReport_NotFound() {
        // Arrange
        when(medicalReportRepository.findById(999L))
                .thenReturn(Optional.empty());
        testMedicalReportDto.setId(999L);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.updateMedicalReport(testMedicalReportDto));
        verify(medicalReportRepository).findById(999L);
        verify(medicalReportRepository, never()).save(any());
    }

    @Test
    void testDeleteMedicalReport_Success() {
        // Arrange
        when(medicalReportRepository.findById(1L))
                .thenReturn(Optional.of(testMedicalReport));

        // Act
        treatmentService.deleteMedicalReport(1L);

        // Assert
        verify(medicalReportRepository).findById(1L);
        verify(medicalReportRepository).delete(testMedicalReport);
    }

    @Test
    void testDeleteMedicalReport_NotFound() {
        // Arrange
        when(medicalReportRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            treatmentService.deleteMedicalReport(999L));
        verify(medicalReportRepository).findById(999L);
        verify(medicalReportRepository, never()).delete(any());
    }
}
