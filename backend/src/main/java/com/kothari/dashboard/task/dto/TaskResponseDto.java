package com.kothari.dashboard.task.dto;

import com.kothari.dashboard.task.entity.TaskPriority;
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
public class TaskResponseDto {

    private UUID id;
    private String title;
    private TaskPriority priority;
    private String category;
    private String due;
    private boolean completed;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}

