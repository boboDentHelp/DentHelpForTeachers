package com.dentalhelp.treatment.repository;

import com.dentalhelp.treatment.model.TreatmentSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreatmentSheetRepository extends JpaRepository<TreatmentSheet, Long> {
    Optional<TreatmentSheet> findByAppointmentId(Long appointmentId);
    Optional<TreatmentSheet> findByTreatmentNumber(Long treatmentNumber);
}
