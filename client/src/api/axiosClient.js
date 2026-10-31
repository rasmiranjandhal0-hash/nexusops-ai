import axios from 'axios';

// Resolve API Base URL from environment variable with local fallback
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

// Normalize: If an origin is passed without the /api suffix, automatically append it
if (rawBaseUrl && rawBaseUrl.startsWith('http')) {
  const cleanUrl = rawBaseUrl.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    rawBaseUrl = cleanUrl + '/api';
  }
}

const axiosClient = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Automatically inject Bearer token and Customer ID into outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('privacyguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const storedCustomer = localStorage.getItem('privacyguard_customer');
      if (storedCustomer) {
        const parsed = JSON.parse(storedCustomer);
        if (parsed && (parsed.id || parsed.email)) {
          config.headers['x-customer-id'] = (parsed.id || parsed.email).trim().toLowerCase();
        }
      }
    } catch {
      // Fallback
      config.headers['x-customer-id'] = 'demo@privacyguard.ai';
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
      localStorage.removeItem('privacyguard_token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
