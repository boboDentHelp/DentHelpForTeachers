package com.dentalhelp.dentalrecords.repository;

import com.dentalhelp.dentalrecords.model.ToothProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToothProblemRepository extends JpaRepository<ToothProblem, Long> {
    List<ToothProblem> findByPatientCnpAndToothNumber(String patientCnp, int toothNumber);
    List<ToothProblem> findByPatientCnp(String patientCnp);
    Optional<ToothProblem> findByProblemId(Long problemId);
}
