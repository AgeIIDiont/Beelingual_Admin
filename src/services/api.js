import axios from 'axios';

// Tạo instance của Axios với cấu hình mặc định
const api = axios.create({
  baseURL: 
  import.meta.env.VITE_API_BASE_URL 
  || 
  'http://localhost:3000', 

  // Thời gian chờ tối đa cho 1 request (10 giây)
  timeout: 10000, 

// Gửi kèm cookie (nếu có) trong các request cross-site
  withCredentials: true, 

  // 3. Các Header mặc định
  headers: {
    'Content-Type': 'application/json',
    // Không cần thêm header 'Authorization' ở đây nữa vì Cookie tự động lo rồi.
  },
});

// -----------------------------------------------------------------------------
// Ghi chú về Interceptors:
// Request/Response interceptors (xử lý token hết hạn, refresh token, redirect 401...)
// hiện đang được quản lý bên file 'authService.js' để tránh lỗi vòng lặp (circular dependency).
// -----------------------------------------------------------------------------

export default api;