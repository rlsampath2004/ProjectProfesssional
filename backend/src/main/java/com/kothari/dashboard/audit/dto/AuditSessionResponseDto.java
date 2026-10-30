package com.kothari.dashboard.audit.dto;

import com.kothari.dashboard.audit.entity.AuditSessionStatus;
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
public class AuditSessionResponseDto {

    private UUID id;
    private String sessionCode;
    private String title;
    private String branchLocation;
    private String auditorName;
    private LocalDate startDate;
    private LocalDate targetDate;
    private AuditSessionStatus status;
    private double reconciliationScore;
    private String certificateHash;
    private String certifiedBy;
    private LocalDate certifiedDate;
    private int totalItems;
    private int verifiedItems;
    private int discrepanciesCount;
    private LocalDateTime createdAt;
}

