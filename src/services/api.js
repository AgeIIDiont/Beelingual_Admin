import axios from 'axios';
import { getToken } from './authService'; // Import hàm lấy token

const api = axios.create({
<<<<<<< HEAD
  // SỬA: Trỏ về server thật của bạn
  baseURL: 'https://english-app-mupk.onrender.com/api', 
  timeout: 20000, 
=======
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
>>>>>>> master
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Request interceptor - Thêm token vào Header
api.interceptors.request.use(
  (config) => {
    // SỬA: Mở comment và lấy token thực tế
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token hết hạn (401), có thể xử lý logout tại đây
    if (error.response && error.response.status === 401) {
       console.error("Token hết hạn hoặc không hợp lệ");
       // window.location.href = '/login'; // Tùy chọn: đá về trang login
    }
    return Promise.reject(error);
  }
);
=======
// Note: Request/Response interceptors được quản lý trong authService.js
// để tránh circular dependency
>>>>>>> master

export default api;
