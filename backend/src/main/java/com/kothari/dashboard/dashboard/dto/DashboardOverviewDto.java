package com.kothari.dashboard.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDto {

    private int totalAssetsCount;
    private int allocatedAssetsCount;
    private int inStoreAssetsCount;
    private BigDecimal totalAssetValuation;

    private int activeEmployeesCount;
    private int pendingAuditsCount;
    private int totalDiscrepanciesCount;

    private int olxActiveListingsCount;
    private int olxSoldTodayCount;
    private BigDecimal olxRevenueToday;

    private int completedTasksCount;
    private int totalTasksCount;
    private int taskCompletionRate;

    private int securityAlertsCount;
}

