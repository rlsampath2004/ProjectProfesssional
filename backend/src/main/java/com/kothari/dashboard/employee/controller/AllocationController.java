package com.kothari.dashboard.employee.controller;

import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.employee.dto.AllocationRequestDto;
import com.kothari.dashboard.employee.dto.AllocationResponseDto;
import com.kothari.dashboard.employee.dto.AllocationReturnDto;
import com.kothari.dashboard.employee.dto.HandoverReceiptDto;
import com.kothari.dashboard.employee.entity.AllocationStatus;
import com.kothari.dashboard.employee.service.AllocationService;
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
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    private static final UUID DEFAULT_OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private UUID resolveOwnerId(Principal principal) {
        if (principal == null) {
            return DEFAULT_OWNER_ID;
        }
        if (principal instanceof org.springframework.security.core.Authentication auth) {
            if (auth.getPrincipal() instanceof com.kothari.dashboard.auth.entity.User user) {
                return user.getId();
            }
        }
        if (principal.getName() != null) {
            try {
                return UUID.fromString(principal.getName());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return DEFAULT_OWNER_ID;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AllocationResponseDto>>> getAllocations(
            Principal principal,
            @RequestParam(required = false) AllocationStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UUID ownerId = resolveOwnerId(principal);
        PageResponse<AllocationResponseDto> response = allocationService.getAllAllocations(ownerId, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AllocationResponseDto>> getAllocationById(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        AllocationResponseDto response = allocationService.getAllocationById(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AllocationResponseDto>> allocateAsset(
            Principal principal,
            @Valid @RequestBody AllocationRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        String authorizedBy = principal != null ? principal.getName() : "CEO Admin";
        AllocationResponseDto response = allocationService.allocateAsset(ownerId, requestDto, authorizedBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Asset custody allocated successfully", response));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<AllocationResponseDto>> returnAsset(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AllocationReturnDto returnDto) {

        UUID ownerId = resolveOwnerId(principal);
        AllocationResponseDto response = allocationService.returnAsset(ownerId, id, returnDto);
        return ResponseEntity.ok(ApiResponse.ok("Asset return processed successfully", response));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<ApiResponse<HandoverReceiptDto>> getHandoverReceipt(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        HandoverReceiptDto receipt = allocationService.getHandoverReceipt(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(receipt));
    }
}

