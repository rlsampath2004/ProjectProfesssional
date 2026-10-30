package com.kothari.dashboard.asset.repository;

import com.kothari.dashboard.asset.entity.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetHistoryRepository extends JpaRepository<AssetHistory, UUID> {

    List<AssetHistory> findByAssetIdAndOwnerIdOrderByCreatedAtDesc(UUID assetId, UUID ownerId);
}

