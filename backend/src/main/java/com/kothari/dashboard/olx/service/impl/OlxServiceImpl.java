package com.kothari.dashboard.olx.service.impl;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetHistory;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.repository.AssetHistoryRepository;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.common.PageResponse;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.olx.dto.*;
import com.kothari.dashboard.olx.entity.OlxListing;
import com.kothari.dashboard.olx.entity.OlxListingStatus;
import com.kothari.dashboard.olx.entity.OlxSale;
import com.kothari.dashboard.olx.entity.PaymentMode;
import com.kothari.dashboard.olx.repository.OlxListingRepository;
import com.kothari.dashboard.olx.repository.OlxSaleRepository;
import com.kothari.dashboard.olx.service.OlxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OlxServiceImpl implements OlxService {

    private final OlxListingRepository listingRepository;
    private final OlxSaleRepository saleRepository;
    private final AssetRepository assetRepository;
    private final AssetHistoryRepository assetHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OlxListingResponseDto> getAllListings(UUID ownerId, String status, String category, String query) {
        List<OlxListing> listings = listingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);

        return listings.stream()
                .filter(l -> {
                    if (status != null && !status.equalsIgnoreCase("all") && !status.trim().isEmpty()) {
                        if (!l.getStatus().name().equalsIgnoreCase(status.trim())) {
                            return false;
                        }
                    }
                    if (category != null && !category.equalsIgnoreCase("all") && !category.trim().isEmpty()) {
                        if (l.getCategory() == null || !l.getCategory().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    if (query != null && !query.trim().isEmpty()) {
                        String q = query.toLowerCase().trim();
                        boolean matchTitle = l.getTitle() != null && l.getTitle().toLowerCase().contains(q);
                        boolean matchTag = l.getAsset() != null && l.getAsset().getAssetTag().toLowerCase().contains(q);
                        boolean matchSerial = l.getAsset() != null && l.getAsset().getSerialNumber() != null && l.getAsset().getSerialNumber().toLowerCase().contains(q);
                        boolean matchAd = l.getOlxAdId() != null && l.getOlxAdId().toLowerCase().contains(q);
                        return matchTitle || matchTag || matchSerial || matchAd;
                    }
                    return true;
                })
                .map(l -> mapListingToDto(l, ownerId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OlxListingResponseDto getListingById(UUID ownerId, UUID id) {
        OlxListing listing = listingRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("OLX Listing not found with ID: " + id));
        return mapListingToDto(listing, ownerId);
    }

    @Override
    @Transactional
    public OlxListingResponseDto createListing(UUID ownerId, OlxListingRequestDto dto) {
        Asset asset = resolveAsset(ownerId, dto.getAssetId(), dto.getAssetTag());

        OlxListing listing = OlxListing.builder()
                .ownerId(ownerId)
                .asset(asset)
                .title(dto.getTitle().trim())
                .category(dto.getCategory() != null ? dto.getCategory().trim() : "Laptops")
                .askingPrice(dto.getAskingPrice())
                .expectedPrice(dto.getExpectedPrice() != null ? dto.getExpectedPrice() : dto.getAskingPrice())
                .status(dto.getStatus() != null ? dto.getStatus() : OlxListingStatus.ACTIVE)
                .olxUrl(dto.getOlxUrl())
                .olxAdId(dto.getOlxAdId())
                .viewsCount(0)
                .inquiriesCount(0)
                .listedDate(LocalDate.now())
                .location(dto.getLocation() != null ? dto.getLocation() : asset.getLocation())
                .notes(dto.getNotes())
                .build();

        OlxListing savedListing = listingRepository.save(listing);

        // Update Asset status to SALVAGE_OLX
        AssetStatus prevStatus = asset.getStatus();
        asset.setStatus(AssetStatus.SALVAGE_OLX);
        assetRepository.save(asset);

        // Record timeline
        AssetHistory history = AssetHistory.builder()
                .ownerId(ownerId)
                .asset(asset)
                .previousStatus(prevStatus)
                .newStatus(AssetStatus.SALVAGE_OLX)
                .previousLocation(asset.getLocation())
                .newLocation(listing.getLocation())
                .previousHolder(asset.getAssignedEmployeeName())
                .newHolder("OLX Salvage Pipeline")
                .changeReason("Listed on secondary market: " + listing.getTitle())
                .build();
        assetHistoryRepository.save(history);

        log.info("Asset {} listed on OLX with listing ID {}", asset.getAssetTag(), savedListing.getId());
        return mapListingToDto(savedListing, ownerId);
    }

    @Override
    @Transactional
    public OlxListingResponseDto updateListing(UUID ownerId, UUID id, OlxListingRequestDto dto) {
        OlxListing listing = listingRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("OLX Listing not found with ID: " + id));

        listing.setTitle(dto.getTitle());
        if (dto.getCategory() != null) listing.setCategory(dto.getCategory());
        listing.setAskingPrice(dto.getAskingPrice());
        if (dto.getExpectedPrice() != null) listing.setExpectedPrice(dto.getExpectedPrice());
        if (dto.getOlxUrl() != null) listing.setOlxUrl(dto.getOlxUrl());
        if (dto.getOlxAdId() != null) listing.setOlxAdId(dto.getOlxAdId());
        if (dto.getLocation() != null) listing.setLocation(dto.getLocation());
        if (dto.getStatus() != null) listing.setStatus(dto.getStatus());
        if (dto.getNotes() != null) listing.setNotes(dto.getNotes());

        OlxListing updated = listingRepository.save(listing);
        return mapListingToDto(updated, ownerId);
    }

    @Override
    @Transactional
    public OlxListingResponseDto markSold(UUID ownerId, UUID id, OlxSaleRequestDto dto) {
        OlxListing listing = listingRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("OLX Listing not found with ID: " + id));

        listing.setStatus(OlxListingStatus.SOLD);
        listingRepository.save(listing);

        Asset asset = listing.getAsset();
        LocalDate saleDate = dto.getDateSold() != null ? dto.getDateSold() : LocalDate.now();
        String receiptNumber = "SLV-" + saleDate.getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        OlxSale sale = OlxSale.builder()
                .ownerId(ownerId)
                .listing(listing)
                .asset(asset)
                .saleReceiptNumber(receiptNumber)
                .soldPrice(dto.getSoldPrice())
                .buyerName(dto.getBuyerName() != null ? dto.getBuyerName().trim() : "Direct Walk-in Buyer")
                .buyerPhone(dto.getBuyerPhone())
                .paymentMode(dto.getPaymentMode() != null ? dto.getPaymentMode() : PaymentMode.UPI)
                .dateSold(saleDate)
                .notes(dto.getNotes())
                .build();
        saleRepository.save(sale);

        // Transition Asset status to DISPOSED
        AssetStatus prevStatus = asset.getStatus();
        asset.setStatus(AssetStatus.DISPOSED);
        asset.setAssignedEmployee(null);
        assetRepository.save(asset);

        // Record Asset History
        AssetHistory history = AssetHistory.builder()
                .ownerId(ownerId)
                .asset(asset)
                .previousStatus(prevStatus)
                .newStatus(AssetStatus.DISPOSED)
                .previousLocation(asset.getLocation())
                .newLocation("Buyer Custody")
                .previousHolder("OLX Salvage Pipeline")
                .newHolder(sale.getBuyerName())
                .changeReason("Sold on secondary market for ₹" + dto.getSoldPrice() + " (" + receiptNumber + ")")
                .build();
        assetHistoryRepository.save(history);

        log.info("Listing {} marked SOLD for asset {} with receipt {}", id, asset.getAssetTag(), receiptNumber);
        return mapListingToDto(listing, ownerId);
    }

    @Override
    @Transactional
    public void deleteListing(UUID ownerId, UUID id) {
        OlxListing listing = listingRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("OLX Listing not found with ID: " + id));
        listing.setDeleted(true);
        listingRepository.save(listing);
        log.info("Soft deleted OLX listing {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public OlxKpiDto getKpis(UUID ownerId) {
        LocalDate today = LocalDate.now();
        int soldTodayCount = saleRepository.countByOwnerIdAndDateSold(ownerId, today);
        BigDecimal revenueToday = saleRepository.sumRevenueByOwnerIdAndDateSold(ownerId, today);
        BigDecimal totalRealized = saleRepository.sumTotalRevenueByOwnerId(ownerId);
        int activeCount = listingRepository.countByOwnerIdAndStatus(ownerId, OlxListingStatus.ACTIVE);
        int negotiatingCount = listingRepository.countByOwnerIdAndStatus(ownerId, OlxListingStatus.NEGOTIATING);

        return OlxKpiDto.builder()
                .soldTodayCount(soldTodayCount)
                .revenueSoldToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
                .expectedSalesToday(BigDecimal.valueOf(24000.00))
                .totalSalesRealized(totalRealized != null ? totalRealized : BigDecimal.ZERO)
                .pendingListingsCount(activeCount + negotiatingCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OlxSaleResponseDto> getSalesHistory(UUID ownerId, Pageable pageable) {
        Page<OlxSale> page = saleRepository.findByOwnerId(ownerId, pageable);
        return PageResponse.from(page.map(this::mapSaleToDto));
    }

    private Asset resolveAsset(UUID ownerId, UUID assetId, String assetTag) {
        if (assetId != null) {
            return assetRepository.findByIdAndOwnerId(assetId, ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));
        }
        if (assetTag != null && !assetTag.trim().isEmpty()) {
            return assetRepository.findByAssetTagAndOwnerId(assetTag.trim(), ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found with tag: " + assetTag));
        }
        throw new IllegalArgumentException("Either assetId or assetTag must be provided to list an asset on OLX.");
    }

    private OlxListingResponseDto mapListingToDto(OlxListing l, UUID ownerId) {
        Asset a = l.getAsset();
        Optional<OlxSale> saleOpt = saleRepository.findByListingAndOwnerId(l, ownerId);

        String displayStatus;
        switch (l.getStatus()) {
            case ACTIVE -> displayStatus = "Active";
            case NEGOTIATING -> displayStatus = "Negotiating";
            case SOLD -> displayStatus = "Sold";
            case EXPIRED -> displayStatus = "Expired";
            default -> displayStatus = "Delisted";
        }

        OlxListingResponseDto.OlxListingResponseDtoBuilder builder = OlxListingResponseDto.builder()
                .id(l.getId())
                .assetId(a != null ? a.getId() : null)
                .assetTag(a != null ? a.getAssetTag() : "N/A")
                .brand(a != null ? a.getBrand() : "")
                .model(a != null ? a.getModel() : "")
                .serialNumber(a != null ? a.getSerialNumber() : "")
                .condition(a != null ? a.getCondition() : "Used")
                .title(l.getTitle())
                .category(l.getCategory())
                .askingPrice(l.getAskingPrice())
                .expectedPrice(l.getExpectedPrice())
                .status(displayStatus)
                .olxUrl(l.getOlxUrl())
                .olxAdId(l.getOlxAdId())
                .viewsCount(l.getViewsCount())
                .inquiriesCount(l.getInquiriesCount())
                .dateListed(l.getListedDate())
                .location(l.getLocation())
                .notes(l.getNotes())
                .createdAt(l.getCreatedAt());

        if (saleOpt.isPresent()) {
            OlxSale sale = saleOpt.get();
            builder.soldPrice(sale.getSoldPrice())
                   .buyerName(sale.getBuyerName())
                   .buyerPhone(sale.getBuyerPhone())
                   .paymentMode(sale.getPaymentMode() != null ? sale.getPaymentMode().name() : null)
                   .dateSold(sale.getDateSold())
                   .soldToday(sale.getDateSold() != null && sale.getDateSold().equals(LocalDate.now()));
        }

        return builder.build();
    }

    private OlxSaleResponseDto mapSaleToDto(OlxSale s) {
        Asset a = s.getAsset();
        BigDecimal netGainLoss = BigDecimal.ZERO;
        if (a != null && a.getPurchaseCost() != null) {
            netGainLoss = s.getSoldPrice().subtract(a.getPurchaseCost());
        }

        return OlxSaleResponseDto.builder()
                .id(s.getId())
                .listingId(s.getListing() != null ? s.getListing().getId() : null)
                .assetId(a != null ? a.getId() : null)
                .assetTag(a != null ? a.getAssetTag() : null)
                .assetName(a != null ? a.getName() : null)
                .saleReceiptNumber(s.getSaleReceiptNumber())
                .soldPrice(s.getSoldPrice())
                .buyerName(s.getBuyerName())
                .buyerPhone(s.getBuyerPhone())
                .paymentMode(s.getPaymentMode())
                .dateSold(s.getDateSold())
                .netProfitLoss(netGainLoss)
                .notes(s.getNotes())
                .createdAt(s.getCreatedAt())
                .build();
    }
}

