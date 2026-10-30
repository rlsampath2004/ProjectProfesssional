package com.kothari.dashboard.audit.entity;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit verification item scanned during physical stocktake.
 */
@Entity
@Table(
    name = "audit_items",
    indexes = {
        @Index(name = "idx_item_session", columnList = "session_id"),
        @Index(name = "idx_item_asset", columnList = "asset_id"),
        @Index(name = "idx_item_owner", columnList = "owner_id")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditItem extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AuditSession auditSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Column(name = "scanned_tag", length = 50)
    private String scannedTag;

    @Column(name = "scanned_serial", length = 100)
    private String scannedSerial;

    @Column(name = "scanned_location", length = 100)
    private String scannedLocation;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @Column(name = "remarks", length = 500)
    private String remarks;
}

