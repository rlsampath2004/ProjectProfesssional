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
 * OLX Decommissioned Asset Financial Sale Record.
 * Strictly 3NF-compliant: asset details, listing details, and transaction settlement are normalized.
 */
@Entity
@Table(
    name = "olx_sales",
    indexes = {
        @Index(name = "idx_sale_owner_date", columnList = "owner_id, date_sold"),
        @Index(name = "idx_sale_asset", columnList = "asset_id"),
        @Index(name = "idx_sale_listing", columnList = "listing_id"),
        @Index(name = "idx_sale_receipt", columnList = "sale_receipt_number", unique = true)
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OlxSale extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private OlxListing listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "sale_receipt_number", nullable = false, length = 50, unique = true)
    private String saleReceiptNumber;

    @Column(name = "sold_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal soldPrice;

    @Column(name = "buyer_name", nullable = false, length = 150)
    private String buyerName;

    @Column(name = "buyer_phone", length = 50)
    private String buyerPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 30)
    @Builder.Default
    private PaymentMode paymentMode = PaymentMode.UPI;

    @Column(name = "date_sold", nullable = false)
    @Builder.Default
    private LocalDate dateSold = LocalDate.now();

    @Column(name = "notes", length = 1000)
    private String notes;
}

