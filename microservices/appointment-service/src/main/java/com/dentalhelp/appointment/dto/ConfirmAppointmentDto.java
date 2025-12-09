package com.dentalhelp.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmAppointmentDto {
    private Long requestId;
    private String date;
    private String hour;
}
