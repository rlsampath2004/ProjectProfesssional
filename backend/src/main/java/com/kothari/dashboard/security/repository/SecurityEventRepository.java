package com.kothari.dashboard.security.repository;

import com.kothari.dashboard.security.entity.SecurityEvent;
import com.kothari.dashboard.security.entity.SecurityEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {

    Page<SecurityEvent> findByOrderByCreatedAtDesc(Pageable pageable);

    Page<SecurityEvent> findByEventTypeOrderByCreatedAtDesc(SecurityEventType eventType, Pageable pageable);
}

