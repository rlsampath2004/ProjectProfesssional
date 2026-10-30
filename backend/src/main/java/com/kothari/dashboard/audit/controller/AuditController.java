package com.kothari.dashboard.audit.controller;

import com.kothari.dashboard.audit.dto.*;
import com.kothari.dashboard.audit.service.AuditService;
import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    private static final UUID DEFAULT_OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private UUID resolveOwnerId(Principal principal) {
        if (principal == null || principal.getName() == null) return DEFAULT_OWNER_ID;
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return DEFAULT_OWNER_ID;
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<PageResponse<AuditSessionResponseDto>>> getSessions(
            Principal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UUID ownerId = resolveOwnerId(principal);
        PageResponse<AuditSessionResponseDto> response = auditService.getAllSessions(ownerId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<AuditSessionResponseDto>> getSessionById(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        AuditSessionResponseDto response = auditService.getSessionById(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<AuditSessionResponseDto>> createSession(
            Principal principal,
            @Valid @RequestBody AuditSessionRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        AuditSessionResponseDto created = auditService.createSession(ownerId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Audit stocktake session initialized", created));
    }

    @PostMapping("/sessions/{id}/scan")
    public ResponseEntity<ApiResponse<AuditScanResponseDto>> scanItem(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AuditScanRequestDto scanDto) {

        UUID ownerId = resolveOwnerId(principal);
        AuditScanResponseDto response = auditService.verifyScan(ownerId, id, scanDto);
        return ResponseEntity.ok(ApiResponse.ok("Scan processed", response));
    }

    @PostMapping("/sessions/{id}/certify")
    public ResponseEntity<ApiResponse<AuditSessionResponseDto>> certifySession(
            Principal principal,
            @PathVariable UUID id) {

        UUID ownerId = resolveOwnerId(principal);
        String certifiedBy = principal != null ? principal.getName() : "R.L. Kothari (Owner & CEO)";
        AuditSessionResponseDto response = auditService.certifySession(ownerId, id, certifiedBy);
        return ResponseEntity.ok(ApiResponse.ok("Audit session signed and digitally sealed", response));
    }

    @GetMapping("/sessions/{id}/certificate")
    public ResponseEntity<ApiResponse<AuditCertificateDto>> getCertificate(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        AuditCertificateDto certificate = auditService.getCertificate(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(certificate));
    }

    @GetMapping("/discrepancies")
    public ResponseEntity<ApiResponse<PageResponse<AuditDiscrepancyResponseDto>>> getDiscrepancies(
            Principal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UUID ownerId = resolveOwnerId(principal);
        PageResponse<AuditDiscrepancyResponseDto> response = auditService.getAllDiscrepancies(ownerId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/discrepancies")
    public ResponseEntity<ApiResponse<AuditDiscrepancyResponseDto>> createDiscrepancy(
            Principal principal,
            @Valid @RequestBody AuditDiscrepancyRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        AuditDiscrepancyResponseDto created = auditService.createDiscrepancy(ownerId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Discrepancy ticket created", created));
    }

    @PatchMapping("/discrepancies/{id}/resolve")
    public ResponseEntity<ApiResponse<AuditDiscrepancyResponseDto>> resolveDiscrepancy(
            Principal principal,
            @PathVariable UUID id,
            @RequestParam(required = false) String remarks) {

        UUID ownerId = resolveOwnerId(principal);
        AuditDiscrepancyResponseDto resolved = auditService.resolveDiscrepancy(ownerId, id, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Discrepancy marked as resolved", resolved));
    }
}

