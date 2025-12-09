package com.dentalhelp.dentalrecords.service;

import com.dentalhelp.dentalrecords.dto.ToothInterventionDto;
import com.dentalhelp.dentalrecords.dto.ToothProblemDto;
import com.dentalhelp.dentalrecords.exception.BadRequestException;
import com.dentalhelp.dentalrecords.exception.ResourceNotFoundException;
import com.dentalhelp.dentalrecords.model.ToothIntervention;
import com.dentalhelp.dentalrecords.model.ToothProblem;
import com.dentalhelp.dentalrecords.repository.ToothInterventionRepository;
import com.dentalhelp.dentalrecords.repository.ToothProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DentalRecordsService {

    private final ToothInterventionRepository toothInterventionRepository;
    private final ToothProblemRepository toothProblemRepository;

    // Tooth Intervention Operations

    public List<ToothInterventionDto> getAllPatientToothIntervention(String patientCnp, int toothNumber) {
        List<ToothIntervention> interventions = toothInterventionRepository
                .findByPatientCnpAndToothNumber(patientCnp, toothNumber);

        List<ToothInterventionDto> dtos = new ArrayList<>();
        for (ToothIntervention intervention : interventions) {
            if (!"true".equals(intervention.getIsExtracted())) {
                ToothInterventionDto dto = new ToothInterventionDto();
                dto.setInterventionId(intervention.getInterventionId());
                dto.setDateIntervention(intervention.getDateIntervention());
                dto.setToothNumber(intervention.getToothNumber());
                dto.setInterventionDetails(intervention.getInterventionDetails());
                dto.setPatientCnp(patientCnp);
                dto.setIsExtracted(intervention.getIsExtracted());
                dtos.add(dto);
            }
        }
        return dtos;
    }

    public List<ToothInterventionDto> getAllPatientToothInterventions(String patientCnp) {
        List<ToothIntervention> interventions = toothInterventionRepository.findByPatientCnp(patientCnp);

        List<ToothInterventionDto> dtos = new ArrayList<>();
        for (ToothIntervention intervention : interventions) {
            if (!"true".equals(intervention.getIsExtracted())) {
                ToothInterventionDto dto = new ToothInterventionDto();
                dto.setInterventionId(intervention.getInterventionId());
                dto.setDateIntervention(intervention.getDateIntervention());
                dto.setToothNumber(intervention.getToothNumber());
                dto.setInterventionDetails(intervention.getInterventionDetails());
                dto.setPatientCnp(patientCnp);
                dto.setIsExtracted(intervention.getIsExtracted());
                dtos.add(dto);
            }
        }
        return dtos;
    }

    public List<ToothInterventionDto> getPatientAllExtractedTooth(String patientCnp) {
        List<ToothIntervention> interventions = toothInterventionRepository
                .findByPatientCnpAndIsExtracted(patientCnp, "true");

        List<ToothInterventionDto> dtos = new ArrayList<>();
        for (ToothIntervention intervention : interventions) {
            ToothInterventionDto dto = new ToothInterventionDto();
            dto.setInterventionId(intervention.getInterventionId());
            dto.setDateIntervention(intervention.getDateIntervention());
            dto.setToothNumber(intervention.getToothNumber());
            dto.setInterventionDetails(intervention.getInterventionDetails());
            dto.setPatientCnp(patientCnp);
            dto.setIsExtracted(intervention.getIsExtracted());
            dtos.add(dto);
        }
        return dtos;
    }

    public void addNewIntervention(ToothInterventionDto dto) {
        ToothIntervention intervention = ToothIntervention.builder()
                .dateIntervention(dto.getDateIntervention())
                .toothNumber(dto.getToothNumber())
                .interventionDetails(dto.getInterventionDetails())
                .isExtracted(dto.getIsExtracted())
                .patientCnp(dto.getPatientCnp())
                .build();

        toothInterventionRepository.save(intervention);
    }

    @Transactional
    public void deleteIntervention(Long interventionId) {
        ToothIntervention intervention = toothInterventionRepository.findByInterventionId(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention not found with id: " + interventionId));

        toothInterventionRepository.delete(intervention);
    }

    @Transactional
    public void updateIntervention(ToothInterventionDto dto) {
        ToothIntervention intervention = toothInterventionRepository.findByInterventionId(dto.getInterventionId())
                .orElseThrow(() -> new ResourceNotFoundException("Intervention not found"));

        intervention.setDateIntervention(dto.getDateIntervention());
        intervention.setToothNumber(dto.getToothNumber());
        intervention.setInterventionDetails(dto.getInterventionDetails());
        intervention.setIsExtracted(dto.getIsExtracted());

        toothInterventionRepository.save(intervention);
    }

    @Transactional
    public void deleteTeethExtraction(String cnp, int toothNumber) {
        toothInterventionRepository.deleteByPatientCnpAndToothNumber(cnp, toothNumber);
    }

    // Tooth Problem Operations

    public List<ToothProblemDto> getPatientToothProblems(String patientCnp, int toothNumber) {
        List<ToothProblem> problems = toothProblemRepository
                .findByPatientCnpAndToothNumber(patientCnp, toothNumber);

        List<ToothProblemDto> dtos = new ArrayList<>();
        for (ToothProblem problem : problems) {
            ToothProblemDto dto = new ToothProblemDto();
            dto.setProblemId(problem.getProblemId());
            dto.setToothNumber(problem.getToothNumber());
            dto.setPatientCnp(patientCnp);
            dto.setDateProblem(problem.getDateProblem());
            dto.setProblemDetails(problem.getProblemDetails());
            dtos.add(dto);
        }
        return dtos;
    }

    public List<ToothProblemDto> getPatientAllToothProblems(String patientCnp) {
        List<ToothProblem> problems = toothProblemRepository.findByPatientCnp(patientCnp);

        List<ToothProblemDto> dtos = new ArrayList<>();
        for (ToothProblem problem : problems) {
            ToothProblemDto dto = new ToothProblemDto();
            dto.setProblemId(problem.getProblemId());
            dto.setToothNumber(problem.getToothNumber());
            dto.setPatientCnp(patientCnp);
            dto.setDateProblem(problem.getDateProblem());
            dto.setProblemDetails(problem.getProblemDetails());
            dtos.add(dto);
        }
        return dtos;
    }

    public void addNewProblem(ToothProblemDto dto) {
        ToothProblem problem = ToothProblem.builder()
                .toothNumber(dto.getToothNumber())
                .patientCnp(dto.getPatientCnp())
                .dateProblem(dto.getDateProblem())
                .problemDetails(dto.getProblemDetails())
                .build();

        toothProblemRepository.save(problem);
    }

    @Transactional
    public void deleteProblem(Long problemId) {
        ToothProblem problem = toothProblemRepository.findByProblemId(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        toothProblemRepository.delete(problem);
    }

    @Transactional
    public void updateProblem(ToothProblemDto dto) {
        ToothProblem problem = toothProblemRepository.findByProblemId(dto.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        problem.setToothNumber(dto.getToothNumber());
        problem.setDateProblem(dto.getDateProblem());
        problem.setProblemDetails(dto.getProblemDetails());

        toothProblemRepository.save(problem);
    }
}
