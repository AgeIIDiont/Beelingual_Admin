import axios from 'axios';
// import { getToken } from './authService'; // Import hàm lấy token

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: Request/Response interceptors được quản lý trong authService.js
// để tránh circular dependency

export default api;
