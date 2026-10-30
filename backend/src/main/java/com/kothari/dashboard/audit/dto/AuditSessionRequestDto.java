package com.kothari.dashboard.audit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditSessionRequestDto {

    @NotBlank(message = "Session code is required")
    @Size(max = 50, message = "Session code cannot exceed 50 characters")
    private String sessionCode;

    @NotBlank(message = "Session title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Branch location is required")
    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String branchLocation;

    @NotBlank(message = "Auditor name is required")
    @Size(max = 150, message = "Auditor name cannot exceed 150 characters")
    private String auditorName;

    private LocalDate startDate;
    private LocalDate targetDate;
    private String notes;
}

