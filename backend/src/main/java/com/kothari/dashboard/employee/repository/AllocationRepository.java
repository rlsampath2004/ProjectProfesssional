package com.kothari.dashboard.employee.repository;

import com.kothari.dashboard.employee.entity.Allocation;
import com.kothari.dashboard.employee.entity.AllocationStatus;
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
public interface AllocationRepository extends JpaRepository<Allocation, UUID> {

    Optional<Allocation> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<Allocation> findByReceiptNumberAndOwnerId(String receiptNumber, UUID ownerId);

    List<Allocation> findByEmployeeIdAndOwnerIdAndStatus(UUID employeeId, UUID ownerId, AllocationStatus status);

    Optional<Allocation> findByAssetIdAndOwnerIdAndStatus(UUID assetId, UUID ownerId, AllocationStatus status);

    Page<Allocation> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<Allocation> findByOwnerIdAndStatus(UUID ownerId, AllocationStatus status, Pageable pageable);

    int countByEmployeeIdAndOwnerIdAndStatus(UUID employeeId, UUID ownerId, AllocationStatus status);

    @Query("SELECT COUNT(a) FROM Allocation a WHERE a.ownerId = :ownerId AND a.status = 'ACTIVE'")
    long countActiveAllocations(@Param("ownerId") UUID ownerId);
}

