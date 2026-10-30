package com.kothari.dashboard.audit.entity;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Discrepancy record for damaged, missing, or mismatched hardware discovered during stocktake.
 * Strictly 3NF-compliant: registered asset details are normalized through the Asset foreign key;
 * uncatalogued/ghost hardware attributes are captured via unregistered fields.
 */
@Entity
@Table(
    name = "audit_discrepancies",
    indexes = {
        @Index(name = "idx_disc_owner_status", columnList = "owner_id, status"),
        @Index(name = "idx_disc_session", columnList = "session_id"),
        @Index(name = "idx_disc_asset", columnList = "asset_id"),
        @Index(name = "idx_disc_branch", columnList = "branch_location")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditDiscrepancy extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private AuditSession auditSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    /**
     * Captured only for uncataloged/ghost hardware discovered during stocktake (asset == null).
     * For registered assets, tag/name/serial are derived from Asset to guarantee 3NF.
     */
    @Column(name = "unregistered_tag", length = 50)
    private String unregisteredTag;

    @Column(name = "unregistered_name", length = 150)
    private String unregisteredName;

    @Column(name = "unregistered_serial", length = 100)
    private String unregisteredSerial;

    @Column(name = "branch_location", length = 100)
    private String branchLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 30)
    @Builder.Default
    private DiscrepancySeverity severity = DiscrepancySeverity.MEDIUM;

    @Column(name = "issue_description", nullable = false, length = 1000)
    private String issue;

    @Column(name = "reported_by", length = 150)
    private String reportedBy;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private DiscrepancyStatus status = DiscrepancyStatus.INVESTIGATING;

    @Column(name = "action_required", length = 1000)
    private String actionRequired;

    public String getAssetTag() {
        return asset != null ? asset.getAssetTag() : unregisteredTag;
    }

    public String getAssetName() {
        return asset != null ? asset.getName() : unregisteredName;
    }

    public String getSerialNumber() {
        return asset != null ? asset.getSerialNumber() : unregisteredSerial;
    }
}
