package com.kothari.dashboard.olx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OlxListingResponseDto {

    private UUID id;
    private UUID assetId;
    private String assetTag;
    private String title;
    private String category;
    private String brand;
    private String model;
    private String serialNumber;
    private String condition;
    private LocalDate dateListed;
    private BigDecimal askingPrice;
    private BigDecimal expectedPrice;
    private BigDecimal soldPrice;
    private String status; // 'Active', 'Negotiating', 'Sold', 'Delisted'
    private String olxUrl;
    private String olxAdId;
    private int viewsCount;
    private int inquiriesCount;
    private String buyerName;
    private String buyerPhone;
    private String paymentMode;
    private LocalDate dateSold;
    private boolean soldToday;
    private String location;
    private String notes;
    private LocalDateTime createdAt;
}

