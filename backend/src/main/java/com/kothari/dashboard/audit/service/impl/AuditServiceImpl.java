package com.kothari.dashboard.audit.service.impl;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.audit.dto.*;
import com.kothari.dashboard.audit.entity.*;
import com.kothari.dashboard.audit.repository.AuditDiscrepancyRepository;
import com.kothari.dashboard.audit.repository.AuditItemRepository;
import com.kothari.dashboard.audit.repository.AuditSessionRepository;
import com.kothari.dashboard.audit.service.AuditService;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.common.exception.DuplicateResourceException;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditSessionRepository sessionRepository;
    private final AuditItemRepository itemRepository;
    private final AuditDiscrepancyRepository discrepancyRepository;
    private final AssetRepository assetRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditSessionResponseDto> getAllSessions(UUID ownerId, Pageable pageable) {
        Page<AuditSession> page = sessionRepository.findByOwnerId(ownerId, pageable);
        return PageResponse.from(page.map(s -> mapSessionToDto(s, ownerId)));
    }

    @Override
    @Transactional(readOnly = true)
    public AuditSessionResponseDto getSessionById(UUID ownerId, UUID id) {
        AuditSession session = findSessionOrThrow(ownerId, id);
        return mapSessionToDto(session, ownerId);
    }

    @Override
    @Transactional
    public AuditSessionResponseDto createSession(UUID ownerId, AuditSessionRequestDto dto) {
        if (sessionRepository.existsBySessionCodeAndOwnerId(dto.getSessionCode().trim(), ownerId)) {
            throw new DuplicateResourceException("Audit session code '" + dto.getSessionCode() + "' is already registered.");
        }

        AuditSession session = AuditSession.builder()
                .ownerId(ownerId)
                .sessionCode(dto.getSessionCode().trim())
                .title(dto.getTitle().trim())
                .branchLocation(dto.getBranchLocation().trim())
                .auditorName(dto.getAuditorName().trim())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .targetDate(dto.getTargetDate())
                .status(AuditSessionStatus.IN_PROGRESS)
                .reconciliationScore(0.0)
                .notes(dto.getNotes())
                .build();

        AuditSession saved = sessionRepository.save(session);

        // Preload expected active inventory assets for this branch location
        List<Asset> expectedAssets = assetRepository.findByOwnerId(ownerId).stream()
                .filter(a -> "All".equalsIgnoreCase(dto.getBranchLocation()) ||
                             (a.getLocation() != null && a.getLocation().toLowerCase().contains(dto.getBranchLocation().toLowerCase())))
                .toList();

        for (Asset asset : expectedAssets) {
            AuditItem item = AuditItem.builder()
                    .ownerId(ownerId)
                    .auditSession(saved)
                    .asset(asset)
                    .scannedTag(asset.getAssetTag())
                    .scannedSerial(asset.getSerialNumber())
                    .scannedLocation(asset.getLocation())
                    .verified(false)
                    .build();
            itemRepository.save(item);
        }

        log.info("Initialized stocktake audit session {} with {} expected inventory units", saved.getSessionCode(), expectedAssets.size());
        return mapSessionToDto(saved, ownerId);
    }

    @Override
    @Transactional
    public AuditScanResponseDto verifyScan(UUID ownerId, UUID sessionId, AuditScanRequestDto dto) {
        AuditSession session = findSessionOrThrow(ownerId, sessionId);

        if (session.getStatus() == AuditSessionStatus.CERTIFIED) {
            throw new IllegalStateException("Cannot record scans on a certified & locked audit session.");
        }

        String rawScan = dto.getBarcodeOrSerial().trim();
        Optional<Asset> assetOpt = assetRepository.findByAssetTagAndOwnerId(rawScan, ownerId)
                .or(() -> assetRepository.findBySerialNumberAndOwnerId(rawScan, ownerId));

        if (assetOpt.isEmpty()) {
            return AuditScanResponseDto.builder()
                    .assetTag(rawScan)
                    .verified(false)
                    .message("UNREGISTERED HARDWARE: Serial/Tag not found in central asset inventory.")
                    .build();
        }

        Asset asset = assetOpt.get();
        boolean locationMismatch = dto.getActualLocation() != null &&
                asset.getLocation() != null &&
                !asset.getLocation().equalsIgnoreCase(dto.getActualLocation().trim());

        Optional<AuditItem> itemOpt = itemRepository.findByAuditSessionAndAssetAndOwnerId(session, asset, ownerId);
        AuditItem item = itemOpt.orElseGet(() -> AuditItem.builder()
                .ownerId(ownerId)
                .auditSession(session)
                .asset(asset)
                .scannedTag(asset.getAssetTag())
                .scannedSerial(asset.getSerialNumber())
                .build());

        item.setVerified(true);
        item.setScannedLocation(dto.getActualLocation() != null ? dto.getActualLocation() : asset.getLocation());
        item.setScannedAt(LocalDateTime.now());
        item.setRemarks(dto.getRemarks());
        AuditItem savedItem = itemRepository.save(item);

        // Update session reconciliation score
        int totalExpected = itemRepository.countByAuditSessionAndOwnerId(session, ownerId);
        int totalVerified = itemRepository.countByAuditSessionAndVerifiedTrueAndOwnerId(session, ownerId);
        double score = totalExpected > 0 ? (totalVerified * 100.0) / totalExpected : 100.0;
        session.setReconciliationScore(Math.round(score * 10.0) / 10.0);
        sessionRepository.save(session);

        String message = locationMismatch
                ? "VERIFIED WITH LOCATION VARIANCE: Expected at '" + asset.getLocation() + "' but scanned at '" + dto.getActualLocation() + "'."
                : "MATCH VERIFIED: Hardware verified in correct branch custody.";

        return AuditScanResponseDto.builder()
                .auditItemId(savedItem.getId())
                .assetId(asset.getId())
                .assetTag(asset.getAssetTag())
                .assetName(asset.getName())
                .serialNumber(asset.getSerialNumber())
                .expectedLocation(asset.getLocation())
                .actualLocation(item.getScannedLocation())
                .verified(true)
                .locationMismatch(locationMismatch)
                .scannedAt(savedItem.getScannedAt())
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public AuditSessionResponseDto certifySession(UUID ownerId, UUID sessionId, String certifiedBy) {
        AuditSession session = findSessionOrThrow(ownerId, sessionId);

        int totalExpected = itemRepository.countByAuditSessionAndOwnerId(session, ownerId);
        int totalVerified = itemRepository.countByAuditSessionAndVerifiedTrueAndOwnerId(session, ownerId);
        double score = totalExpected > 0 ? (totalVerified * 100.0) / totalExpected : 100.0;

        LocalDate certDate = LocalDate.now();
        String signatory = certifiedBy != null ? certifiedBy : "R.L. Kothari (Owner & CEO)";

        // Compute SHA-256 seal for tamper-proofing
        String rawData = session.getSessionCode() + ":" + session.getBranchLocation() + ":" + certDate +
                ":" + totalExpected + ":" + totalVerified + ":" + score + ":KOTHARI_STATUTORY_AUDIT_SEAL";
        String sha256 = computeSha256(rawData);

        session.setStatus(AuditSessionStatus.CERTIFIED);
        session.setCertifiedBy(signatory);
        session.setCertifiedDate(certDate);
        session.setReconciliationScore(Math.round(score * 10.0) / 10.0);
        session.setCertificateHash(sha256);

        AuditSession certified = sessionRepository.save(session);
        log.info("Audit session {} certified with SHA-256 seal: {}", certified.getSessionCode(), sha256);
        return mapSessionToDto(certified, ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditCertificateDto getCertificate(UUID ownerId, UUID sessionId) {
        AuditSession session = findSessionOrThrow(ownerId, sessionId);

        int total = itemRepository.countByAuditSessionAndOwnerId(session, ownerId);
        int verified = itemRepository.countByAuditSessionAndVerifiedTrueAndOwnerId(session, ownerId);
        int missing = Math.max(0, total - verified);
        int discrepancies = discrepancyRepository.countByAuditSessionAndOwnerId(session, ownerId);

        return AuditCertificateDto.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .title(session.getTitle())
                .branchLocation(session.getBranchLocation())
                .auditDate(session.getStartDate())
                .auditorName(session.getAuditorName())
                .certifiedBy(session.getCertifiedBy())
                .certifiedDate(session.getCertifiedDate())
                .totalAssets(total)
                .verifiedCount(verified)
                .missingCount(missing)
                .discrepanciesCount(discrepancies)
                .reconciliationPercentage(session.getReconciliationScore() != null ? session.getReconciliationScore() : 0.0)
                .sha256Signature(session.getCertificateHash() != null ? session.getCertificateHash() : "PENDING_CERTIFICATION")
                .issuedAt(session.getCertifiedDate() != null ? session.getCertifiedDate().atStartOfDay() : LocalDateTime.now())
                .status(session.getStatus().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditDiscrepancyResponseDto> getAllDiscrepancies(UUID ownerId, Pageable pageable) {
        Page<AuditDiscrepancy> page = discrepancyRepository.findByOwnerId(ownerId, pageable);
        return PageResponse.from(page.map(this::mapDiscrepancyToDto));
    }

    @Override
    @Transactional
    public AuditDiscrepancyResponseDto createDiscrepancy(UUID ownerId, AuditDiscrepancyRequestDto dto) {
        AuditSession session = null;
        if (dto.getSessionId() != null) {
            session = sessionRepository.findByIdAndOwnerId(dto.getSessionId(), ownerId).orElse(null);
        }

        Asset asset = null;
        if (dto.getAssetId() != null) {
            asset = assetRepository.findByIdAndOwnerId(dto.getAssetId(), ownerId).orElse(null);
        }

        AuditDiscrepancy discrepancy = AuditDiscrepancy.builder()
                .ownerId(ownerId)
                .auditSession(session)
                .asset(asset)
                .unregisteredTag(asset == null ? dto.getAssetTag() : null)
                .unregisteredName(asset == null ? dto.getAssetName() : null)
                .unregisteredSerial(asset == null ? dto.getSerialNumber() : null)
                .branchLocation(dto.getBranchLocation() != null ? dto.getBranchLocation() : (asset != null ? asset.getLocation() : "Unknown"))
                .severity(dto.getSeverity())
                .issue(dto.getIssue())
                .reportedBy(dto.getReportedBy() != null ? dto.getReportedBy() : "Auditor")
                .reportDate(LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : DiscrepancyStatus.INVESTIGATING)
                .actionRequired(dto.getActionRequired())
                .build();

        AuditDiscrepancy saved = discrepancyRepository.save(discrepancy);
        return mapDiscrepancyToDto(saved);
    }

    @Override
    @Transactional
    public AuditDiscrepancyResponseDto resolveDiscrepancy(UUID ownerId, UUID id, String remarks) {
        AuditDiscrepancy discrepancy = discrepancyRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Discrepancy record not found"));

        discrepancy.setStatus(DiscrepancyStatus.RESOLVED);
        if (remarks != null && !remarks.trim().isEmpty()) {
            discrepancy.setActionRequired((discrepancy.getActionRequired() != null ? discrepancy.getActionRequired() + " | " : "") + "Resolved: " + remarks);
        }

        AuditDiscrepancy saved = discrepancyRepository.save(discrepancy);
        return mapDiscrepancyToDto(saved);
    }

    private AuditSession findSessionOrThrow(UUID ownerId, UUID id) {
        return sessionRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit session not found with ID: " + id));
    }

    private AuditSessionResponseDto mapSessionToDto(AuditSession s, UUID ownerId) {
        int total = itemRepository.countByAuditSessionAndOwnerId(s, ownerId);
        int verified = itemRepository.countByAuditSessionAndVerifiedTrueAndOwnerId(s, ownerId);
        int discCount = discrepancyRepository.countByAuditSessionAndOwnerId(s, ownerId);

        return AuditSessionResponseDto.builder()
                .id(s.getId())
                .sessionCode(s.getSessionCode())
                .title(s.getTitle())
                .branchLocation(s.getBranchLocation())
                .auditorName(s.getAuditorName())
                .startDate(s.getStartDate())
                .targetDate(s.getTargetDate())
                .status(s.getStatus())
                .reconciliationScore(s.getReconciliationScore() != null ? s.getReconciliationScore() : 0.0)
                .certificateHash(s.getCertificateHash())
                .certifiedBy(s.getCertifiedBy())
                .certifiedDate(s.getCertifiedDate())
                .totalItems(total)
                .verifiedItems(verified)
                .discrepanciesCount(discCount)
                .createdAt(s.getCreatedAt())
                .build();
    }

    private AuditDiscrepancyResponseDto mapDiscrepancyToDto(AuditDiscrepancy d) {
        return AuditDiscrepancyResponseDto.builder()
                .id(d.getId())
                .sessionId(d.getAuditSession() != null ? d.getAuditSession().getId() : null)
                .assetId(d.getAsset() != null ? d.getAsset().getId() : null)
                .assetTag(d.getAssetTag())
                .assetName(d.getAssetName())
                .serialNumber(d.getSerialNumber())
                .branchLocation(d.getBranchLocation())
                .severity(d.getSeverity())
                .issue(d.getIssue())
                .reportedBy(d.getReportedBy())
                .reportDate(d.getReportDate())
                .status(d.getStatus())
                .actionRequired(d.getActionRequired())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }
}

