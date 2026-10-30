package com.kothari.dashboard.audit.dto;

import com.kothari.dashboard.audit.entity.DiscrepancySeverity;
import com.kothari.dashboard.audit.entity.DiscrepancyStatus;
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
public class AuditDiscrepancyResponseDto {

    private UUID id;
    private UUID sessionId;
    private UUID assetId;
    private String assetTag;
    private String assetName;
    private String serialNumber;
    private String branchLocation;
    private DiscrepancySeverity severity;
    private String issue;
    private String reportedBy;
    private LocalDate reportDate;
    private DiscrepancyStatus status;
    private String actionRequired;
    private LocalDateTime createdAt;
}

