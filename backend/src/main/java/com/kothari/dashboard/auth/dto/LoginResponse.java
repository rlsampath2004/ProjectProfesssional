package com.kothari.dashboard.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private boolean mfaRequired;
    private String tempToken; // Temporary token used exclusively for the 2nd MFA step
    private String accessToken; // Short-lived JWT (10 min)
    private long expiresInMs;
    private UUID userId;
    private String username;
    private String email;
    private String role;
}

