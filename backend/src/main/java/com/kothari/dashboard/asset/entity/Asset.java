package com.kothari.dashboard.asset.entity;

import com.kothari.dashboard.common.BaseEntity;
import com.kothari.dashboard.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Core IT Asset entity.
 * Uses soft delete (@SQLRestriction) and non-enumerable UUIDs.
 */
@Entity
@Table(
    name = "assets",
    indexes = {
        @Index(name = "idx_asset_owner_status", columnList = "owner_id, status"),
        @Index(name = "idx_asset_owner_serial", columnList = "owner_id, serial_number"),
        @Index(name = "idx_asset_owner_tag", columnList = "owner_id, asset_tag")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_asset_tag_owner", columnNames = {"owner_id", "asset_tag"})
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "asset_tag", nullable = false, length = 50)
    private String assetTag;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 50)
    private AssetType type;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", precision = 12, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(name = "amc_expiry")
    private LocalDate amcExpiry;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private AssetStatus status = AssetStatus.IN_STORE;

    @Column(name = "item_condition", length = 50)
    @Builder.Default
    private String condition = "Good";

    @Column(name = "location", length = 100)
    @Builder.Default
    private String location = "Main Office";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @Column(name = "notes", length = 1000)
    private String notes;

    public String getAssignedEmployeeCode() {
        return assignedEmployee != null ? assignedEmployee.getEmployeeCode() : null;
    }

    public String getAssignedEmployeeName() {
        return assignedEmployee != null ? assignedEmployee.getFullName() : null;
    }
}

