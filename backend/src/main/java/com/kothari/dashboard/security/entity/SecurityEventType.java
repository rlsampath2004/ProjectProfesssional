package com.kothari.dashboard.security.entity;

public enum SecurityEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    MFA_SUCCESS,
    MFA_FAILURE,
    ACCOUNT_LOCKED,
    TOKEN_ROTATED,
    TOKEN_THEFT_DETECTED,
    SESSION_REVOKED_ALL,
    PASSWORD_CHANGED,
    SUSPICIOUS_ACCESS
}

