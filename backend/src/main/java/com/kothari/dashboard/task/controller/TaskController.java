package com.kothari.dashboard.task.controller;

import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.common.ApiResponse;
import com.kothari.dashboard.task.dto.TaskRequestDto;
import com.kothari.dashboard.task.dto.TaskResponseDto;
import com.kothari.dashboard.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTasks(@AuthenticationPrincipal User currentUser) {
        List<TaskResponseDto> tasks = taskService.getTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponseDto>> createTask(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody TaskRequestDto dto) {

        TaskResponseDto created = taskService.createTask(currentUser.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Task created successfully", created));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TaskResponseDto>> toggleTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        TaskResponseDto updated = taskService.toggleTask(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Task completion updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {

        taskService.deleteTask(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted", null));
    }
}

