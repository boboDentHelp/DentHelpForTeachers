package com.dentalhelp.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Authentication Service Routes
                .route("auth-service", r -> r.path("/api/auth/**", "/api/admin/auth/**", "/api/admin/patient/addPatient", "/api/admin/patient/delete-patient/**")
                        .uri("lb://AUTH-SERVICE"))

                // Patient Service Routes
                .route("patient-service", r -> r.path("/api/admin/patient/**", "/api/in/personalData/**", "/api/in/general-anamnesis/**")
                        .uri("lb://PATIENT-SERVICE"))

                // Appointment Service Routes
                .route("appointment-service", r -> r.path(
                        "/api/patient/appointments/**",
                        "/api/in/appointment_request/**",
                        "/api/admin/appointment/**",
                        "/api/admin/confirm-appointments/**"
                ).uri("lb://APPOINTMENT-SERVICE"))

                // Dental Records Service Routes
                .route("dental-records-service", r -> r.path("/api/in/teeth/**")
                        .uri("lb://DENTAL-RECORDS-SERVICE"))

                // X-Ray Service Routes
                .route("xray-service", r -> r.path("/api/patient/xray/**")
                        .uri("lb://XRAY-SERVICE"))

                // Treatment Service Routes
                .route("treatment-service", r -> r.path(
                        "/api/in/treatment-sheet/**",
                        "/api/admin/patients/medical-record/**"
                ).uri("lb://TREATMENT-SERVICE"))

                // Notification Service Routes
                .route("notification-service", r -> r.path("/api/in/notifications/**")
                        .uri("lb://NOTIFICATION-SERVICE"))

                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(Collections.singletonList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
