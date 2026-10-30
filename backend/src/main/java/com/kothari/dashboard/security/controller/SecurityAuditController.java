package com.kothari.dashboard.security.controller;

import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.security.entity.SecurityEvent;
import com.kothari.dashboard.security.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityAuditController {

    private final SecurityEventRepository securityEventRepository;

    @GetMapping("/events")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<PageResponse<SecurityEvent>>> getSecurityAuditEvents(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        var page = securityEventRepository.findByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }
}

