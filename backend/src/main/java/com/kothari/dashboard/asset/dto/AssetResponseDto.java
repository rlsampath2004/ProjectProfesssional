package com.kothari.dashboard.asset.dto;

import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clean response DTO representation of an Asset.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponseDto {

    private UUID id;
    private String assetTag;
    private String name;
    private AssetType type;
    private String serialNumber;
    private String brand;
    private String model;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private LocalDate warrantyExpiry;
    private LocalDate amcExpiry;
    private AssetStatus status;
    private String condition;
    private String location;
    private String assignedEmployeeId;
    private String assignedEmployeeName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

