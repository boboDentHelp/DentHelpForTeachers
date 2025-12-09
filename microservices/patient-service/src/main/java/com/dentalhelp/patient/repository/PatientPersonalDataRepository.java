package com.dentalhelp.patient.repository;

import com.dentalhelp.patient.model.PatientPersonalData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientPersonalDataRepository extends JpaRepository<PatientPersonalData, Long> {
    Optional<PatientPersonalData> findByPatientCnp(String patientCnp);
    void deleteByPatientCnp(String patientCnp);
}
