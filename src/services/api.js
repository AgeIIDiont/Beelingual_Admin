import axios from 'axios';
import { getToken } from './authService'; // Import hàm lấy token

const api = axios.create({
  // SỬA: Trỏ về server thật của bạn
  baseURL: 'https://english-app-mupk.onrender.com/api', 
  timeout: 20000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;
