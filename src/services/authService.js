// src/services/auth.js
import api from './api';

const TOKEN_KEY = 'beelingual_admin_token';
const USER_KEY = 'beelingual_admin_user';

// ====================== CÁC HÀM CƠ BẢN ======================
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => !!getToken();

// ====================== ĐĂNG NHẬP ======================
export const login = async (username, password) => {
  try {
    const response = await api.post('/api/admin/login', {
      username: username.trim(),
      password,
    });

    const { token, user, message } = response.data;

    if (!token || !user) {
      throw new Error('Server trả về dữ liệu không hợp lệ');
    }

    setToken(token);
    setUser(user);

    return { success: true, user, token, message };
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
export const logout = () => {
  clearAuth();
  // Dùng href để reload hoàn toàn trang → tránh bấm Back vào được trang cũ
  window.location.href = '/login';
};

// ====================== INTERCEPTORS ======================
// Thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý 401 toàn cục (token hết hạn / không hợp lệ)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        console.warn('Token hết hạn → tự động đăng xuất');
        logout();
      }
    }
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