package com.dentalhelp.xray.service;

import com.dentalhelp.xray.dto.XRayDto;
import com.dentalhelp.xray.exception.ResourceNotFoundException;
import com.dentalhelp.xray.model.XRay;
import com.dentalhelp.xray.repository.XRayRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class XrayServiceTest {

    @Mock
    private XRayRepository xrayRepository;

    @Mock
    private AzureBlobStorageService azureBlobStorageService;

    @Mock
    private MultipartFile mockFile;

    @InjectMocks
    private XRayService xrayService;

    private XRay testXRay;
    private String patientCnp = "1234567890123";
    private String filePath = "https://storage.azure.com/xrays/test-xray.jpg";

    @BeforeEach
    void setUp() {
        testXRay = XRay.builder()
                .xrayId(1L)
                .patientCnp(patientCnp)
                .date("2024-01-15")
                .filePath(filePath)
                .observations("Normal dental x-ray")
                .build();
    }

    @Test
    void testGetPatientXRays_Success() {
        // Arrange
        when(xrayRepository.findByPatientCnp(patientCnp))
                .thenReturn(Arrays.asList(testXRay));

        // Act
        List<XRayDto> result = xrayService.getPatientXRays(patientCnp);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testXRay.getXrayId(), result.get(0).getXrayId());
        assertEquals(testXRay.getPatientCnp(), result.get(0).getPatientCnp());
        assertEquals(testXRay.getFilePath(), result.get(0).getFilePath());
        assertEquals(testXRay.getObservations(), result.get(0).getObservations());
        verify(xrayRepository).findByPatientCnp(patientCnp);
    }

    @Test
    void testGetPatientXRays_EmptyList() {
        // Arrange
        when(xrayRepository.findByPatientCnp(patientCnp))
                .thenReturn(Arrays.asList());

        // Act
        List<XRayDto> result = xrayService.getPatientXRays(patientCnp);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(xrayRepository).findByPatientCnp(patientCnp);
    }

    @Test
    void testSaveXRay_Success() throws IOException {
        // Arrange
        String date = "2024-01-15";
        String observations = "Normal dental x-ray";

        when(azureBlobStorageService.uploadFile(mockFile)).thenReturn(filePath);
        when(xrayRepository.save(any(XRay.class))).thenReturn(testXRay);

        // Act
        XRayDto result = xrayService.saveXRay(patientCnp, date, observations, mockFile);

        // Assert
        assertNotNull(result);
        assertEquals(testXRay.getXrayId(), result.getXrayId());
        assertEquals(testXRay.getPatientCnp(), result.getPatientCnp());
        assertEquals(testXRay.getFilePath(), result.getFilePath());
        verify(azureBlobStorageService).uploadFile(mockFile);
        verify(xrayRepository).save(any(XRay.class));
    }

    @Test
    void testSaveXRay_UploadFailure() throws IOException {
        // Arrange
        String date = "2024-01-15";
        String observations = "Normal dental x-ray";

        when(azureBlobStorageService.uploadFile(mockFile))
                .thenThrow(new IOException("Upload failed"));

        // Act & Assert
        assertThrows(IOException.class, () ->
            xrayService.saveXRay(patientCnp, date, observations, mockFile));
        verify(azureBlobStorageService).uploadFile(mockFile);
        verify(xrayRepository, never()).save(any(XRay.class));
    }

    @Test
    void testUpdateXRay_Success() {
        // Arrange
        Long xrayId = 1L;
        String newDate = "2024-02-20";
        String newObservations = "Updated observations";

        when(xrayRepository.findByXrayId(xrayId))
                .thenReturn(Optional.of(testXRay));
        when(xrayRepository.save(any(XRay.class)))
                .thenReturn(testXRay);

        // Act
        xrayService.updateXRay(xrayId, newDate, newObservations);

        // Assert
        verify(xrayRepository).findByXrayId(xrayId);
        verify(xrayRepository).save(testXRay);
        assertEquals(newDate, testXRay.getDate());
        assertEquals(newObservations, testXRay.getObservations());
    }

    @Test
    void testUpdateXRay_NotFound() {
        // Arrange
        Long xrayId = 999L;
        String newDate = "2024-02-20";
        String newObservations = "Updated observations";

        when(xrayRepository.findByXrayId(xrayId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            xrayService.updateXRay(xrayId, newDate, newObservations));
        verify(xrayRepository).findByXrayId(xrayId);
        verify(xrayRepository, never()).save(any());
    }

    @Test
    void testDeleteXRay_Success() {
        // Arrange
        Long xrayId = 1L;

        when(xrayRepository.findByXrayId(xrayId))
                .thenReturn(Optional.of(testXRay));
        doNothing().when(azureBlobStorageService).deleteFile(filePath);

        // Act
        xrayService.deleteXRay(xrayId);

        // Assert
        verify(xrayRepository).findByXrayId(xrayId);
        verify(azureBlobStorageService).deleteFile(filePath);
        verify(xrayRepository).delete(testXRay);
    }

    @Test
    void testDeleteXRay_NotFound() {
        // Arrange
        Long xrayId = 999L;

        when(xrayRepository.findByXrayId(xrayId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            xrayService.deleteXRay(xrayId));
        verify(xrayRepository).findByXrayId(xrayId);
        verify(azureBlobStorageService, never()).deleteFile(anyString());
        verify(xrayRepository, never()).delete(any());
    }

    @Test
    void testConvertToDto() {
        // Arrange
        when(xrayRepository.findByPatientCnp(patientCnp))
                .thenReturn(Arrays.asList(testXRay));

        // Act
        List<XRayDto> result = xrayService.getPatientXRays(patientCnp);

        // Assert - verify DTO conversion is correct
        XRayDto dto = result.get(0);
        assertEquals(testXRay.getXrayId(), dto.getXrayId());
        assertEquals(testXRay.getPatientCnp(), dto.getPatientCnp());
        assertEquals(testXRay.getDate(), dto.getDate());
        assertEquals(testXRay.getFilePath(), dto.getFilePath());
        assertEquals(testXRay.getObservations(), dto.getObservations());
    }
}
