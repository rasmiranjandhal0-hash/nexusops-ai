import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

// In local development, if VITE_API_BASE_URL points to a cloud domain that may be offline, use local '/api' proxy
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  if (!rawBaseUrl.includes('localhost:5000') && !rawBaseUrl.includes('127.0.0.1:5000')) {
    rawBaseUrl = '/api';
  }
}

// Automatically append '/api' if an external backend origin is passed without it
if (rawBaseUrl.startsWith('http')) {
  const cleanUrl = rawBaseUrl.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    rawBaseUrl = cleanUrl + '/api';
  }
}

const API_BASE_URL = rawBaseUrl;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Generous timeout for multi-agent reasoning calls
});

// Automatically inject JWT Bearer token into outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexusops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept unauthorized responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register' ||
        window.location.pathname === '/';

      if (!isAuthRoute) {
        localStorage.removeItem('nexusops_token');
        localStorage.removeItem('nexusops_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
