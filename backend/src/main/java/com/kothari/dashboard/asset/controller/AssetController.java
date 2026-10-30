package com.kothari.dashboard.asset.controller;

import com.kothari.dashboard.asset.dto.*;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import com.kothari.dashboard.asset.service.AssetService;
import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.common.PageResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // Fallback owner UUID used until SecurityContext / JWT extraction is linked in Step 2
    private static final UUID DEFAULT_OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private UUID resolveOwnerId(Principal principal) {
        if (principal == null) {
            return DEFAULT_OWNER_ID;
        }
        if (principal instanceof org.springframework.security.core.Authentication auth) {
            if (auth.getPrincipal() instanceof com.kothari.dashboard.auth.entity.User user) {
                return user.getId();
            }
        }
        if (principal.getName() != null) {
            try {
                return UUID.fromString(principal.getName());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return DEFAULT_OWNER_ID;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AssetResponseDto>>> getAssets(
            Principal principal,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) AssetType type,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UUID ownerId = resolveOwnerId(principal);
        PageResponse<AssetResponseDto> response = assetService.getAllAssets(ownerId, status, type, query, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponseDto>> getAssetById(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        AssetResponseDto response = assetService.getAssetById(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetResponseDto>> createAsset(
            Principal principal,
            @Valid @RequestBody AssetRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        AssetResponseDto created = assetService.createAsset(ownerId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Asset enrolled successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponseDto>> updateAsset(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssetRequestDto requestDto) {

        UUID ownerId = resolveOwnerId(principal);
        AssetResponseDto updated = assetService.updateAsset(ownerId, id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Asset updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        assetService.deleteAsset(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok("Asset deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AssetResponseDto>> updateStatus(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssetStatusUpdateDto updateDto) {

        UUID ownerId = resolveOwnerId(principal);
        AssetResponseDto updated = assetService.updateAssetStatus(ownerId, id, updateDto);
        return ResponseEntity.ok(ApiResponse.ok("Status transition recorded", updated));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<AssetHistoryResponseDto>>> getHistory(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        List<AssetHistoryResponseDto> history = assetService.getAssetHistory(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/{id}/depreciation")
    public ResponseEntity<ApiResponse<AssetDepreciationDto>> getDepreciation(Principal principal, @PathVariable UUID id) {
        UUID ownerId = resolveOwnerId(principal);
        AssetDepreciationDto depreciation = assetService.calculateDepreciation(ownerId, id);
        return ResponseEntity.ok(ApiResponse.ok(depreciation));
    }

    /**
     * Hardened CSV Export:
     * Neutralizes CSV Formula Injection (prepends single quote ' to cells starting with =, +, -, @)
     */
    @GetMapping("/export/csv")
    public void exportCsv(Principal principal, HttpServletResponse response) throws IOException {
        UUID ownerId = resolveOwnerId(principal);
        List<AssetResponseDto> assets = assetService.getAllForExport(ownerId);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"kothari_assets_" + System.currentTimeMillis() + ".csv\"");

        try (PrintWriter writer = response.getWriter()) {
            writer.println("Asset Tag,Name,Type,Serial Number,Brand,Model,Status,Condition,Location,Assigned To,Purchase Cost,Purchase Date");

            for (AssetResponseDto a : assets) {
                writer.println(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
                        sanitizeCsv(a.getAssetTag()),
                        sanitizeCsv(a.getName()),
                        a.getType() != null ? a.getType().name() : "",
                        sanitizeCsv(a.getSerialNumber()),
                        sanitizeCsv(a.getBrand()),
                        sanitizeCsv(a.getModel()),
                        a.getStatus() != null ? a.getStatus().name() : "",
                        sanitizeCsv(a.getCondition()),
                        sanitizeCsv(a.getLocation()),
                        sanitizeCsv(a.getAssignedEmployeeName()),
                        a.getPurchaseCost() != null ? a.getPurchaseCost().toString() : "0.00",
                        a.getPurchaseDate() != null ? a.getPurchaseDate().toString() : ""
                ));
            }
        }
    }

    private String sanitizeCsv(String value) {
        if (value == null) return "";
        String clean = value.replace("\"", "\"\"");
        // Neutralize Excel Formula Injection
        if (clean.startsWith("=") || clean.startsWith("+") || clean.startsWith("-") || clean.startsWith("@")) {
            clean = "'" + clean;
        }
        return "\"" + clean + "\"";
    }
}

