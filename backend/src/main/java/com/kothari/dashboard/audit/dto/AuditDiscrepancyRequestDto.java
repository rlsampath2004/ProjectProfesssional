package com.kothari.dashboard.audit.dto;

import com.kothari.dashboard.audit.entity.DiscrepancySeverity;
import com.kothari.dashboard.audit.entity.DiscrepancyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditDiscrepancyRequestDto {

    private UUID sessionId;
    private UUID assetId;

    @NotBlank(message = "Asset tag is required")
    private String assetTag;

    @NotBlank(message = "Asset name is required")
    private String assetName;

    private String serialNumber;
    private String branchLocation;

    @NotNull(message = "Severity is required")
    private DiscrepancySeverity severity;

    @NotBlank(message = "Issue description is required")
    private String issue;

    private String reportedBy;
    private DiscrepancyStatus status;
    private String actionRequired;
}

