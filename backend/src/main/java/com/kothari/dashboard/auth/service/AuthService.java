package com.kothari.dashboard.auth.service;

import com.kothari.dashboard.auth.dto.*;
import org.springframework.data.util.Pair;

import java.util.UUID;

public interface AuthService {

    Pair<LoginResponse, String> login(LoginRequest request, String ipAddress, String userAgent);

    Pair<LoginResponse, String> verifyMfa(MfaVerifyRequest request, String ipAddress, String userAgent);

    MfaSetupResponse setupMfa(UUID userId);

    void confirmMfaSetup(UUID userId, String totpCode);

    Pair<LoginResponse, String> refreshSession(String rawRefreshToken, String ipAddress, String userAgent);

    void logout(String rawRefreshToken, String ipAddress);

    void logoutAllDevices(UUID userId, String ipAddress);

    void changePassword(UUID userId, ChangePasswordRequest request);
}

