import axios from 'axios';

// Base API configuration with local backend fallback for development and environment override for production
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables sending and receiving HttpOnly cookies (refresh tokens)
});

// In-memory access token storage (XSS defense) with session-persistence fallback
let inMemoryToken = sessionStorage.getItem('kd_access_token') || null;

export const setAccessToken = (token) => {
  inMemoryToken = token;
  if (token) {
    sessionStorage.setItem('kd_access_token', token);
  } else {
    sessionStorage.removeItem('kd_access_token');
  }
};

export const getAccessToken = () => {
  return inMemoryToken;
};

// Function provider allowing api to lazily request an access token before first dispatch
let tokenProvider = null;
export const setTokenProvider = (fn) => {
  tokenProvider = fn;
};

// Request Interceptor: injects Bearer token into Authorization header
api.interceptors.request.use(
  async (config) => {
    // Avoid recursion on auth endpoints
    if (config.url?.includes('/api/auth/')) {
      return config;
    }

    let token = getAccessToken();
    if (!token && tokenProvider) {
      try {
        token = await tokenProvider();
      } catch (e) {
        // Continue if provider throws
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handles 401 Unauthorized by attempting a token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 if not already refreshing and not an auth endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Dispatch session expired custom event for app UI to handle gracefully
        window.dispatchEvent(new CustomEvent('kd_session_expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Clear the access token from sessionStorage on tab/window close to reduce XSS exposure window.
// The HttpOnly refresh cookie persists and can silently re-issue a new access token on next open.
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('kd_access_token');
});

