package com.kothari.dashboard.employee.dto;

import com.kothari.dashboard.employee.entity.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Employee Exit Clearance Checklist DTO.
 * Guarantees zero unreturned hardware/SIM cards prior to final HR settlement.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitClearanceDto {

    private UUID employeeId;
    private String employeeCode;
    private String fullName;
    private String department;
    private EmployeeStatus employeeStatus;
    private LocalDate exitDate;

    private int outstandingAssetCount;
    private BigDecimal totalOutstandingValue;
    private boolean clearanceApproved; // True if outstandingAssetCount == 0
    private String statusMessage;

    private List<HeldAssetSummary> outstandingAssets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeldAssetSummary {
        private UUID allocationId;
        private UUID assetId;
        private String assetTag;
        private String assetName;
        private String serialNumber;
        private LocalDate issueDate;
        private BigDecimal purchaseCost;
        private String condition;
    }
}

