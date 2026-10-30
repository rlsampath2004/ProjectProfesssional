package com.kothari.dashboard.task.repository;

import com.kothari.dashboard.task.entity.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<TaskItem, UUID> {

    List<TaskItem> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<TaskItem> findByIdAndOwnerId(UUID id, UUID ownerId);

    int countByOwnerIdAndCompletedTrue(UUID ownerId);

    int countByOwnerId(UUID ownerId);
}

