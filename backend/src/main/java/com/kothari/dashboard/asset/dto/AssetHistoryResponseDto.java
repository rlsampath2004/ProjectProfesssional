package com.kothari.dashboard.asset.dto;

import com.kothari.dashboard.asset.entity.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetHistoryResponseDto {

    private UUID id;
    private UUID assetId;
    private AssetStatus previousStatus;
    private AssetStatus newStatus;
    private String previousLocation;
    private String newLocation;
    private String previousHolder;
    private String newHolder;
    private String changeReason;
    private String changedBy;
    private LocalDateTime timestamp;
}

