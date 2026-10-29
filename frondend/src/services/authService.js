import api, { setAccessToken, getAccessToken } from './api';

export const authService = {
  // 1. Password Step
  async login(username, password) {
    const response = await api.post('/api/auth/login', { username, password });
    const data = response.data?.data;
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  // 2. TOTP MFA Step
  async verifyMfa(tempToken, totpCode, recoveryCode) {
    const response = await api.post('/api/auth/mfa/verify', {
      tempToken,
      totpCode: totpCode || null,
      recoveryCode: recoveryCode || null,
    });
    const data = response.data?.data;
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  // Setup 2FA
  async setupMfa() {
    const response = await api.post('/api/auth/mfa/setup');
    return response.data?.data;
  },

  // Confirm 2FA setup
  async confirmMfa(code) {
    const response = await api.post(`/api/auth/mfa/confirm?code=${encodeURIComponent(code)}`);
    return response.data;
  },

  // Refresh Session Token
  async refresh() {
    const response = await api.post('/api/auth/refresh');
    const data = response.data?.data;
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  // Logout Current Device
  async logout() {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  // Remote Killswitch: Logout All Devices
  async logoutAllDevices() {
    try {
      await api.post('/api/auth/logout-all');
    } finally {
      setAccessToken(null);
    }
  },

  // Change Password
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Helper state check
  isAuthenticated() {
    return !!getAccessToken();
  },
};

export default authService;

