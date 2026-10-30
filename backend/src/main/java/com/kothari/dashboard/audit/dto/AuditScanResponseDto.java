package com.kothari.dashboard.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditScanResponseDto {

    private UUID auditItemId;
    private UUID assetId;
    private String assetTag;
    private String assetName;
    private String serialNumber;
    private String expectedLocation;
    private String actualLocation;
    private boolean verified;
    private boolean locationMismatch;
    private LocalDateTime scannedAt;
    private String message;
}

