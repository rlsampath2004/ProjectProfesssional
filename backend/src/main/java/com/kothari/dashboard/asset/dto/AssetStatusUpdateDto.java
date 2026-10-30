package com.kothari.dashboard.asset.dto;

import com.kothari.dashboard.asset.entity.AssetStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetStatusUpdateDto {

    @NotNull(message = "New status is required")
    private AssetStatus newStatus;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String newLocation;

    @Size(max = 50, message = "Employee ID cannot exceed 50 characters")
    private String assignedEmployeeId;

    @Size(max = 150, message = "Employee name cannot exceed 150 characters")
    private String assignedEmployeeName;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}

