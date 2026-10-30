package com.kothari.dashboard.asset.service.impl;

import com.kothari.dashboard.asset.dto.*;
import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetHistory;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import com.kothari.dashboard.asset.repository.AssetHistoryRepository;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.asset.service.AssetService;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.common.exception.DuplicateResourceException;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.employee.entity.Employee;
import com.kothari.dashboard.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final AssetHistoryRepository assetHistoryRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AssetResponseDto> getAllAssets(UUID ownerId, AssetStatus status, AssetType type, String query, Pageable pageable) {
        Page<Asset> page;
        if (query != null && !query.trim().isEmpty()) {
            page = assetRepository.searchAssets(ownerId, query.trim(), pageable);
        } else if (status != null) {
            page = assetRepository.findByOwnerIdAndStatus(ownerId, status, pageable);
        } else if (type != null) {
            page = assetRepository.findByOwnerIdAndType(ownerId, type, pageable);
        } else {
            page = assetRepository.findByOwnerId(ownerId, pageable);
        }

        Page<AssetResponseDto> dtoPage = page.map(this::mapToDto);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponseDto getAssetById(UUID ownerId, UUID id) {
        Asset asset = findAssetOrThrow(ownerId, id);
        return mapToDto(asset);
    }

    @Override
    @Transactional
    public AssetResponseDto createAsset(UUID ownerId, AssetRequestDto dto) {
        // Enforce uniqueness of serial number for this owner
        if (assetRepository.existsBySerialNumberAndOwnerId(dto.getSerialNumber(), ownerId)) {
            throw new DuplicateResourceException("An asset with serial number '" + dto.getSerialNumber() + "' already exists.");
        }

        Employee assignedEmp = resolveEmployee(ownerId, dto.getAssignedEmployeeId());

        Asset asset = Asset.builder()
                .ownerId(ownerId)
                .assetTag(dto.getAssetTag())
                .name(dto.getName())
                .type(dto.getType())
                .serialNumber(dto.getSerialNumber())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .purchaseDate(dto.getPurchaseDate() != null ? dto.getPurchaseDate() : LocalDate.now())
                .purchaseCost(dto.getPurchaseCost() != null ? dto.getPurchaseCost() : BigDecimal.ZERO)
                .warrantyExpiry(dto.getWarrantyExpiry())
                .amcExpiry(dto.getAmcExpiry())
                .status(dto.getStatus() != null ? dto.getStatus() : AssetStatus.IN_STORE)
                .condition(dto.getCondition() != null ? dto.getCondition() : "Good")
                .location(dto.getLocation() != null ? dto.getLocation() : "Main Office")
                .assignedEmployee(assignedEmp)
                .notes(dto.getNotes())
                .build();

        Asset saved = assetRepository.save(asset);

        // Record initial history
        recordHistory(ownerId, saved, null, saved.getStatus(), null, saved.getLocation(), null, saved.getAssignedEmployeeName(), "Asset Initial Enrollment");

        log.info("Asset created successfully with tag: {} and id: {}", saved.getAssetTag(), saved.getId());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public AssetResponseDto updateAsset(UUID ownerId, UUID id, AssetRequestDto dto) {
        Asset asset = findAssetOrThrow(ownerId, id);

        // Verify serial uniqueness excluding current record
        if (assetRepository.existsBySerialNumberAndOwnerIdAndIdNot(dto.getSerialNumber(), ownerId, id)) {
            throw new DuplicateResourceException("Another asset with serial number '" + dto.getSerialNumber() + "' already exists.");
        }

        // Track potential changes for history
        AssetStatus oldStatus = asset.getStatus();
        String oldLocation = asset.getLocation();
        String oldHolder = asset.getAssignedEmployeeName();

        asset.setAssetTag(dto.getAssetTag());
        asset.setName(dto.getName());
        asset.setType(dto.getType());
        asset.setSerialNumber(dto.getSerialNumber());
        asset.setBrand(dto.getBrand());
        asset.setModel(dto.getModel());
        asset.setPurchaseDate(dto.getPurchaseDate());
        asset.setPurchaseCost(dto.getPurchaseCost());
        asset.setWarrantyExpiry(dto.getWarrantyExpiry());
        asset.setAmcExpiry(dto.getAmcExpiry());
        if (dto.getStatus() != null) asset.setStatus(dto.getStatus());
        if (dto.getCondition() != null) asset.setCondition(dto.getCondition());
        if (dto.getLocation() != null) asset.setLocation(dto.getLocation());
        if (dto.getAssignedEmployeeId() != null) {
            asset.setAssignedEmployee(resolveEmployee(ownerId, dto.getAssignedEmployeeId()));
        } else if (dto.getAssignedEmployeeName() == null) {
            asset.setAssignedEmployee(null);
        }
        asset.setNotes(dto.getNotes());

        Asset updated = assetRepository.save(asset);

        if (oldStatus != updated.getStatus() || !Objects.equals(oldLocation, updated.getLocation()) || !Objects.equals(oldHolder, updated.getAssignedEmployeeName())) {
            recordHistory(ownerId, updated, oldStatus, updated.getStatus(), oldLocation, updated.getLocation(), oldHolder, updated.getAssignedEmployeeName(), "Asset Details Update");
        }

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteAsset(UUID ownerId, UUID id) {
        Asset asset = findAssetOrThrow(ownerId, id);
        asset.setDeleted(true);
        assetRepository.save(asset);
        log.info("Soft deleted asset id: {} for owner: {}", id, ownerId);
    }

    @Override
    @Transactional
    public AssetResponseDto updateAssetStatus(UUID ownerId, UUID id, AssetStatusUpdateDto dto) {
        Asset asset = findAssetOrThrow(ownerId, id);

        AssetStatus prevStatus = asset.getStatus();
        String prevLocation = asset.getLocation();
        String prevHolder = asset.getAssignedEmployeeName();

        asset.setStatus(dto.getNewStatus());
        if (dto.getNewLocation() != null && !dto.getNewLocation().trim().isEmpty()) {
            asset.setLocation(dto.getNewLocation().trim());
        }
        if (dto.getAssignedEmployeeId() != null) {
            asset.setAssignedEmployee(resolveEmployee(ownerId, dto.getAssignedEmployeeId()));
        }

        Asset saved = assetRepository.save(asset);

        recordHistory(ownerId, saved, prevStatus, saved.getStatus(), prevLocation, saved.getLocation(), prevHolder, saved.getAssignedEmployeeName(), dto.getReason());

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetHistoryResponseDto> getAssetHistory(UUID ownerId, UUID id) {
        findAssetOrThrow(ownerId, id);
        return assetHistoryRepository.findByAssetIdAndOwnerIdOrderByCreatedAtDesc(id, ownerId)
                .stream()
                .map(this::mapHistoryToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AssetDepreciationDto calculateDepreciation(UUID ownerId, UUID id) {
        Asset asset = findAssetOrThrow(ownerId, id);
        BigDecimal cost = asset.getPurchaseCost() != null ? asset.getPurchaseCost() : BigDecimal.ZERO;
        LocalDate purchase = asset.getPurchaseDate() != null ? asset.getPurchaseDate() : LocalDate.now();

        long days = ChronoUnit.DAYS.between(purchase, LocalDate.now());
        double ageYears = Math.max(0.0, days / 365.25);

        // Indian Companies Act 2013 / IT Schedule: 40% WDV for Computers/Laptops, 15% for others
        double annualRate = (asset.getType() == AssetType.LAPTOP || asset.getType() == AssetType.DESKTOP || asset.getType() == AssetType.SERVER) ? 0.40 : 0.15;

        // WDV = Cost * (1 - rate)^years
        double residualMultiplier = Math.pow(1.0 - annualRate, ageYears);
        BigDecimal bookValue = cost.multiply(BigDecimal.valueOf(residualMultiplier)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal minScrapValue = cost.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP); // 5% statutory residual
        if (bookValue.compareTo(minScrapValue) < 0) {
            bookValue = minScrapValue;
        }

        BigDecimal totalDepreciation = cost.subtract(bookValue).setScale(2, RoundingMode.HALF_UP);
        boolean eligibleForSalvage = ageYears >= 3.0 || (cost.compareTo(BigDecimal.ZERO) > 0 && bookValue.divide(cost, 4, RoundingMode.HALF_UP).doubleValue() <= 0.25);

        String recommendation = eligibleForSalvage
                ? "Asset is over 3 years old or under 25% book value. Recommended for OLX Salvage / Employee Buyback."
                : "Active serviceable lifecycle. Continue standard operational maintenance.";

        return AssetDepreciationDto.builder()
                .assetId(asset.getId())
                .assetTag(asset.getAssetTag())
                .assetName(asset.getName())
                .originalCost(cost)
                .ageInYears(Math.round(ageYears * 10.0) / 10.0)
                .annualRatePercentage(annualRate * 100.0)
                .currentBookValue(bookValue)
                .totalDepreciation(totalDepreciation)
                .eligibleForSalvage(eligibleForSalvage)
                .recommendation(recommendation)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDto> getAllForExport(UUID ownerId) {
        return assetRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToDto)
                .toList();
    }

    private void recordHistory(UUID ownerId, Asset asset, AssetStatus prevStatus, AssetStatus newStatus,
                               String prevLoc, String newLoc, String prevHolder, String newHolder, String reason) {
        AssetHistory history = AssetHistory.builder()
                .ownerId(ownerId)
                .asset(asset)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .previousLocation(prevLoc)
                .newLocation(newLoc)
                .previousHolder(prevHolder)
                .newHolder(newHolder)
                .changeReason(reason != null ? reason : "Status Updated")
                .build();
        assetHistoryRepository.save(history);
    }

    private Asset findAssetOrThrow(UUID ownerId, UUID id) {
        return assetRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
    }

    private AssetResponseDto mapToDto(Asset a) {
        return AssetResponseDto.builder()
                .id(a.getId())
                .assetTag(a.getAssetTag())
                .name(a.getName())
                .type(a.getType())
                .serialNumber(a.getSerialNumber())
                .brand(a.getBrand())
                .model(a.getModel())
                .purchaseDate(a.getPurchaseDate())
                .purchaseCost(a.getPurchaseCost())
                .warrantyExpiry(a.getWarrantyExpiry())
                .amcExpiry(a.getAmcExpiry())
                .status(a.getStatus())
                .condition(a.getCondition())
                .location(a.getLocation())
                .assignedEmployeeId(a.getAssignedEmployee() != null ? a.getAssignedEmployee().getEmployeeCode() : null)
                .assignedEmployeeName(a.getAssignedEmployee() != null ? a.getAssignedEmployee().getFullName() : null)
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    private Employee resolveEmployee(UUID ownerId, String employeeIdOrCode) {
        if (employeeIdOrCode == null || employeeIdOrCode.trim().isEmpty()) {
            return null;
        }
        String clean = employeeIdOrCode.trim();
        try {
            UUID uuid = UUID.fromString(clean);
            return employeeRepository.findByIdAndOwnerId(uuid, ownerId).orElse(null);
        } catch (IllegalArgumentException e) {
            return employeeRepository.findByEmployeeCodeAndOwnerId(clean, ownerId).orElse(null);
        }
    }

    private AssetHistoryResponseDto mapHistoryToDto(AssetHistory h) {
        return AssetHistoryResponseDto.builder()
                .id(h.getId())
                .assetId(h.getAsset().getId())
                .previousStatus(h.getPreviousStatus())
                .newStatus(h.getNewStatus())
                .previousLocation(h.getPreviousLocation())
                .newLocation(h.getNewLocation())
                .previousHolder(h.getPreviousHolder())
                .newHolder(h.getNewHolder())
                .changeReason(h.getChangeReason())
                .changedBy(h.getCreatedBy())
                .timestamp(h.getCreatedAt())
                .build();
    }
}

