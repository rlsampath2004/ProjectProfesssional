package com.kothari.dashboard.employee.controller;

import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.employee.dto.EmployeeRequestDto;
import com.kothari.dashboard.employee.dto.EmployeeResponseDto;
import com.kothari.dashboard.employee.dto.ExitClearanceDto;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import com.kothari.dashboard.employee.service.EmployeeService;
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
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    private static final UUID DEFAULT_OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private UUID resolveOwnerId(Principal principal) {
        if (principal == null || principal.getName() == null) return DEFAULT_OWNER_ID;
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return DEFAULT_OWNER_ID;
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponseDto>>> getEmployees(
            Principal principal,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UUID ownerId = resolveOwnerId(principal);
        PageResponse<EmployeeResponseDto> response = employeeService.getAllEmployees(ownerId, status, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> getEmployeeById(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        EmployeeResponseDto response = employeeService.getEmployeeById(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> createEmployee(
            Principal principal,
            @Valid @RequestBody EmployeeRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        EmployeeResponseDto created = employeeService.createEmployee(ownerId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Employee registered successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> updateEmployee(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody EmployeeRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        EmployeeResponseDto updated = employeeService.updateEmployee(ownerId, id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Employee profile updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        employeeService.deleteEmployee(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok("Employee removed successfully", null));
    }

    @GetMapping("/{id}/clearance")
    public ResponseEntity<ApiResponse<ExitClearanceDto>> getExitClearance(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        ExitClearanceDto clearance = employeeService.getExitClearance(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(clearance));
    }
}

