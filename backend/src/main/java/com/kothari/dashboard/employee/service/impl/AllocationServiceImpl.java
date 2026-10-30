package com.kothari.dashboard.employee.service.impl;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetHistory;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.repository.AssetHistoryRepository;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.employee.dto.AllocationRequestDto;
import com.kothari.dashboard.employee.dto.AllocationResponseDto;
import com.kothari.dashboard.employee.dto.AllocationReturnDto;
import com.kothari.dashboard.employee.dto.HandoverReceiptDto;
import com.kothari.dashboard.employee.entity.Allocation;
import com.kothari.dashboard.employee.entity.AllocationStatus;
import com.kothari.dashboard.employee.entity.Employee;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import com.kothari.dashboard.employee.repository.AllocationRepository;
import com.kothari.dashboard.employee.repository.EmployeeRepository;
import com.kothari.dashboard.employee.service.AllocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AllocationServiceImpl implements AllocationService {

    private final AllocationRepository allocationRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetHistoryRepository assetHistoryRepository;

    @Override
    @Transactional
    public AllocationResponseDto allocateAsset(UUID ownerId, AllocationRequestDto dto, String authorizedBy) {
        Asset asset = assetRepository.findByIdAndOwnerId(dto.getAssetId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + dto.getAssetId()));

        if (asset.getStatus() == AssetStatus.ALLOCATED) {
            throw new IllegalStateException("Asset '" + asset.getAssetTag() + "' is already allocated to: " + asset.getAssignedEmployeeName());
        }

        Employee employee = employeeRepository.findByIdAndOwnerId(dto.getEmployeeId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.getEmployeeId()));

        if (employee.getStatus() == EmployeeStatus.RESIGNED || employee.getStatus() == EmployeeStatus.TERMINATED) {
            throw new IllegalStateException("Cannot allocate assets to an exited or inactive employee.");
        }

        // Generate unique human-readable receipt number
        String receiptNumber = "RCP-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" + (System.currentTimeMillis() % 10000);

        LocalDate issueDate = dto.getIssueDate() != null ? dto.getIssueDate() : LocalDate.now();
        String condition = dto.getIssueCondition() != null ? dto.getIssueCondition() : asset.getCondition();

        Allocation allocation = Allocation.builder()
                .ownerId(ownerId)
                .asset(asset)
                .employee(employee)
                .receiptNumber(receiptNumber)
                .issueDate(issueDate)
                .expectedReturnDate(dto.getExpectedReturnDate())
                .issueCondition(condition)
                .status(AllocationStatus.ACTIVE)
                .undertakingAccepted(dto.isUndertakingAccepted())
                .authorizedBy(authorizedBy != null ? authorizedBy : "CEO / Admin")
                .build();

        Allocation savedAllocation = allocationRepository.save(allocation);

        // Update Asset state
        AssetStatus prevStatus = asset.getStatus();
        String prevHolder = asset.getAssignedEmployeeName();

        asset.setStatus(AssetStatus.ALLOCATED);
        asset.setAssignedEmployee(employee);
        assetRepository.save(asset);

        // Record immutable audit history
        AssetHistory history = AssetHistory.builder()
                .ownerId(ownerId)
                .asset(asset)
                .previousStatus(prevStatus)
                .newStatus(AssetStatus.ALLOCATED)
                .previousLocation(asset.getLocation())
                .newLocation(asset.getLocation())
                .previousHolder(prevHolder)
                .newHolder(employee.getFullName())
                .changeReason("Allocated under Receipt " + receiptNumber)
                .build();
        assetHistoryRepository.save(history);

        log.info("Asset {} allocated to employee {} under receipt {}", asset.getAssetTag(), employee.getFullName(), receiptNumber);
        return mapToDto(savedAllocation);
    }

    @Override
    @Transactional
    public AllocationResponseDto returnAsset(UUID ownerId, UUID allocationId, AllocationReturnDto dto) {
        Allocation allocation = allocationRepository.findByIdAndOwnerId(allocationId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with ID: " + allocationId));

        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new IllegalStateException("This allocation is already marked as " + allocation.getStatus());
        }

        LocalDate returnDate = dto.getReturnDate() != null ? dto.getReturnDate() : LocalDate.now();
        allocation.setActualReturnDate(returnDate);
        allocation.setReturnCondition(dto.getReturnCondition());
        allocation.setReturnNotes(dto.getReturnNotes());
        allocation.setStatus(AllocationStatus.RETURNED);

        Allocation updatedAllocation = allocationRepository.save(allocation);

        // Update Asset state
        Asset asset = allocation.getAsset();
        AssetStatus newStatus = "Damaged".equalsIgnoreCase(dto.getReturnCondition())
                ? AssetStatus.MAINTENANCE
                : AssetStatus.IN_STORE;

        AssetStatus prevStatus = asset.getStatus();
        String prevHolder = asset.getAssignedEmployeeName();

        asset.setStatus(newStatus);
        asset.setCondition(dto.getReturnCondition());
        asset.setAssignedEmployee(null);
        assetRepository.save(asset);

        // Record history
        AssetHistory history = AssetHistory.builder()
                .ownerId(ownerId)
                .asset(asset)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .previousLocation(asset.getLocation())
                .newLocation(asset.getLocation())
                .previousHolder(prevHolder)
                .newHolder("Returned to Inventory")
                .changeReason("Custody Returned: " + (dto.getReturnNotes() != null ? dto.getReturnNotes() : "Standard Check-in"))
                .build();
        assetHistoryRepository.save(history);

        log.info("Asset {} returned by employee {}", asset.getAssetTag(), allocation.getEmployee().getFullName());
        return mapToDto(updatedAllocation);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AllocationResponseDto> getAllAllocations(UUID ownerId, AllocationStatus status, Pageable pageable) {
        Page<Allocation> page = status != null
                ? allocationRepository.findByOwnerIdAndStatus(ownerId, status, pageable)
                : allocationRepository.findByOwnerId(ownerId, pageable);

        return PageResponse.from(page.map(this::mapToDto));
    }

    @Override
    @Transactional(readOnly = true)
    public AllocationResponseDto getAllocationById(UUID ownerId, UUID id) {
        Allocation allocation = allocationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with ID: " + id));
        return mapToDto(allocation);
    }

    @Override
    @Transactional(readOnly = true)
    public HandoverReceiptDto getHandoverReceipt(UUID ownerId, UUID allocationId) {
        Allocation alloc = allocationRepository.findByIdAndOwnerId(allocationId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found"));

        Employee emp = alloc.getEmployee();
        Asset ast = alloc.getAsset();

        String clause = "I hereby acknowledge receipt of the corporate IT hardware/SIM asset listed above in fully functioning condition. " +
                "I agree to safeguard this equipment in compliance with Kothari Distributors IT Security & Acceptable Use Policy, " +
                "refrain from unauthorized installation of unlicensed software, and surrender this asset immediately upon request or notice of resignation.";

        return HandoverReceiptDto.builder()
                .allocationId(alloc.getId())
                .receiptNumber(alloc.getReceiptNumber())
                .issueDate(alloc.getIssueDate())
                .expectedReturnDate(alloc.getExpectedReturnDate())
                .employeeCode(emp.getEmployeeCode())
                .employeeName(emp.getFullName())
                .department(emp.getDepartment())
                .designation(emp.getDesignation())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .assetTag(ast.getAssetTag())
                .assetName(ast.getName())
                .serialNumber(ast.getSerialNumber())
                .brand(ast.getBrand())
                .model(ast.getModel())
                .condition(alloc.getIssueCondition())
                .estimatedValue(ast.getPurchaseCost() != null ? ast.getPurchaseCost() : BigDecimal.ZERO)
                .undertakingClause(clause)
                .authorizedBy(alloc.getAuthorizedBy())
                .digitallyAccepted(alloc.isUndertakingAccepted())
                .build();
    }

    private AllocationResponseDto mapToDto(Allocation a) {
        return AllocationResponseDto.builder()
                .id(a.getId())
                .receiptNumber(a.getReceiptNumber())
                .assetId(a.getAsset().getId())
                .assetTag(a.getAsset().getAssetTag())
                .assetName(a.getAsset().getName())
                .assetSerialNumber(a.getAsset().getSerialNumber())
                .employeeId(a.getEmployee().getId())
                .employeeCode(a.getEmployee().getEmployeeCode())
                .employeeName(a.getEmployee().getFullName())
                .department(a.getEmployee().getDepartment())
                .issueDate(a.getIssueDate())
                .expectedReturnDate(a.getExpectedReturnDate())
                .actualReturnDate(a.getActualReturnDate())
                .issueCondition(a.getIssueCondition())
                .returnCondition(a.getReturnCondition())
                .status(a.getStatus())
                .undertakingAccepted(a.isUndertakingAccepted())
                .authorizedBy(a.getAuthorizedBy())
                .returnNotes(a.getReturnNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

