package com.dentalhelp.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnamnesisAppointmentDto {
    private Long anamneseAppointmentId;
    private Long appointmentId;
    private String appointmentReason;
    private String currentMedication;
    private String recentMedication;
    private String pregnancy;
    private String currentSymptoms;
}
