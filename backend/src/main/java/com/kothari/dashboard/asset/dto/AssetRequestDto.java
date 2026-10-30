package com.kothari.dashboard.asset.dto;

import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Validated DTO for Asset Creation and Full Updates.
 * Prevents mass-assignment vulnerabilities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequestDto {

    @NotBlank(message = "Asset tag is required")
    @Size(max = 50, message = "Asset tag cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9_\\-]+$", message = "Asset tag must contain only alphanumeric characters, dashes, or underscores")
    private String assetTag;

    @NotBlank(message = "Asset name is required")
    @Size(max = 150, message = "Asset name cannot exceed 150 characters")
    private String name;

    @NotNull(message = "Asset type is required")
    private AssetType type;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    private String serialNumber;

    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @PositiveOrZero(message = "Purchase cost must be zero or positive")
    private BigDecimal purchaseCost;

    private LocalDate warrantyExpiry;
    private LocalDate amcExpiry;

    private AssetStatus status;

    @Size(max = 50, message = "Condition cannot exceed 50 characters")
    private String condition;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @Size(max = 50, message = "Employee ID cannot exceed 50 characters")
    private String assignedEmployeeId;

    @Size(max = 150, message = "Employee Name cannot exceed 150 characters")
    private String assignedEmployeeName;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}

