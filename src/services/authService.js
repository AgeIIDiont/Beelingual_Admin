// Authentication service
// TODO: Thay bằng real API call khi backend sẵn sàng

import api from './api';

const TOKEN_KEY = 'beelingual_admin_token';
const USER_KEY = 'beelingual_admin_user';

/**
 * Lấy token từ localStorage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Lưu token vào localStorage
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Lưu thông tin user vào localStorage
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Lấy thông tin user từ localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Xóa token và user info
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Đăng nhập
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} Response từ API
 */
export const login = async (username, password) => {
  try {
    // TODO: Thay bằng real API call khi backend sẵn sàng
    // const response = await api.post('/auth/login', { username, password });
    // const { token, user } = response.data;
    // setToken(token);
    // setUser(user);
    // return { success: true, user };

    // Mock login cho development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Mock validation
    if (username && password) {
      const mockUser = {
        id: 1,
        username: username,
        name: 'Admin',
        email: 'admin@beelingual.com',
        role: 'admin'
      };
      const mockToken = 'mock_token_' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      
      return {
        success: true,
        user: mockUser,
        token: mockToken
      };
    } else {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = () => {
  clearAuth();
  // TODO: Gọi API logout nếu cần
  // await api.post('/auth/logout');
};

