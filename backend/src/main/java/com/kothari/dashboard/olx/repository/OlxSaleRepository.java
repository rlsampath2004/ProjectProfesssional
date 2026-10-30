package com.kothari.dashboard.olx.repository;

import com.kothari.dashboard.olx.entity.OlxListing;
import com.kothari.dashboard.olx.entity.OlxSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OlxSaleRepository extends JpaRepository<OlxSale, UUID> {

    Optional<OlxSale> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<OlxSale> findByListingAndOwnerId(OlxListing listing, UUID ownerId);

    Page<OlxSale> findByOwnerId(UUID ownerId, Pageable pageable);

    int countByOwnerIdAndDateSold(UUID ownerId, LocalDate dateSold);

    @Query("SELECT COALESCE(SUM(s.soldPrice), 0) FROM OlxSale s WHERE s.ownerId = :ownerId AND s.dateSold = :dateSold")
    BigDecimal sumRevenueByOwnerIdAndDateSold(@Param("ownerId") UUID ownerId, @Param("dateSold") LocalDate dateSold);

    @Query("SELECT COALESCE(SUM(s.soldPrice), 0) FROM OlxSale s WHERE s.ownerId = :ownerId")
    BigDecimal sumTotalRevenueByOwnerId(@Param("ownerId") UUID ownerId);
}

