package com.kothari.dashboard.task.dto;

import com.kothari.dashboard.task.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequestDto {

    @NotBlank(message = "Task title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private TaskPriority priority;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Size(max = 50, message = "Due time cannot exceed 50 characters")
    private String due;

    private Boolean completed;
}

