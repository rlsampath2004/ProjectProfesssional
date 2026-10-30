package com.kothari.dashboard.audit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditScanRequestDto {

    @NotBlank(message = "Scanned barcode or serial number is required")
    private String barcodeOrSerial;

    private String actualLocation;
    private String remarks;
}

