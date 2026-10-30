package com.kothari.dashboard.olx.dto;

import com.kothari.dashboard.olx.entity.PaymentMode;
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
public class OlxSaleResponseDto {

    private UUID id;
    private UUID listingId;
    private UUID assetId;
    private String assetTag;
    private String assetName;
    private String saleReceiptNumber;
    private BigDecimal soldPrice;
    private String buyerName;
    private String buyerPhone;
    private PaymentMode paymentMode;
    private LocalDate dateSold;
    private BigDecimal netProfitLoss;
    private String notes;
    private LocalDateTime createdAt;
}

