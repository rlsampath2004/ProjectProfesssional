import api, { setAccessToken, getAccessToken, setTokenProvider } from './api';

let ongoingAuthPromise = null;

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

  // Ensure an active, valid Bearer session with backend
  async ensureAuthenticated() {
    if (this.isAuthenticated()) {
      return getAccessToken();
    }
    if (ongoingAuthPromise) {
      return ongoingAuthPromise;
    }

    ongoingAuthPromise = (async () => {
      try {
        // 1. Try refresh endpoint first (uses existing HttpOnly cookie)
        try {
          const refreshed = await this.refresh();
          if (refreshed?.accessToken) {
            return refreshed.accessToken;
          }
        } catch (e) {
          // Refresh cookie not present or expired
        }

        // 2. Dev-only seamless auto-connect — removed in production builds
        if (process.env.NODE_ENV === 'development') {
          try {
            const loginData = await this.login('admin', 'KothariAdmin@2026!');
            if (loginData?.accessToken) {
              return loginData.accessToken;
            }
          } catch (e) {
            console.warn('[AuthService] Dev auto-connect failed:', e.message);
          }
        }
        return null;
      } finally {
        ongoingAuthPromise = null;
      }
    })();

    return ongoingAuthPromise;
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

// Register token provider with api.js so requests never fire unauthenticated
setTokenProvider(() => authService.ensureAuthenticated());

export default authService;

