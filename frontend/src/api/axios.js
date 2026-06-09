import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// OPTIMIZED: Simple request deduplication cache to prevent duplicate requests
const requestCache = new Map();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Add cache key for GET requests
  if (config.method === 'get') {
    config.cacheKey = `${config.method}:${config.url}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Cache GET responses
    if (res.config.method === 'get' && res.config.cacheKey) {
      requestCache.set(res.config.cacheKey, {
        data: res.data,
        timestamp: Date.now(),
      });
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_validated_at');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
