package com.kothari.dashboard.asset.entity;

import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

/**
 * Immutable historical audit timeline of changes to an Asset (status, location, holder).
 */
@Entity
@Table(
    name = "asset_history",
    indexes = {
        @Index(name = "idx_history_asset", columnList = "asset_id"),
        @Index(name = "idx_history_owner", columnList = "owner_id")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetHistory extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private AssetStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 50)
    private AssetStatus newStatus;

    @Column(name = "previous_location", length = 100)
    private String previousLocation;

    @Column(name = "new_location", length = 100)
    private String newLocation;

    @Column(name = "previous_holder", length = 150)
    private String previousHolder;

    @Column(name = "new_holder", length = 150)
    private String newHolder;

    @Column(name = "change_reason", length = 500)
    private String changeReason;
}

