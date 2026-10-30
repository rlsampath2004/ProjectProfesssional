package com.kothari.dashboard.asset.repository;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<Asset> findByAssetTagAndOwnerId(String assetTag, UUID ownerId);

    Optional<Asset> findBySerialNumberAndOwnerId(String serialNumber, UUID ownerId);

    boolean existsBySerialNumberAndOwnerId(String serialNumber, UUID ownerId);

    boolean existsBySerialNumberAndOwnerIdAndIdNot(String serialNumber, UUID ownerId, UUID id);

    boolean existsByAssetTagAndOwnerIdAndIdNot(String assetTag, UUID ownerId, UUID id);

    Page<Asset> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<Asset> findByOwnerIdAndStatus(UUID ownerId, AssetStatus status, Pageable pageable);

    Page<Asset> findByOwnerIdAndType(UUID ownerId, AssetType type, Pageable pageable);

    long countByOwnerIdAndStatus(UUID ownerId, AssetStatus status);

    List<Asset> findByOwnerId(UUID ownerId);

    @Query("SELECT a FROM Asset a LEFT JOIN a.assignedEmployee e WHERE a.ownerId = :ownerId AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Asset> searchAssets(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);
}

