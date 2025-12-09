package com.dentalhelp.appointment.repository;

import com.dentalhelp.appointment.model.AppointmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRequestRepository extends JpaRepository<AppointmentRequest, Long> {
    Optional<AppointmentRequest> findByAppointmentRequestId(Long requestId);
    List<AppointmentRequest> findByPatientCnp(String patientCnp);
}
