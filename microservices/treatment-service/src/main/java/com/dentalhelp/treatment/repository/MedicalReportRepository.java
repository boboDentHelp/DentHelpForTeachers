package com.dentalhelp.treatment.repository;

import com.dentalhelp.treatment.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    Optional<MedicalReport> findByAppointmentId(Long appointmentId);
}
