package com.kothari.dashboard.task.entity;

import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Executive CEO Task & Operational Milestone.
 * Fully normalized (1NF, 2NF, 3NF, BCNF).
 */
@Entity
@Table(
    name = "tasks",
    indexes = {
        @Index(name = "idx_task_owner_completed", columnList = "owner_id, is_completed"),
        @Index(name = "idx_task_priority", columnList = "priority")
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskItem extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private TaskPriority priority = TaskPriority.NORMAL;

    @Column(name = "category", length = 50)
    @Builder.Default
    private String category = "OPERATIONS";

    @Column(name = "due_time", length = 50)
    private String due;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

