package com.kothari.dashboard.task.service;

import com.kothari.dashboard.task.dto.TaskRequestDto;
import com.kothari.dashboard.task.dto.TaskResponseDto;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    List<TaskResponseDto> getTasks(UUID ownerId);

    TaskResponseDto createTask(UUID ownerId, TaskRequestDto dto);

    TaskResponseDto toggleTask(UUID ownerId, UUID id);

    void deleteTask(UUID ownerId, UUID id);
}

