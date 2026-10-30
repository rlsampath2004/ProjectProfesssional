package com.kothari.dashboard.employee.dto;

import com.kothari.dashboard.employee.entity.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {

    private UUID id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private EmployeeStatus status;
    private LocalDate joiningDate;
    private LocalDate exitDate;
    private String notes;
    private int activeAllocationsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

