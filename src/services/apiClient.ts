import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';


export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/**
 * Token-based Axios Base API Client
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('token');
    if (!token) {
      try {
        const raw = localStorage.getItem('netro_auth_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token || null;
        }
      } catch {
        // ignore
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('token');
      localStorage.removeItem('netro_auth_state');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
