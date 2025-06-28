import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
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
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  ROOMS: {
    LIST: '/api/rooms',
    CREATE: '/api/rooms',
    GET: (id) => `/api/rooms/${id}`,
    JOIN: (id) => `/api/rooms/${id}/join`,
    JOIN_BY_CODE: '/api/rooms/join-by-code',
    DELETE: (id) => `/api/rooms/${id}`,
    UPDATE: (id) => `/api/rooms/${id}`,
    REMOVE_USER: (roomId, userId) => `/api/rooms/${roomId}/users/${userId}`,
  },
  MESSAGES: {
    GET: (roomId) => `/api/messages/${roomId}`,
    CREATE: (roomId) => `/api/messages/${roomId}`,
  },
  USERS: {
    LIST: '/api/users',
    GET: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    UPDATE_ROLE: (id) => `/api/users/${id}/role`,
  },
};

export default api; 