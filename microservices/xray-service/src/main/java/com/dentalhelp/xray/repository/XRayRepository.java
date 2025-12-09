package com.dentalhelp.xray.repository;

import com.dentalhelp.xray.model.XRay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface XRayRepository extends JpaRepository<XRay, Long> {
    List<XRay> findByPatientCnp(String patientCnp);
    Optional<XRay> findByXrayId(Long xrayId);
}
