package com.kothari.dashboard.auth.service.impl;

import com.kothari.dashboard.auth.dto.*;
import com.kothari.dashboard.auth.entity.MfaRecoveryCode;
import com.kothari.dashboard.auth.entity.RefreshToken;
import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.auth.repository.MfaRecoveryCodeRepository;
import com.kothari.dashboard.auth.repository.RefreshTokenRepository;
import com.kothari.dashboard.auth.repository.UserRepository;
import com.kothari.dashboard.auth.service.AuthService;
import com.kothari.dashboard.auth.service.MfaService;
import com.kothari.dashboard.auth.service.TokenService;
import com.kothari.dashboard.common.exception.ResourceNotFoundException;
import com.kothari.dashboard.security.entity.SecurityEventType;
import com.kothari.dashboard.security.service.SecurityEventService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MfaRecoveryCodeRepository mfaRecoveryCodeRepository;
    private final TokenService tokenService;
    private final MfaService mfaService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityEventService securityEventService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 7;

    @Override
    @Transactional
    public Pair<LoginResponse, String> login(LoginRequest request, String ipAddress, String userAgent) {
        String identifier = request.getUsername().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier));

        // Uniform response & timing mitigation against username enumeration
        if (userOpt.isEmpty()) {
            passwordEncoder.matches("dummyPasswordForConstantTimeCheck!", "$argon2id$v=19$m=65536,t=3,p=1$dummySaltForConstantTimeExecution");
            securityEventService.logEvent(SecurityEventType.LOGIN_FAILURE, identifier, ipAddress, userAgent, "User not found", "WARN");
            throw new BadCredentialsException("Invalid username or password.");
        }

        User user = userOpt.get();

        if (user.isAccountLocked()) {
            securityEventService.logEvent(SecurityEventType.ACCOUNT_LOCKED, user.getUsername(), ipAddress, userAgent, "Attempt on locked account", "WARN");
            throw new BadCredentialsException("Account is temporarily locked due to excessive failed attempts. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
                securityEventService.logEvent(SecurityEventType.ACCOUNT_LOCKED, user.getUsername(), ipAddress, userAgent, "Exceeded 5 failed attempts. Locked for 15 minutes.", "CRITICAL");
            } else {
                securityEventService.logEvent(SecurityEventType.LOGIN_FAILURE, user.getUsername(), ipAddress, userAgent, "Failed password attempt " + attempts + "/" + MAX_FAILED_ATTEMPTS, "WARN");
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid username or password.");
        }

        // Login successful -> reset lockout counters
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        // MFA is mandatory for CEO/Owner account
        if (user.isMfaEnabled()) {
            String tempToken = tokenService.generateTempMfaToken(user);
            LoginResponse resp = LoginResponse.builder()
                    .mfaRequired(true)
                    .tempToken(tempToken)
                    .username(user.getUsername())
                    .build();
            return Pair.of(resp, null);
        }

        // Direct issue if MFA not yet configured
        return issueFullSession(user, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public Pair<LoginResponse, String> verifyMfa(MfaVerifyRequest request, String ipAddress, String userAgent) {
        if (!tokenService.validateToken(request.getTempToken())) {
            throw new BadCredentialsException("Temporary session expired or invalid. Please log in again.");
        }

        Claims claims = tokenService.parseClaims(request.getTempToken());
        if (!"MFA_PENDING".equals(claims.get("type"))) {
            throw new BadCredentialsException("Invalid session state for MFA verification.");
        }

        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean verified = false;

        // 1. Verify 6-digit TOTP code
        if (request.getTotpCode() != null && request.getTotpCode().trim().length() == 6) {
            try {
                int code = Integer.parseInt(request.getTotpCode().trim());
                verified = mfaService.verifyTotpCode(user.getMfaSecret(), code);
            } catch (NumberFormatException ignored) {}
        }

        // 2. If TOTP failed, check emergency recovery codes
        if (!verified && request.getRecoveryCode() != null && !request.getRecoveryCode().trim().isEmpty()) {
            String recoveryHash = tokenService.hashToken(request.getRecoveryCode().trim().toUpperCase());
            Optional<MfaRecoveryCode> recoveryOpt = mfaRecoveryCodeRepository.findByUserAndCodeHashAndUsedFalse(user, recoveryHash);
            if (recoveryOpt.isPresent()) {
                MfaRecoveryCode code = recoveryOpt.get();
                code.setUsed(true);
                code.setUsedAt(LocalDateTime.now());
                mfaRecoveryCodeRepository.save(code);
                verified = true;
                securityEventService.logEvent(SecurityEventType.MFA_SUCCESS, user.getUsername(), ipAddress, userAgent, "Authenticated using emergency recovery code", "WARN");
            }
        }

        if (!verified) {
            securityEventService.logEvent(SecurityEventType.MFA_FAILURE, user.getUsername(), ipAddress, userAgent, "Invalid 6-digit TOTP code or recovery code", "WARN");
            throw new BadCredentialsException("Invalid verification code. Please check your authenticator app.");
        }

        securityEventService.logEvent(SecurityEventType.MFA_SUCCESS, user.getUsername(), ipAddress, userAgent, "Successful 2FA verification", "INFO");
        return issueFullSession(user, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public MfaSetupResponse setupMfa(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var key = mfaService.generateSecretKey();
        String secretKey = key.getKey();
        user.setMfaSecret(secretKey);
        userRepository.save(user);

        String qrUrl = mfaService.getOtpAuthUrl(user.getUsername(), secretKey);
        List<String> rawRecoveryCodes = mfaService.generateRecoveryCodes(5);

        // Store hashed recovery codes
        for (String rawCode : rawRecoveryCodes) {
            MfaRecoveryCode entity = MfaRecoveryCode.builder()
                    .user(user)
                    .codeHash(tokenService.hashToken(rawCode))
                    .used(false)
                    .build();
            mfaRecoveryCodeRepository.save(entity);
        }

        return MfaSetupResponse.builder()
                .secretKey(secretKey)
                .qrCodeUrl(qrUrl)
                .recoveryCodes(rawRecoveryCodes)
                .build();
    }

    @Override
    @Transactional
    public void confirmMfaSetup(UUID userId, String totpCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            int code = Integer.parseInt(totpCode.trim());
            if (!mfaService.verifyTotpCode(user.getMfaSecret(), code)) {
                throw new BadCredentialsException("Invalid verification code. Setup not confirmed.");
            }
            user.setMfaEnabled(true);
            userRepository.save(user);
        } catch (NumberFormatException e) {
            throw new BadCredentialsException("Invalid code format.");
        }
    }

    @Override
    @Transactional
    public Pair<LoginResponse, String> refreshSession(String rawRefreshToken, String ipAddress, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            throw new BadCredentialsException("Missing refresh token");
        }

        String tokenHash = tokenService.hashToken(rawRefreshToken.trim());
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        User user = token.getUser();

        // Automatic Token Reuse / Theft Detection:
        if (token.isRevoked()) {
            // An already revoked token is being presented! Potential token theft in progress!
            refreshTokenRepository.revokeAllUserTokens(user);
            user.setTokenVersion(user.getTokenVersion() + 1);
            userRepository.save(user);

            securityEventService.logEvent(SecurityEventType.TOKEN_THEFT_DETECTED, user.getUsername(), ipAddress, userAgent,
                    "Refresh token reuse detected! All active sessions revoked immediately.", "CRITICAL");

            throw new BadCredentialsException("Session security alert: Reused token detected. All sessions terminated.");
        }

        if (token.isExpired()) {
            throw new BadCredentialsException("Refresh token has expired. Please log in again.");
        }

        // Revoke the old token
        token.setRevoked(true);

        // Generate new rotated refresh token
        String newRawToken = tokenService.generateSecureRefreshToken();
        String newTokenHash = tokenService.hashToken(newRawToken);
        token.setReplacedByToken(newTokenHash);
        refreshTokenRepository.save(token);

        // Persist new refresh token
        RefreshToken newTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .expiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_VALIDITY_DAYS * 86400))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        refreshTokenRepository.save(newTokenEntity);

        String newAccessToken = tokenService.generateAccessToken(user);

        LoginResponse response = LoginResponse.builder()
                .mfaRequired(false)
                .accessToken(newAccessToken)
                .expiresInMs(tokenService.getAccessTokenExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        securityEventService.logEvent(SecurityEventType.TOKEN_ROTATED, user.getUsername(), ipAddress, userAgent, "Token rotated successfully", "INFO");
        return Pair.of(response, newRawToken);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken, String ipAddress) {
        if (rawRefreshToken != null) {
            String tokenHash = tokenService.hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }

    @Override
    @Transactional
    public void logoutAllDevices(UUID userId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        refreshTokenRepository.revokeAllUserTokens(user);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        securityEventService.logEvent(SecurityEventType.SESSION_REVOKED_ALL, user.getUsername(), ipAddress, null, "All devices terminated by user", "WARN");
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Incorrect current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        // Invalidate all tokens upon password change
        refreshTokenRepository.revokeAllUserTokens(user);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        securityEventService.logEvent(SecurityEventType.PASSWORD_CHANGED, user.getUsername(), null, null, "Password changed. All active sessions invalidated.", "INFO");
    }

    private Pair<LoginResponse, String> issueFullSession(User user, String ipAddress, String userAgent) {
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);

        String accessToken = tokenService.generateAccessToken(user);
        String rawRefreshToken = tokenService.generateSecureRefreshToken();
        String tokenHash = tokenService.hashToken(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_VALIDITY_DAYS * 86400))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        refreshTokenRepository.save(refreshToken);

        LoginResponse response = LoginResponse.builder()
                .mfaRequired(false)
                .accessToken(accessToken)
                .expiresInMs(tokenService.getAccessTokenExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        securityEventService.logEvent(SecurityEventType.LOGIN_SUCCESS, user.getUsername(), ipAddress, userAgent, "Successful login", "INFO");
        return Pair.of(response, rawRefreshToken);
    }
}

