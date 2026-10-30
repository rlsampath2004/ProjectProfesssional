package com.kothari.dashboard.auth.controller;

import com.kothari.dashboard.auth.dto.*;
import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.auth.service.AuthService;
import com.kothari.dashboard.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private static final String REFRESH_COOKIE_NAME = "kd_refresh_token";

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        Pair<LoginResponse, String> result = authService.login(request, ip, userAgent);
        if (result.getSecond() != null) {
            setRefreshCookie(httpResponse, result.getSecond());
        }

        return ResponseEntity.ok(ApiResponse.ok("Authentication processed", result.getFirst()));
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyMfa(
            @Valid @RequestBody MfaVerifyRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        Pair<LoginResponse, String> result = authService.verifyMfa(request, ip, userAgent);
        setRefreshCookie(httpResponse, result.getSecond());

        return ResponseEntity.ok(ApiResponse.ok("MFA verification successful", result.getFirst()));
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<ApiResponse<MfaSetupResponse>> setupMfa(@AuthenticationPrincipal User currentUser) {
        MfaSetupResponse response = authService.setupMfa(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("MFA setup generated", response));
    }

    @PostMapping("/mfa/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmMfa(
            @AuthenticationPrincipal User currentUser,
            @RequestParam String code) {

        authService.confirmMfaSetup(currentUser.getId(), code);
        return ResponseEntity.ok(ApiResponse.ok("MFA successfully confirmed and enabled", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String rawRefreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        Pair<LoginResponse, String> result = authService.refreshSession(rawRefreshToken, ip, userAgent);
        setRefreshCookie(httpResponse, result.getSecond());

        return ResponseEntity.ok(ApiResponse.ok("Session refreshed", result.getFirst()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String rawRefreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = getClientIp(httpRequest);
        authService.logout(rawRefreshToken, ip);
        clearRefreshCookie(httpResponse);

        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = getClientIp(httpRequest);
        authService.logoutAllDevices(currentUser.getId(), ip);
        clearRefreshCookie(httpResponse);

        return ResponseEntity.ok(ApiResponse.ok("All active sessions terminated immediately", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully. All sessions revoked.", null));
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production over HTTPS
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

