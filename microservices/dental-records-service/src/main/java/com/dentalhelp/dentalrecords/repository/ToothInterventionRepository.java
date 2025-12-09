package com.dentalhelp.dentalrecords.repository;

import com.dentalhelp.dentalrecords.model.ToothIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToothInterventionRepository extends JpaRepository<ToothIntervention, Long> {
    List<ToothIntervention> findByPatientCnpAndToothNumber(String patientCnp, int toothNumber);
    List<ToothIntervention> findByPatientCnp(String patientCnp);
    List<ToothIntervention> findByPatientCnpAndIsExtracted(String patientCnp, String isExtracted);
    Optional<ToothIntervention> findByInterventionId(Long interventionId);
    void deleteByPatientCnpAndToothNumber(String patientCnp, int toothNumber);
}
