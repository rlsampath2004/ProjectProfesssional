package com.kothari.dashboard.dashboard.service.impl;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.audit.entity.AuditSessionStatus;
import com.kothari.dashboard.audit.repository.AuditDiscrepancyRepository;
import com.kothari.dashboard.audit.repository.AuditSessionRepository;
import com.kothari.dashboard.dashboard.dto.DashboardOverviewDto;
import com.kothari.dashboard.dashboard.service.DashboardKpiService;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import com.kothari.dashboard.employee.repository.EmployeeRepository;
import com.kothari.dashboard.olx.entity.OlxListingStatus;
import com.kothari.dashboard.olx.repository.OlxListingRepository;
import com.kothari.dashboard.olx.repository.OlxSaleRepository;
import com.kothari.dashboard.security.repository.SecurityEventRepository;
import com.kothari.dashboard.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class DashboardKpiServiceImpl implements DashboardKpiService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditSessionRepository sessionRepository;
    private final AuditDiscrepancyRepository discrepancyRepository;
    private final OlxListingRepository olxListingRepository;
    private final OlxSaleRepository olxSaleRepository;
    private final TaskRepository taskRepository;
    private final SecurityEventRepository securityEventRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardOverviewDto getDashboardOverview(UUID ownerId) {
        List<Asset> assets = assetRepository.findByOwnerId(ownerId);
        int totalAssets = assets.size();
        int allocated = (int) assets.stream().filter(a -> a.getStatus() == AssetStatus.ALLOCATED).count();
        int inStore = (int) assets.stream().filter(a -> a.getStatus() == AssetStatus.IN_STORE).count();
        BigDecimal totalValuation = assets.stream()
                .map(a -> a.getPurchaseCost() != null ? a.getPurchaseCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int activeEmployees = employeeRepository.findByOwnerIdAndStatus(ownerId, EmployeeStatus.ACTIVE, Pageable.unpaged()).getNumberOfElements();
        int pendingAudits = sessionRepository.findByOwnerIdAndStatus(ownerId, AuditSessionStatus.IN_PROGRESS, Pageable.unpaged()).getNumberOfElements();
        int totalDiscrepancies = discrepancyRepository.countByOwnerId(ownerId);

        int olxActive = olxListingRepository.countByOwnerIdAndStatus(ownerId, OlxListingStatus.ACTIVE);
        int olxSoldToday = olxSaleRepository.countByOwnerIdAndDateSold(ownerId, LocalDate.now());
        BigDecimal olxRevenueToday = olxSaleRepository.sumRevenueByOwnerIdAndDateSold(ownerId, LocalDate.now());

        int completedTasks = taskRepository.countByOwnerIdAndCompletedTrue(ownerId);
        int totalTasks = taskRepository.countByOwnerId(ownerId);
        int completionRate = totalTasks > 0 ? Math.round((completedTasks * 100.0f) / totalTasks) : 0;

        int securityAlerts = (int) securityEventRepository.count();

        return DashboardOverviewDto.builder()
                .totalAssetsCount(totalAssets)
                .allocatedAssetsCount(allocated)
                .inStoreAssetsCount(inStore)
                .totalAssetValuation(totalValuation)
                .activeEmployeesCount(activeEmployees)
                .pendingAuditsCount(pendingAudits)
                .totalDiscrepanciesCount(totalDiscrepancies)
                .olxActiveListingsCount(olxActive)
                .olxSoldTodayCount(olxSoldToday)
                .olxRevenueToday(olxRevenueToday != null ? olxRevenueToday : BigDecimal.ZERO)
                .completedTasksCount(completedTasks)
                .totalTasksCount(totalTasks)
                .taskCompletionRate(completionRate)
                .securityAlertsCount(securityAlerts)
                .build();
    }
}
