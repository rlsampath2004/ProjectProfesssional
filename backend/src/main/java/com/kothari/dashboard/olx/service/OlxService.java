package com.kothari.dashboard.olx.service;

import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.olx.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OlxService {

    List<OlxListingResponseDto> getAllListings(UUID ownerId, String status, String category, String query);

    OlxListingResponseDto getListingById(UUID ownerId, UUID id);

    OlxListingResponseDto createListing(UUID ownerId, OlxListingRequestDto dto);

    OlxListingResponseDto updateListing(UUID ownerId, UUID id, OlxListingRequestDto dto);

    OlxListingResponseDto markSold(UUID ownerId, UUID id, OlxSaleRequestDto dto);

    void deleteListing(UUID ownerId, UUID id);

    OlxKpiDto getKpis(UUID ownerId);

    PageResponse<OlxSaleResponseDto> getSalesHistory(UUID ownerId, Pageable pageable);
}

