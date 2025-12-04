// src/services/auth.js
import api from './api';

const TOKEN_KEY = 'beelingual_admin_token';
const USER_KEY = 'beelingual_admin_user';

// ====================== CÁC HÀM CƠ BẢN ======================
// Token is stored as HttpOnly cookie by the backend. Do NOT persist token in localStorage.
export const getToken = () => null;

export const setToken = () => {
  // noop: token should be set as HttpOnly cookie by backend
};

export const setUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const str = localStorage.getItem(USER_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Lỗi parse user từ localStorage:', e);
    return null;
  }
};

export const clearAuth = () => {
  // Token cookie is cleared by backend (if necessary). Only remove local user copy.
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => !!getUser();

// ====================== ĐĂNG NHẬP ======================
export const login = async (username, password) => {
  try {
    const response = await api.post('/api/admin/login', {
      username: username.trim(),
      password,
    });

    const { user, message } = response.data;

    if (!user) {
      throw new Error('Server trả về dữ liệu không hợp lệ');
    }

    // Backend should set HttpOnly cookie; frontend stores only user info for UI state
    setUser(user);

    return { success: true, user, message };
  } catch (error) {
    let message = 'Đăng nhập thất bại. Vui lòng thử lại.';

    if (error.response) {
      const { status } = error.response;
      const msg = error.response.data?.message || error.response.data?.error;

      if (status === 401) message = msg || 'Tên đăng nhập hoặc mật khẩu không đúng';
      else if (status === 400) message = msg || 'Dữ liệu gửi lên không hợp lệ';
      else if (status >= 500) message = 'Lỗi máy chủ. Vui lòng thử lại sau';
      else message = msg || message;
    } else {
      message = 'Không kết nối được server. Kiểm tra mạng của bạn.';
    }

    console.error('Login error:', error);
    const err = new Error(message);
    err.status = error.response?.status;
    throw err;
  }
};

// ====================== ĐĂNG XUẤT ======================
export const logout = async () => {
  try {
    // Ask backend to clear auth cookie if endpoint exists
    await api.post('/api/logout').catch(() => {});
  } catch {
    // ignore
  }
  clearAuth();
  // Full reload to ensure protected routes redirect
  window.location.href = '/login';
};

// ====================== REFRESH TOKEN ======================
// Biến để theo dõi việc refresh token đang được thực hiện
let isRefreshing = false;
// Queue các request đang chờ refresh token hoàn thành
let failedQueue = [];

// Hàm xử lý queue các request đã fail
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm refresh access token
const refreshAccessToken = async () => {
  try {
    // Gọi API refresh token bằng fetch để tránh interceptor
    // refreshToken cookie sẽ tự động được gửi với credentials: 'include'
    const baseURL = api.defaults.baseURL || 'http://localhost:3000';
    const response = await fetch(`${baseURL}/api/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Quan trọng: gửi cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Refresh token thất bại');
    }

    const data = await response.json();
    
    // Backend tự động set accessToken cookie mới
    // Cập nhật user info nếu có
    if (data?.user) {
      setUser(data.user);
    }
    
    return data?.accessToken || true;
  } catch (error) {
    // Refresh token cũng hết hạn hoặc không hợp lệ → cần đăng nhập lại
    console.error('Refresh token thất bại:', error);
    throw error;
  }
};

// ====================== INTERCEPTORS ======================
// When backend uses HttpOnly cookies, Authorization header is not required here.
// Do not automatically inject local token into headers.

// Response interceptor - tự động refresh token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua nếu request này là refresh token endpoint hoặc đã retry
    const isRefreshEndpoint = originalRequest.url?.includes('/refresh-token');
    if (isRefreshEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Xử lý lỗi 401 - token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const isTokenExpired = errorCode === 'TOKEN_EXPIRED';

      // Nếu là lỗi token hết hạn, thử refresh
      if (isTokenExpired) {
        // Nếu đang refresh, thêm request vào queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // Retry request ban đầu sau khi refresh thành công
              originalRequest._retry = true;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // Bắt đầu refresh token
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshAccessToken();
          
          // Refresh thành công, xử lý queue và retry request ban đầu
          processQueue(null, true);
          isRefreshing = false;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh thất bại → xử lý queue và logout
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Chỉ logout nếu không phải đang ở trang login
          if (window.location.pathname !== '/login') {
            console.warn('Refresh token thất bại → tự động đăng xuất');
            logout();
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // Lỗi 401 khác (không phải TOKEN_EXPIRED) → logout
        if (window.location.pathname !== '/login') {
          console.warn('Token không hợp lệ → tự động đăng xuất');
          logout();
        }
        return Promise.reject(error);
      }
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  getUser,
  setToken,
  setUser,
  clearAuth,
};