package com.kothari.dashboard.audit.service;

import com.kothari.dashboard.audit.dto.*;
import com.kothari.dashboard.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditService {

    PageResponse<AuditSessionResponseDto> getAllSessions(UUID ownerId, Pageable pageable);

    AuditSessionResponseDto getSessionById(UUID ownerId, UUID id);

    AuditSessionResponseDto createSession(UUID ownerId, AuditSessionRequestDto dto);

    AuditScanResponseDto verifyScan(UUID ownerId, UUID sessionId, AuditScanRequestDto dto);

    AuditSessionResponseDto certifySession(UUID ownerId, UUID sessionId, String certifiedBy);

    AuditCertificateDto getCertificate(UUID ownerId, UUID sessionId);

    PageResponse<AuditDiscrepancyResponseDto> getAllDiscrepancies(UUID ownerId, Pageable pageable);

    AuditDiscrepancyResponseDto createDiscrepancy(UUID ownerId, AuditDiscrepancyRequestDto dto);

    AuditDiscrepancyResponseDto resolveDiscrepancy(UUID ownerId, UUID id, String remarks);
}

