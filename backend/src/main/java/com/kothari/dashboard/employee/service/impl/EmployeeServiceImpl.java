package com.kothari.dashboard.employee.service.impl;

import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.common.exception.DuplicateResourceException;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.employee.dto.EmployeeRequestDto;
import com.kothari.dashboard.employee.dto.EmployeeResponseDto;
import com.kothari.dashboard.employee.dto.ExitClearanceDto;
import com.kothari.dashboard.employee.entity.Allocation;
import com.kothari.dashboard.employee.entity.AllocationStatus;
import com.kothari.dashboard.employee.entity.Employee;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import com.kothari.dashboard.employee.repository.AllocationRepository;
import com.kothari.dashboard.employee.repository.EmployeeRepository;
import com.kothari.dashboard.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponseDto> getAllEmployees(UUID ownerId, EmployeeStatus status, String query, Pageable pageable) {
        Page<Employee> page;
        if (query != null && !query.trim().isEmpty()) {
            page = employeeRepository.searchEmployees(ownerId, query.trim(), pageable);
        } else if (status != null) {
            page = employeeRepository.findByOwnerIdAndStatus(ownerId, status, pageable);
        } else {
            page = employeeRepository.findByOwnerId(ownerId, pageable);
        }

        Page<EmployeeResponseDto> dtoPage = page.map(e -> mapToDto(e, ownerId));
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployeeById(UUID ownerId, UUID id) {
        Employee employee = findEmployeeOrThrow(ownerId, id);
        return mapToDto(employee, ownerId);
    }

    @Override
    @Transactional
    public EmployeeResponseDto createEmployee(UUID ownerId, EmployeeRequestDto dto) {
        if (employeeRepository.existsByEmployeeCodeAndOwnerId(dto.getEmployeeCode().trim(), ownerId)) {
            throw new DuplicateResourceException("Employee code '" + dto.getEmployeeCode() + "' is already registered.");
        }

        Employee employee = Employee.builder()
                .ownerId(ownerId)
                .employeeCode(dto.getEmployeeCode().trim())
                .fullName(dto.getFullName().trim())
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .phone(dto.getPhone() != null ? dto.getPhone().trim() : null)
                .department(dto.getDepartment() != null ? dto.getDepartment().trim() : "General")
                .designation(dto.getDesignation() != null ? dto.getDesignation().trim() : "Staff")
                .status(dto.getStatus() != null ? dto.getStatus() : EmployeeStatus.ACTIVE)
                .joiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : LocalDate.now())
                .exitDate(dto.getExitDate())
                .notes(dto.getNotes())
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Enrolled employee: {} with code: {}", saved.getFullName(), saved.getEmployeeCode());
        return mapToDto(saved, ownerId);
    }

    @Override
    @Transactional
    public EmployeeResponseDto updateEmployee(UUID ownerId, UUID id, EmployeeRequestDto dto) {
        Employee employee = findEmployeeOrThrow(ownerId, id);

        if (employeeRepository.existsByEmployeeCodeAndOwnerIdAndIdNot(dto.getEmployeeCode().trim(), ownerId, id)) {
            throw new DuplicateResourceException("Another employee with code '" + dto.getEmployeeCode() + "' already exists.");
        }

        employee.setEmployeeCode(dto.getEmployeeCode().trim());
        employee.setFullName(dto.getFullName().trim());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        if (dto.getStatus() != null) employee.setStatus(dto.getStatus());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setExitDate(dto.getExitDate());
        employee.setNotes(dto.getNotes());

        Employee updated = employeeRepository.save(employee);
        return mapToDto(updated, ownerId);
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID ownerId, UUID id) {
        Employee employee = findEmployeeOrThrow(ownerId, id);
        int activeAllocations = allocationRepository.countByEmployeeIdAndOwnerIdAndStatus(id, ownerId, AllocationStatus.ACTIVE);
        if (activeAllocations > 0) {
            throw new IllegalStateException("Cannot delete employee holding " + activeAllocations + " active asset allocations. Please process return of all assets first.");
        }
        employee.setDeleted(true);
        employeeRepository.save(employee);
        log.info("Soft deleted employee: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public ExitClearanceDto getExitClearance(UUID ownerId, UUID employeeId) {
        Employee employee = findEmployeeOrThrow(ownerId, employeeId);
        List<Allocation> activeAllocations = allocationRepository.findByEmployeeIdAndOwnerIdAndStatus(employeeId, ownerId, AllocationStatus.ACTIVE);

        BigDecimal totalOutstandingValue = BigDecimal.ZERO;
        List<ExitClearanceDto.HeldAssetSummary> assetSummaries = new java.util.ArrayList<>();

        for (Allocation alloc : activeAllocations) {
            var asset = alloc.getAsset();
            BigDecimal cost = asset.getPurchaseCost() != null ? asset.getPurchaseCost() : BigDecimal.ZERO;
            totalOutstandingValue = totalOutstandingValue.add(cost);

            assetSummaries.add(ExitClearanceDto.HeldAssetSummary.builder()
                    .allocationId(alloc.getId())
                    .assetId(asset.getId())
                    .assetTag(asset.getAssetTag())
                    .assetName(asset.getName())
                    .serialNumber(asset.getSerialNumber())
                    .issueDate(alloc.getIssueDate())
                    .purchaseCost(cost)
                    .condition(alloc.getIssueCondition())
                    .build());
        }

        boolean cleared = activeAllocations.isEmpty();
        String message = cleared
                ? "Employee has zero outstanding company assets. Full IT exit clearance APPROVED."
                : String.format("Employee holds %d company assets totaling ₹%s. Clearance BLOCKED until all physical hardware is received.",
                    activeAllocations.size(), totalOutstandingValue.toPlainString());

        return ExitClearanceDto.builder()
                .employeeId(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .department(employee.getDepartment())
                .employeeStatus(employee.getStatus())
                .exitDate(employee.getExitDate())
                .outstandingAssetCount(activeAllocations.size())
                .totalOutstandingValue(totalOutstandingValue)
                .clearanceApproved(cleared)
                .statusMessage(message)
                .outstandingAssets(assetSummaries)
                .build();
    }

    private Employee findEmployeeOrThrow(UUID ownerId, UUID id) {
        return employeeRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
    }

    private EmployeeResponseDto mapToDto(Employee e, UUID ownerId) {
        int activeCount = allocationRepository.countByEmployeeIdAndOwnerIdAndStatus(e.getId(), ownerId, AllocationStatus.ACTIVE);
        return EmployeeResponseDto.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .department(e.getDepartment())
                .designation(e.getDesignation())
                .status(e.getStatus())
                .joiningDate(e.getJoiningDate())
                .exitDate(e.getExitDate())
                .notes(e.getNotes())
                .activeAllocationsCount(activeCount)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

