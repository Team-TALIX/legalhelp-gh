import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, removeTokens } from './auth'; // Assuming auth utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true; // Mark as retry
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        // No refresh token, logout user (or handle as per app's auth flow)
        removeTokens(); // Clear any potentially stale tokens
        // Here you might want to trigger a logout action in your auth context/store
        // For now, just reject the promise. useAuth will handle the state.
        isRefreshing = false;
        processQueue(new Error('No refresh token available. User logged out.'), null);
        return Promise.reject(new Error('No refresh token available. User logged out.'));
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refreshTokenValue });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        storeTokens(newAccessToken, newRefreshToken);
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken; // Update default for future calls
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken; // Update current request

        processQueue(null, newAccessToken);
        return apiClient(originalRequest); // Retry original request
      } catch (refreshError) {
        removeTokens(); // Refresh failed, clear tokens
        // Trigger logout action in auth context/store
        processQueue(refreshError, null);
        console.error('Token refresh failed:', refreshError);
        // Redirect to login or show error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// The specific API call functions (register, login, etc.) are less critical now
// as useAuth can call apiClient.post() directly and interceptors handle token logic.
// They can be removed or kept if they offer specific utility beyond a simple apiClient.post() call.

// Removing register and login as useAuth.js now calls apiClient.post directly for these.

// This specific manualRefreshToken function can be kept for manual refresh if ever required.
export const manualRefreshToken = async (token) => {
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken: token });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    delete apiClient.defaults.headers.common['Authorization'];
    return { message: 'Server logout attempted.' };
  } catch (error) {
    console.warn('Logout API call failed:', error.response?.data || error.message);
    delete apiClient.defaults.headers.common['Authorization'];
    // Even if server logout fails, client should proceed with its logout.
    // The primary purpose of this function, if kept, is to attempt the server call.
    // Actual state clearing and token removal is best handled in useAuth.
    return { message: 'Server logout attempted.' };
  }
};

export default apiClient;
