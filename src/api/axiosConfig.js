import axios from 'axios';
import { showError } from '@/services/notification';

const rawBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://localhost:7087';
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir el token si existe en almacenamiento local
apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para manejo de respuestas y errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
