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

// ====================== INTERCEPTORS ======================
// When backend uses HttpOnly cookies, Authorization header is not required here.
// Do not automatically inject local token into headers.

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