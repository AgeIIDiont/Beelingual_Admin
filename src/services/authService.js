import api from './api'; // Import instance axios đã cấu hình ở trên

// Đặt tên key giống nhau để tránh nhầm lẫn
const TOKEN_KEY = 'accessToken'; 
const USER_KEY = 'beelingual_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

// SỬA: Hàm Login gọi API thật
export const login = async (username, password) => {
  try {
    // Gọi API thật lên Server
    const response = await api.post('/login', { username, password });
    const { token, ...userData } = response.data; 
    if (token) {
        setToken(token);
        setUser(userData);
        return { success: true, user: userData };
    } else {
        throw new Error("Không nhận được token từ server");
    }

  } catch (error) {
    console.error('Login error:', error);
    const message = error.response?.data?.message || 'Đăng nhập thất bại';
    throw new Error(message);
  }
};

export const logout = () => {
  clearAuth();
};