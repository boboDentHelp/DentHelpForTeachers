package com.dentalhelp.treatment.service;

import com.dentalhelp.treatment.dto.MedicalReportDto;
import com.dentalhelp.treatment.dto.TreatmentSheetDto;
import com.dentalhelp.treatment.exception.ResourceNotFoundException;
import com.dentalhelp.treatment.model.MedicalReport;
import com.dentalhelp.treatment.model.TreatmentSheet;
import com.dentalhelp.treatment.repository.MedicalReportRepository;
import com.dentalhelp.treatment.repository.TreatmentSheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentSheetRepository treatmentSheetRepository;
    private final MedicalReportRepository medicalReportRepository;

    // Treatment Sheet Operations

    public TreatmentSheetDto getTreatmentSheetByAppointmentId(Long appointmentId) {
        TreatmentSheet sheet = treatmentSheetRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment sheet not found for appointment: " + appointmentId));
        return convertToTreatmentSheetDto(sheet);
    }

    @Transactional
    public void saveTreatmentSheet(TreatmentSheetDto dto) {
        TreatmentSheet sheet = TreatmentSheet.builder()
                .appointmentId(dto.getAppointmentId())
                .appointmentObservations(dto.getAppointmentObservations())
                .recommendations(dto.getRecommendations())
                .medication(dto.getMedication())
                .build();

        treatmentSheetRepository.save(sheet);
    }

    @Transactional
    public void updateTreatmentSheet(TreatmentSheetDto dto) {
        TreatmentSheet sheet = treatmentSheetRepository.findByTreatmentNumber(dto.getTreatmentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Treatment sheet not found"));

        sheet.setAppointmentObservations(dto.getAppointmentObservations());
        sheet.setRecommendations(dto.getRecommendations());
        sheet.setMedication(dto.getMedication());

        treatmentSheetRepository.save(sheet);
    }

    @Transactional
    public void deleteTreatmentSheet(Long treatmentNumber) {
        TreatmentSheet sheet = treatmentSheetRepository.findByTreatmentNumber(treatmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment sheet not found"));
        treatmentSheetRepository.delete(sheet);
    }

    // Medical Report Operations

    public MedicalReportDto getMedicalReportByAppointmentId(Long appointmentId) {
        MedicalReport report = medicalReportRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical report not found for appointment: " + appointmentId));
        return convertToMedicalReportDto(report);
    }

    @Transactional
    public void saveMedicalReport(MedicalReportDto dto) {
        MedicalReport report = MedicalReport.builder()
                .appointmentId(dto.getAppointmentId())
                .treatmentDetails(dto.getTreatmentDetails())
                .medication(dto.getMedication())
                .date(dto.getDate())
                .hour(dto.getHour())
                .build();

        medicalReportRepository.save(report);
    }

    @Transactional
    public void updateMedicalReport(MedicalReportDto dto) {
        MedicalReport report = medicalReportRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Medical report not found"));

        report.setTreatmentDetails(dto.getTreatmentDetails());
        report.setMedication(dto.getMedication());
        report.setDate(dto.getDate());
        report.setHour(dto.getHour());

        medicalReportRepository.save(report);
    }

    @Transactional
    public void deleteMedicalReport(Long id) {
        MedicalReport report = medicalReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical report not found"));
        medicalReportRepository.delete(report);
    }

    // Converter Methods

    private TreatmentSheetDto convertToTreatmentSheetDto(TreatmentSheet sheet) {
        return TreatmentSheetDto.builder()
                .treatmentNumber(sheet.getTreatmentNumber())
                .appointmentId(sheet.getAppointmentId())
                .appointmentObservations(sheet.getAppointmentObservations())
                .recommendations(sheet.getRecommendations())
                .medication(sheet.getMedication())
                .build();
    }

    private MedicalReportDto convertToMedicalReportDto(MedicalReport report) {
        return MedicalReportDto.builder()
                .id(report.getId())
                .appointmentId(report.getAppointmentId())
                .treatmentDetails(report.getTreatmentDetails())
                .medication(report.getMedication())
                .date(report.getDate())
                .hour(report.getHour())
                .build();
    }
}
