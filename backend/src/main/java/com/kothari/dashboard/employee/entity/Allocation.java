package com.kothari.dashboard.employee.entity;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Hardware & SIM Custody Allocation record.
 * Tracks custody transfer, return dates, condition sign-offs, and legal undertakings.
 */
@Entity
@Table(
    name = "allocations",
    indexes = {
        @Index(name = "idx_alloc_owner_status", columnList = "owner_id, status"),
        @Index(name = "idx_alloc_employee", columnList = "employee_id"),
        @Index(name = "idx_alloc_asset", columnList = "asset_id"),
        @Index(name = "idx_alloc_receipt", columnList = "receipt_number")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "receipt_number", nullable = false, length = 50)
    private String receiptNumber;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "actual_return_date")
    private LocalDate actualReturnDate;

    @Column(name = "issue_condition", length = 50)
    @Builder.Default
    private String issueCondition = "Good";

    @Column(name = "return_condition", length = 50)
    private String returnCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private AllocationStatus status = AllocationStatus.ACTIVE;

    @Column(name = "is_undertaking_accepted", nullable = false)
    @Builder.Default
    private boolean undertakingAccepted = true;

    @Column(name = "authorized_by", length = 100)
    private String authorizedBy;

    @Column(name = "return_notes", length = 500)
    private String returnNotes;
}

