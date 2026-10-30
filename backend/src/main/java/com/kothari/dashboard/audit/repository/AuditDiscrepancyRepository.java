package com.kothari.dashboard.audit.repository;

import com.kothari.dashboard.audit.entity.AuditDiscrepancy;
import com.kothari.dashboard.audit.entity.AuditSession;
import com.kothari.dashboard.audit.entity.DiscrepancyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditDiscrepancyRepository extends JpaRepository<AuditDiscrepancy, UUID> {

    Optional<AuditDiscrepancy> findByIdAndOwnerId(UUID id, UUID ownerId);

    Page<AuditDiscrepancy> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<AuditDiscrepancy> findByOwnerIdAndStatus(UUID ownerId, DiscrepancyStatus status, Pageable pageable);

    List<AuditDiscrepancy> findByAuditSessionAndOwnerId(AuditSession auditSession, UUID ownerId);

    int countByAuditSessionAndOwnerId(AuditSession auditSession, UUID ownerId);

    int countByAuditSessionAndOwnerIdAndStatusNot(AuditSession auditSession, UUID ownerId, DiscrepancyStatus status);

    int countByOwnerId(UUID ownerId);
}

