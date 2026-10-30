package com.kothari.dashboard.olx.entity;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * OLX Salvage Listing Entity.
 * Tracks decommissioned IT assets advertised for secondary market realization.
 * Follows strict 3NF/BCNF normalization: asset hardware details are normalized through Asset entity.
 */
@Entity
@Table(
    name = "olx_listings",
    indexes = {
        @Index(name = "idx_olx_owner_status", columnList = "owner_id, status"),
        @Index(name = "idx_olx_asset", columnList = "asset_id"),
        @Index(name = "idx_olx_ad_id", columnList = "olx_ad_id")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OlxListing extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "category", length = 50)
    @Builder.Default
    private String category = "Laptops";

    @Column(name = "asking_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal askingPrice;

    @Column(name = "expected_price", precision = 12, scale = 2)
    private BigDecimal expectedPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private OlxListingStatus status = OlxListingStatus.ACTIVE;

    @Column(name = "olx_url", length = 300)
    private String olxUrl;

    @Column(name = "olx_ad_id", length = 50)
    private String olxAdId;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private int viewsCount = 0;

    @Column(name = "inquiries_count", nullable = false)
    @Builder.Default
    private int inquiriesCount = 0;

    @Column(name = "listed_date", nullable = false)
    @Builder.Default
    private LocalDate listedDate = LocalDate.now();

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "notes", length = 1000)
    private String notes;
}

