package com.kothari.dashboard.olx.repository;

import com.kothari.dashboard.olx.entity.OlxListing;
import com.kothari.dashboard.olx.entity.OlxListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OlxListingRepository extends JpaRepository<OlxListing, UUID> {

    Optional<OlxListing> findByIdAndOwnerId(UUID id, UUID ownerId);

    List<OlxListing> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Page<OlxListing> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<OlxListing> findByOwnerIdAndStatus(UUID ownerId, OlxListingStatus status, Pageable pageable);

    Page<OlxListing> findByOwnerIdAndCategory(UUID ownerId, String category, Pageable pageable);

    int countByOwnerIdAndStatus(UUID ownerId, OlxListingStatus status);

    @Query("SELECT l FROM OlxListing l WHERE l.ownerId = :ownerId AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.asset.assetTag) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.asset.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.olxAdId) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<OlxListing> searchListings(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);
}

