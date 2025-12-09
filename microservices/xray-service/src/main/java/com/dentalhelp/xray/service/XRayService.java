package com.dentalhelp.xray.service;

import com.dentalhelp.xray.dto.XRayDto;
import com.dentalhelp.xray.exception.ResourceNotFoundException;
import com.dentalhelp.xray.model.XRay;
import com.dentalhelp.xray.repository.XRayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XRayService {

    private final XRayRepository xrayRepository;
    private final AzureBlobStorageService azureBlobStorageService;

    public List<XRayDto> getPatientXRays(String patientCnp) {
        List<XRay> xrays = xrayRepository.findByPatientCnp(patientCnp);
        return xrays.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public XRayDto saveXRay(String patientCnp, String date, String observations, MultipartFile file) throws IOException {
        // Upload file to Azure
        String filePath = azureBlobStorageService.uploadFile(file);

        // Save metadata to database
        XRay xray = XRay.builder()
                .patientCnp(patientCnp)
                .date(date)
                .filePath(filePath)
                .observations(observations)
                .build();

        XRay savedXRay = xrayRepository.save(xray);
        return convertToDto(savedXRay);
    }

    @Transactional
    public void updateXRay(Long xrayId, String date, String observations) {
        XRay xray = xrayRepository.findByXrayId(xrayId)
                .orElseThrow(() -> new ResourceNotFoundException("X-Ray not found with id: " + xrayId));

        xray.setDate(date);
        xray.setObservations(observations);

        xrayRepository.save(xray);
    }

    @Transactional
    public void deleteXRay(Long xrayId) {
        XRay xray = xrayRepository.findByXrayId(xrayId)
                .orElseThrow(() -> new ResourceNotFoundException("X-Ray not found with id: " + xrayId));

        // Delete from Azure Blob Storage
        azureBlobStorageService.deleteFile(xray.getFilePath());

        // Delete from database
        xrayRepository.delete(xray);
    }

    private XRayDto convertToDto(XRay xray) {
        return XRayDto.builder()
                .xrayId(xray.getXrayId())
                .patientCnp(xray.getPatientCnp())
                .date(xray.getDate())
                .filePath(xray.getFilePath())
                .observations(xray.getObservations())
                .build();
    }
}
