package com.kothari.dashboard.audit.repository;

import com.kothari.dashboard.audit.entity.AuditSession;
import com.kothari.dashboard.audit.entity.AuditSessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditSessionRepository extends JpaRepository<AuditSession, UUID> {

    Optional<AuditSession> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<AuditSession> findBySessionCodeAndOwnerId(String sessionCode, UUID ownerId);

    boolean existsBySessionCodeAndOwnerId(String sessionCode, UUID ownerId);

    Page<AuditSession> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<AuditSession> findByOwnerIdAndStatus(UUID ownerId, AuditSessionStatus status, Pageable pageable);
}

