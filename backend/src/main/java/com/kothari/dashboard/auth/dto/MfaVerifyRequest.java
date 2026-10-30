package com.kothari.dashboard.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {

    @NotBlank(message = "Temporary MFA token is required")
    private String tempToken;

    // Optional if using backup recovery code
    private String totpCode;

    // Optional if using TOTP
    private String recoveryCode;
}

