package com.dentalhelp.appointment.repository;

import com.dentalhelp.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentId(Long appointmentId);
    List<Appointment> findByPatientCnp(String patientCnp);
}
