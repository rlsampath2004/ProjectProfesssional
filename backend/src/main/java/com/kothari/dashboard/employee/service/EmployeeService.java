package com.kothari.dashboard.employee.service;

import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.employee.dto.EmployeeRequestDto;
import com.kothari.dashboard.employee.dto.EmployeeResponseDto;
import com.kothari.dashboard.employee.dto.ExitClearanceDto;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EmployeeService {

    PageResponse<EmployeeResponseDto> getAllEmployees(UUID ownerId, EmployeeStatus status, String query, Pageable pageable);

    EmployeeResponseDto getEmployeeById(UUID ownerId, UUID id);

    EmployeeResponseDto createEmployee(UUID ownerId, EmployeeRequestDto dto);

    EmployeeResponseDto updateEmployee(UUID ownerId, UUID id, EmployeeRequestDto dto);

    void deleteEmployee(UUID ownerId, UUID id);

    ExitClearanceDto getExitClearance(UUID ownerId, UUID employeeId);
}

