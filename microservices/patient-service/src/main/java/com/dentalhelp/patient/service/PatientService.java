package com.dentalhelp.patient.service;

import com.dentalhelp.patient.dto.GeneralAnamnesisDto;
import com.dentalhelp.patient.dto.PatientPersonalDataDto;
import com.dentalhelp.patient.exception.ResourceNotFoundException;
import com.dentalhelp.patient.model.GeneralAnamnesis;
import com.dentalhelp.patient.model.PatientPersonalData;
import com.dentalhelp.patient.repository.GeneralAnamnesisRepository;
import com.dentalhelp.patient.repository.PatientPersonalDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientPersonalDataRepository personalDataRepository;
    private final GeneralAnamnesisRepository anamnesisRepository;

    // Patient Personal Data Operations

    public PatientPersonalDataDto getPersonalDataByCnp(String cnp) {
        PatientPersonalData data = personalDataRepository.findByPatientCnp(cnp)
                .orElseThrow(() -> new ResourceNotFoundException("Personal data not found for CNP: " + cnp));
        return convertToPersonalDataDto(data);
    }

    public List<PatientPersonalDataDto> getAllPatients() {
        return personalDataRepository.findAll().stream()
                .map(this::convertToPersonalDataDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addPersonalData(PatientPersonalDataDto dto) {
        PatientPersonalData data = PatientPersonalData.builder()
                .patientCnp(dto.getPatientCnp())
                .addressStreet(dto.getAddressStreet())
                .addressNumber(dto.getAddressNumber())
                .addressCountry(dto.getAddressCountry())
                .addressRegion(dto.getAddressRegion())
                .phoneNumber(dto.getPhoneNumber())
                .sex(dto.getSex())
                .build();
        personalDataRepository.save(data);
    }

    @Transactional
    public void updatePersonalData(PatientPersonalDataDto dto) {
        PatientPersonalData data = personalDataRepository.findByPatientCnp(dto.getPatientCnp())
                .orElseThrow(() -> new ResourceNotFoundException("Personal data not found"));

        data.setAddressStreet(dto.getAddressStreet());
        data.setAddressNumber(dto.getAddressNumber());
        data.setAddressCountry(dto.getAddressCountry());
        data.setAddressRegion(dto.getAddressRegion());
        data.setPhoneNumber(dto.getPhoneNumber());
        data.setSex(dto.getSex());

        personalDataRepository.save(data);
    }

    @Transactional
    public void deletePersonalData(String cnp) {
        personalDataRepository.deleteByPatientCnp(cnp);
    }

    // General Anamnesis Operations

    public GeneralAnamnesisDto getAnamnesiByCnp(String cnp) {
        GeneralAnamnesis anamnesis = anamnesisRepository.findByPatientCnp(cnp)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnesis not found for CNP: " + cnp));
        return convertToAnamnesisDto(anamnesis);
    }

    @Transactional
    public void addGeneralAnamnesis(GeneralAnamnesisDto dto) {
        GeneralAnamnesis anamnesis = GeneralAnamnesis.builder()
                .patientCnp(dto.getPatientCnp())
                .allergies(dto.getAllergies())
                .alcoholConsumer(dto.getAlcoholConsumer())
                .smoker(dto.getSmoker())
                .coagulationProblems(dto.getCoagulationProblems())
                .medicalIntolerance(dto.getMedicalIntolerance())
                .previousDentalProblems(dto.getPreviousDentalProblems())
                .build();
        anamnesisRepository.save(anamnesis);
    }

    @Transactional
    public void updateGeneralAnamnesis(GeneralAnamnesisDto dto) {
        GeneralAnamnesis anamnesis = anamnesisRepository.findByPatientCnp(dto.getPatientCnp())
                .orElseThrow(() -> new ResourceNotFoundException("Anamnesis not found"));

        anamnesis.setAllergies(dto.getAllergies());
        anamnesis.setAlcoholConsumer(dto.getAlcoholConsumer());
        anamnesis.setSmoker(dto.getSmoker());
        anamnesis.setCoagulationProblems(dto.getCoagulationProblems());
        anamnesis.setMedicalIntolerance(dto.getMedicalIntolerance());
        anamnesis.setPreviousDentalProblems(dto.getPreviousDentalProblems());

        anamnesisRepository.save(anamnesis);
    }

    @Transactional
    public void deleteAnamnesis(String cnp) {
        anamnesisRepository.deleteByPatientCnp(cnp);
    }

    // Converter Methods

    private PatientPersonalDataDto convertToPersonalDataDto(PatientPersonalData data) {
        return PatientPersonalDataDto.builder()
                .idPersonalData(data.getIdPersonalData())
                .patientCnp(data.getPatientCnp())
                .addressStreet(data.getAddressStreet())
                .addressNumber(data.getAddressNumber())
                .addressCountry(data.getAddressCountry())
                .addressRegion(data.getAddressRegion())
                .phoneNumber(data.getPhoneNumber())
                .sex(data.getSex())
                .build();
    }

    private GeneralAnamnesisDto convertToAnamnesisDto(GeneralAnamnesis anamnesis) {
        return GeneralAnamnesisDto.builder()
                .idGeneralAnamnesis(anamnesis.getIdGeneralAnamnesis())
                .patientCnp(anamnesis.getPatientCnp())
                .allergies(anamnesis.getAllergies())
                .alcoholConsumer(anamnesis.getAlcoholConsumer())
                .smoker(anamnesis.getSmoker())
                .coagulationProblems(anamnesis.getCoagulationProblems())
                .medicalIntolerance(anamnesis.getMedicalIntolerance())
                .previousDentalProblems(anamnesis.getPreviousDentalProblems())
                .build();
    }
}
