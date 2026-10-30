package com.kothari.dashboard.olx.controller;

import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.olx.dto.*;
import com.kothari.dashboard.olx.service.OlxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/olx")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OlxController {

    private final OlxService olxService;

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<OlxListingResponseDto>>> getListings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {

        List<OlxListingResponseDto> listings = olxService.getAllListings(currentUser.getId(), status, category, query);
        return ResponseEntity.ok(ApiResponse.ok(listings));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<OlxListingResponseDto>> getListingById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        OlxListingResponseDto dto = olxService.getListingById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<OlxListingResponseDto>> createListing(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody OlxListingRequestDto requestDto) {

        OlxListingResponseDto created = olxService.createListing(currentUser.getId(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("OLX listing published successfully", created));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<OlxListingResponseDto>> updateListing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody OlxListingRequestDto requestDto) {

        OlxListingResponseDto updated = olxService.updateListing(currentUser.getId(), id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("OLX listing updated successfully", updated));
    }

    @PostMapping("/listings/{id}/mark-sold")
    public ResponseEntity<ApiResponse<OlxListingResponseDto>> markSold(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody OlxSaleRequestDto requestDto) {

        OlxListingResponseDto result = olxService.markSold(currentUser.getId(), id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Device marked as SOLD and revenue recorded", result));
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        olxService.deleteListing(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Listing delisted successfully", null));
    }

    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<OlxKpiDto>> getKpis(@AuthenticationPrincipal User currentUser) {
        OlxKpiDto kpis = olxService.getKpis(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(kpis));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<PageResponse<OlxSaleResponseDto>>> getSalesHistory(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {

        PageResponse<OlxSaleResponseDto> page = olxService.getSalesHistory(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }
}

