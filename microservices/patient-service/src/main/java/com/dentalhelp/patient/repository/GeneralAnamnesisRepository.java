package com.dentalhelp.patient.repository;

import com.dentalhelp.patient.model.GeneralAnamnesis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeneralAnamnesisRepository extends JpaRepository<GeneralAnamnesis, Long> {
    Optional<GeneralAnamnesis> findByPatientCnp(String patientCnp);
    void deleteByPatientCnp(String patientCnp);
}
