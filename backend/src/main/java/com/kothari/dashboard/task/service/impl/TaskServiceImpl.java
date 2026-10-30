package com.kothari.dashboard.task.service.impl;

import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.task.dto.TaskRequestDto;
import com.kothari.dashboard.task.dto.TaskResponseDto;
import com.kothari.dashboard.task.entity.TaskItem;
import com.kothari.dashboard.task.entity.TaskPriority;
import com.kothari.dashboard.task.repository.TaskRepository;
import com.kothari.dashboard.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasks(UUID ownerId) {
        return taskRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public TaskResponseDto createTask(UUID ownerId, TaskRequestDto dto) {
        TaskItem task = TaskItem.builder()
                .ownerId(ownerId)
                .title(dto.getTitle().trim())
                .priority(dto.getPriority() != null ? dto.getPriority() : TaskPriority.NORMAL)
                .category(dto.getCategory() != null ? dto.getCategory().trim() : "OPERATIONS")
                .due(dto.getDue() != null ? dto.getDue().trim() : "TODAY 18:00")
                .completed(Boolean.TRUE.equals(dto.getCompleted()))
                .completedAt(Boolean.TRUE.equals(dto.getCompleted()) ? LocalDateTime.now() : null)
                .build();

        TaskItem saved = taskRepository.save(task);
        log.info("Created new task item: {} for owner: {}", saved.getTitle(), ownerId);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public TaskResponseDto toggleTask(UUID ownerId, UUID id) {
        TaskItem task = taskRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));

        boolean newCompleted = !task.isCompleted();
        task.setCompleted(newCompleted);
        task.setCompletedAt(newCompleted ? LocalDateTime.now() : null);

        TaskItem updated = taskRepository.save(task);
        log.info("Task {} completion toggled to: {}", id, newCompleted);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteTask(UUID ownerId, UUID id) {
        TaskItem task = taskRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));

        task.setDeleted(true);
        taskRepository.save(task);
        log.info("Soft deleted task {} for owner {}", id, ownerId);
    }

    private TaskResponseDto mapToDto(TaskItem t) {
        return TaskResponseDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .priority(t.getPriority())
                .category(t.getCategory())
                .due(t.getDue())
                .completed(t.isCompleted())
                .completedAt(t.getCompletedAt())
                .createdAt(t.getCreatedAt())
                .build();
    }
}

