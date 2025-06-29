import axios from 'axios';

// Environment detection and API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration - environment-based
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_URL environment variable is not set!');
}

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  ROOMS: {
    LIST: '/rooms',
    CREATE: '/rooms',
    GET: (id) => `/rooms/${id}`,
    JOIN: (id) => `/rooms/${id}/join`,
    JOIN_BY_CODE: '/rooms/join-by-code',
    DELETE: (id) => `/rooms/${id}`,
    UPDATE: (id) => `/rooms/${id}`,
    REMOVE_USER: (roomId, userId) => `/rooms/${roomId}/users/${userId}`,
  },
  MESSAGES: {
    GET: (roomId) => `/messages/${roomId}`,
    CREATE: (roomId) => `/messages/${roomId}`,
  },
  USERS: {
    LIST: '/users',
    GET: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
  },
};

export default api; 