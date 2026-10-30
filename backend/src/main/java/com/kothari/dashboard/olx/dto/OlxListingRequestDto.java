package com.kothari.dashboard.olx.dto;

import com.kothari.dashboard.olx.entity.OlxListingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OlxListingRequestDto {

    private UUID assetId;

    private String assetTag;

    @NotBlank(message = "Listing title is required")
    @Size(max = 200, message = "Listing title cannot exceed 200 characters")
    private String title;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotNull(message = "Asking price is required")
    @PositiveOrZero(message = "Asking price must be positive")
    private BigDecimal askingPrice;

    @PositiveOrZero(message = "Expected price must be positive")
    private BigDecimal expectedPrice;

    @Size(max = 300, message = "OLX URL cannot exceed 300 characters")
    private String olxUrl;

    @Size(max = 50, message = "OLX Ad ID cannot exceed 50 characters")
    private String olxAdId;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    private OlxListingStatus status;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}

