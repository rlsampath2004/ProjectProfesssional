package com.kothari.dashboard.auth.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

/**
 * Mandatory Multi-Factor Authentication Service.
 * Implements TOTP (Time-based One-Time Password / RFC 6238) and Single-Use Recovery Codes.
 */
@Service
public class MfaService {

    private final GoogleAuthenticator googleAuth;
    private final SecureRandom secureRandom = new SecureRandom();
    private static final String RECOVERY_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public MfaService() {
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setTimeStepSizeInMillis(30000) // 30 seconds standard
                .setWindowSize(3) // 1 window tolerance for network clock drift
                .build();
        this.googleAuth = new GoogleAuthenticator(config);
    }

    public GoogleAuthenticatorKey generateSecretKey() {
        return googleAuth.createCredentials();
    }

    public boolean verifyTotpCode(String secretKey, int code) {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            return false;
        }
        return googleAuth.authorize(secretKey, code);
    }

    public String getOtpAuthUrl(String username, String secretKey) {
        return String.format(
                "otpauth://totp/Kothari%%20Distributors:%s?secret=%s&issuer=Kothari%%20Distributors",
                username, secretKey
        );
    }

    public List<String> generateRecoveryCodes(int count) {
        List<String> codes = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            StringBuilder sb = new StringBuilder(10);
            for (int j = 0; j < 8; j++) {
                sb.append(RECOVERY_CODE_CHARS.charAt(secureRandom.nextInt(RECOVERY_CODE_CHARS.length())));
            }
            // Format as XXXX-XXXX
            codes.add(sb.substring(0, 4) + "-" + sb.substring(4, 8));
        }
        return codes;
    }
}

