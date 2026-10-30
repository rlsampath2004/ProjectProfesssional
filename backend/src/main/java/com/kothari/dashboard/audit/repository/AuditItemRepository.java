package com.kothari.dashboard.audit.repository;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.audit.entity.AuditItem;
import com.kothari.dashboard.audit.entity.AuditSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditItemRepository extends JpaRepository<AuditItem, UUID> {

    List<AuditItem> findByAuditSessionAndOwnerId(AuditSession auditSession, UUID ownerId);

    Optional<AuditItem> findByAuditSessionAndAssetAndOwnerId(AuditSession auditSession, Asset asset, UUID ownerId);

    Optional<AuditItem> findByAuditSessionAndScannedTagAndOwnerId(AuditSession auditSession, String scannedTag, UUID ownerId);

    int countByAuditSessionAndOwnerId(AuditSession auditSession, UUID ownerId);

    int countByAuditSessionAndVerifiedTrueAndOwnerId(AuditSession auditSession, UUID ownerId);
}

