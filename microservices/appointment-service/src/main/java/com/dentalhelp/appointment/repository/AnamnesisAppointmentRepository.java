package com.dentalhelp.appointment.repository;

import com.dentalhelp.appointment.model.AnamnesisAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnamnesisAppointmentRepository extends JpaRepository<AnamnesisAppointment, Long> {
    Optional<AnamnesisAppointment> findByAppointment_AppointmentId(Long appointmentId);
}
