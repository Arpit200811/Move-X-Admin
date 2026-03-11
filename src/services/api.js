import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://move-x-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// For the demo, we'll hardcode a token or set it after login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('movex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
