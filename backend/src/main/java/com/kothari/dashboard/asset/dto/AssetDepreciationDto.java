package com.kothari.dashboard.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDepreciationDto {

    private UUID assetId;
    private String assetTag;
    private String assetName;
    private BigDecimal originalCost;
    private double ageInYears;
    private double annualRatePercentage;
    private BigDecimal currentBookValue;
    private BigDecimal totalDepreciation;
    private boolean eligibleForSalvage;
    private String recommendation;
}

