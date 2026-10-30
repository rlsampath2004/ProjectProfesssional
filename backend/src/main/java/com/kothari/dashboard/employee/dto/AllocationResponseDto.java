package com.kothari.dashboard.employee.dto;

import com.kothari.dashboard.employee.entity.AllocationStatus;
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
public class AllocationResponseDto {

    private UUID id;
    private String receiptNumber;
    private UUID assetId;
    private String assetTag;
    private String assetName;
    private String assetSerialNumber;
    private UUID employeeId;
    private String employeeCode;
    private String employeeName;
    private String department;
    private LocalDate issueDate;
    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;
    private String issueCondition;
    private String returnCondition;
    private AllocationStatus status;
    private boolean undertakingAccepted;
    private String authorizedBy;
    private String returnNotes;
    private LocalDateTime createdAt;
}

