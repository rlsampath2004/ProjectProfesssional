package com.kothari.dashboard.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Formal IT Asset Custody Handover Undertaking Receipt.
 * Corresponds to the print-ready dual-signature undertaking contract in the frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverReceiptDto {

    private UUID allocationId;
    private String receiptNumber;
    private LocalDate issueDate;
    private LocalDate expectedReturnDate;

    // Employee Information
    private String employeeCode;
    private String employeeName;
    private String department;
    private String designation;
    private String email;
    private String phone;

    // Asset Information
    private String assetTag;
    private String assetName;
    private String serialNumber;
    private String brand;
    private String model;
    private String condition;
    private BigDecimal estimatedValue;

    // Legal & Security Undertaking Terms
    private String undertakingClause;
    private String authorizedBy;
    private boolean digitallyAccepted;
}

