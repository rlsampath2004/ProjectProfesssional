package com.kothari.dashboard.asset.service;

import com.kothari.dashboard.asset.dto.*;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import com.kothari.dashboard.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AssetService {

    PageResponse<AssetResponseDto> getAllAssets(UUID ownerId, AssetStatus status, AssetType type, String query, Pageable pageable);

    AssetResponseDto getAssetById(UUID ownerId, UUID id);

    AssetResponseDto createAsset(UUID ownerId, AssetRequestDto dto);

    AssetResponseDto updateAsset(UUID ownerId, UUID id, AssetRequestDto dto);

    void deleteAsset(UUID ownerId, UUID id);

    AssetResponseDto updateAssetStatus(UUID ownerId, UUID id, AssetStatusUpdateDto dto);

    List<AssetHistoryResponseDto> getAssetHistory(UUID ownerId, UUID id);

    AssetDepreciationDto calculateDepreciation(UUID ownerId, UUID id);

    List<AssetResponseDto> getAllForExport(UUID ownerId);
}

