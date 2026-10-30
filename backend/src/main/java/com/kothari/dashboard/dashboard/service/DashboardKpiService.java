package com.kothari.dashboard.dashboard.service;

import com.kothari.dashboard.dashboard.dto.DashboardOverviewDto;

import java.util.UUID;

public interface DashboardKpiService {

    DashboardOverviewDto getDashboardOverview(UUID ownerId);
}

