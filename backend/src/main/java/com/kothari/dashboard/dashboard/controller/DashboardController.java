package com.kothari.dashboard.dashboard.controller;

import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.dashboard.dto.DashboardOverviewDto;
import com.kothari.dashboard.dashboard.service.DashboardKpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class DashboardController {

    private final DashboardKpiService dashboardKpiService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewDto>> getDashboardOverview(@AuthenticationPrincipal User currentUser) {
        DashboardOverviewDto overview = dashboardKpiService.getDashboardOverview(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }
}

