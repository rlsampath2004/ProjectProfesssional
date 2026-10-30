package com.kothari.dashboard.auth.entity;

import com.kothari.dashboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * User entity for Kothari Command Center.
 * Includes token versioning for instant remote killswitch,
 * rate-limit/lockout attributes, and TOTP MFA credentials.
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_username", columnList = "username", unique = true),
        @Index(name = "idx_user_email", columnList = "email", unique = true)
    }
)
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.ROLE_OWNER;

    @Column(name = "is_mfa_enabled", nullable = false)
    @Builder.Default
    private boolean mfaEnabled = true;

    @Column(name = "mfa_secret", length = 100)
    private String mfaSecret;

    /**
     * Incremented whenever "Sign Out All Devices" is triggered.
     * Evaluated against access token claims for instant revocation.
     */
    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private int tokenVersion = 1;

    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    @Column(name = "lockout_until")
    private LocalDateTime lockoutUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip", length = 50)
    private String lastLoginIp;

    public boolean isAccountLocked() {
        return lockoutUntil != null && lockoutUntil.isAfter(LocalDateTime.now());
    }
}

