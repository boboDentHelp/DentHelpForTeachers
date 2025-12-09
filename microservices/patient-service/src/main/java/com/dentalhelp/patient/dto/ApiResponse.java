package com.dentalhelp.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse {
    private String message;
    private Object data;
    private boolean success;

    public static ApiResponse success(String message, Object data) {
        return ApiResponse.builder()
                .message(message)
                .data(data)
                .success(true)
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .message(message)
                .success(false)
                .build();
    }
}
