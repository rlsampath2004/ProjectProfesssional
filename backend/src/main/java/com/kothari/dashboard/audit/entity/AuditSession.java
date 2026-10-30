package com.kothari.dashboard.audit.entity;

import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Audit Session entity for physical stocktake verification.
 */
@Entity
@Table(
    name = "audit_sessions",
    indexes = {
        @Index(name = "idx_audit_owner_code", columnList = "owner_id, session_code", unique = true),
        @Index(name = "idx_audit_owner_status", columnList = "owner_id, status"),
        @Index(name = "idx_audit_branch", columnList = "branch_location")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditSession extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "session_code", nullable = false, length = 50)
    private String sessionCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "branch_location", nullable = false, length = 100)
    private String branchLocation;

    @Column(name = "auditor_name", nullable = false, length = 150)
    private String auditorName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private AuditSessionStatus status = AuditSessionStatus.IN_PROGRESS;

    @Column(name = "reconciliation_score")
    @Builder.Default
    private Double reconciliationScore = 0.0;

    @Column(name = "certificate_hash", length = 64)
    private String certificateHash;

    @Column(name = "certified_by", length = 150)
    private String certifiedBy;

    @Column(name = "certified_date")
    private LocalDate certifiedDate;

    @Column(name = "notes", length = 1000)
    private String notes;
}

