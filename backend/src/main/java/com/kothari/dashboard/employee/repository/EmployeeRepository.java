package com.kothari.dashboard.employee.repository;

import com.kothari.dashboard.employee.entity.Employee;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<Employee> findByEmployeeCodeAndOwnerId(String employeeCode, UUID ownerId);

    boolean existsByEmployeeCodeAndOwnerId(String employeeCode, UUID ownerId);

    boolean existsByEmployeeCodeAndOwnerIdAndIdNot(String employeeCode, UUID ownerId, UUID id);

    Page<Employee> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<Employee> findByOwnerIdAndStatus(UUID ownerId, EmployeeStatus status, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.ownerId = :ownerId AND " +
           "(LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Employee> searchEmployees(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);
}

