package com.kothari.dashboard.security.entity;

import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Immutable security audit log entry.
 * Captures authentication successes, failures, anomalies, and administrative actions.
 */
@Entity
@Table(
    name = "security_events",
    indexes = {
        @Index(name = "idx_sec_event_type", columnList = "event_type"),
        @Index(name = "idx_sec_event_user", columnList = "username"),
        @Index(name = "idx_sec_event_created", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityEvent extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private SecurityEventType eventType;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 300)
    private String userAgent;

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "severity", nullable = false, length = 20)
    @Builder.Default
    private String severity = "INFO";
}

