package com.kothari.dashboard.employee.service;

import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.employee.dto.AllocationRequestDto;
import com.kothari.dashboard.employee.dto.AllocationResponseDto;
import com.kothari.dashboard.employee.dto.AllocationReturnDto;
import com.kothari.dashboard.employee.dto.HandoverReceiptDto;
import com.kothari.dashboard.employee.entity.AllocationStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AllocationService {

    AllocationResponseDto allocateAsset(UUID ownerId, AllocationRequestDto dto, String authorizedBy);

    AllocationResponseDto returnAsset(UUID ownerId, UUID allocationId, AllocationReturnDto dto);

    PageResponse<AllocationResponseDto> getAllAllocations(UUID ownerId, AllocationStatus status, Pageable pageable);

    AllocationResponseDto getAllocationById(UUID ownerId, UUID id);

    HandoverReceiptDto getHandoverReceipt(UUID ownerId, UUID allocationId);
}

