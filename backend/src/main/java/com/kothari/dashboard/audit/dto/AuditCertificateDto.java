package com.kothari.dashboard.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Statutory IT Audit Verification Certificate DTO.
 * Matches the official signed audit certificate with SHA-256 digital seal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditCertificateDto {

    private UUID sessionId;
    private String sessionCode;
    private String title;
    private String branchLocation;
    private LocalDate auditDate;
    private String auditorName;
    private String certifiedBy;
    private LocalDate certifiedDate;
    private int totalAssets;
    private int verifiedCount;
    private int missingCount;
    private int discrepanciesCount;
    private double reconciliationPercentage;
    private String sha256Signature;
    private LocalDateTime issuedAt;
    private String status;
}

