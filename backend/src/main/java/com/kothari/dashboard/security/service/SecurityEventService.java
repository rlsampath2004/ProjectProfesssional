package com.kothari.dashboard.security.service;

import com.kothari.dashboard.security.entity.SecurityEvent;
import com.kothari.dashboard.security.entity.SecurityEventType;
import com.kothari.dashboard.security.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Asynchronous Security Audit Logger.
 * Executes on background worker threads without blocking user response latency.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;

    @Async("taskExecutor")
    public CompletableFuture<SecurityEvent> logEvent(
            SecurityEventType eventType,
            String username,
            String ipAddress,
            String userAgent,
            String details,
            String severity) {

        SecurityEvent event = SecurityEvent.builder()
                .eventType(eventType)
                .username(username)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .details(details)
                .severity(severity != null ? severity : "INFO")
                .build();

        SecurityEvent saved = securityEventRepository.save(event);
        log.info("[SECURITY AUDIT] [{}] User: {}, IP: {}, Severity: {}", eventType, username, ipAddress, severity);
        return CompletableFuture.completedFuture(saved);
    }
}

