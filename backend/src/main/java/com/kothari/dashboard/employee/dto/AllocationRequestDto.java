package com.kothari.dashboard.employee.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationRequestDto {

    @NotNull(message = "Asset ID is required")
    private UUID assetId;

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    private LocalDate issueDate;
    private LocalDate expectedReturnDate;

    @Size(max = 50, message = "Condition cannot exceed 50 characters")
    private String issueCondition;

    private boolean undertakingAccepted;
}

