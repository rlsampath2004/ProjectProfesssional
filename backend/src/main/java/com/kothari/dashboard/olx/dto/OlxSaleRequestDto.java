package com.kothari.dashboard.olx.dto;

import com.kothari.dashboard.olx.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OlxSaleRequestDto {

    @NotNull(message = "Sold price is required")
    @PositiveOrZero(message = "Sold price must be positive")
    private BigDecimal soldPrice;

    @Size(max = 150, message = "Buyer name cannot exceed 150 characters")
    private String buyerName;

    @Size(max = 50, message = "Buyer phone cannot exceed 50 characters")
    private String buyerPhone;

    private PaymentMode paymentMode;

    private LocalDate dateSold;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}

