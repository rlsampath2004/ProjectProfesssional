package com.kothari.dashboard.olx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OlxKpiDto {

    private int soldTodayCount;
    private BigDecimal revenueSoldToday;
    private BigDecimal expectedSalesToday;
    private BigDecimal totalSalesRealized;
    private int pendingListingsCount;
}

