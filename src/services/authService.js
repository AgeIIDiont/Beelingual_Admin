import api from './api';
import Swal from 'sweetalert2';
import store from '../store'; // Import redux store
import { setUser as setReduxUser, clearUser as clearReduxUser } from '../store/slices/userSlice';

const TOKEN_KEY = 'beelingual_admin_token';
const USER_KEY = 'beelingual_admin_user';

// ====================== CÁC HÀM CƠ BẢN ======================
// Token is stored as HttpOnly cookie by the backend. Do NOT persist token in localStorage.
export const getToken = () => null;

export const setToken = () => {
  // noop: token should be set as HttpOnly cookie by backend
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Dispatch to Redux to update UI immediately
    store.dispatch(setReduxUser(user));
  }
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
  // Debug: Log khi clearAuth được gọi
  console.log('clearAuth() called from:', new Error().stack);

  // Token cookie is cleared by backend (if necessary). Only remove local user copy.
  localStorage.removeItem(USER_KEY);
  store.dispatch(clearReduxUser());
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

// ====================== QUÊN MẬT KHẨU ======================
export const forgotPassword = async (username) => {
  try {
    const response = await api.post('/api/forgot-password', { username });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (username, otp, newPassword) => {
  try {
    const response = await api.post('/api/reset-password', { username, otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ====================== ĐĂNG XUẤT ======================
export const logout = async () => {
  try {
    // Ask backend to clear auth cookie if endpoint exists
    await api.post('/api/logout').catch(() => { });
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
// Flag để ngăn PrivateRoutes redirect khi đang hiển thị alert
let showingSessionAlert = false;

export const isShowingSessionAlert = () => showingSessionAlert;

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
      // Throw object containing code to handle it later
      const err = new Error(errorData.message || 'Refresh token thất bại');
      err.code = errorData.code;
      throw err;
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
      // Debug: Log toàn bộ error response để kiểm tra
      console.log('401 Error Response:', {
        data: error.response.data,
        headers: error.response.headers,
        config: error.config
      });

      // Check for concurrent login session - kiểm tra cả code và message
      const errorData = error.response.data || {};
      const errorCode = errorData.code;
      const errorMessage = errorData.message || errorData.error || '';

      // Kiểm tra SESSION_EXPIRED qua code hoặc message
      if (errorCode === 'SESSION_EXPIRED' || errorMessage.includes('đăng nhập ở một thiết bị khác') || errorMessage.includes('concurrent login')) {
        // Nếu đã đang hiển thị alert rồi, không hiển thị nữa (tránh duplicate)
        if (showingSessionAlert) {
          console.log('Session alert already showing, skipping duplicate');
          return new Promise(() => { });
        }

        // Đánh dấu đang hiển thị alert để ngăn PrivateRoutes redirect
        showingSessionAlert = true;
        console.log('Showing SESSION_EXPIRED alert');
        Swal.fire({
          title: 'Cảnh báo đăng nhập',
          text: 'Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Vui lòng đăng nhập lại.',
          icon: 'warning',
          confirmButtonText: 'Đăng nhập lại',
          confirmButtonColor: '#fbbf24',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then((result) => {
          if (result.isConfirmed) {
            showingSessionAlert = false;
            clearAuth();
            window.location.href = '/login';
          }
        });
        return new Promise(() => { });
      }

      // Kiểm tra REFRESH_TOKEN_EXPIRED qua code hoặc message
      // UPDATE: Loại trừ TOKEN_EXPIRED (Access Token hết hạn) để cho phép nó lọt xuống logic auto-refresh bên dưới
      if (errorCode === 'REFRESH_TOKEN_EXPIRED' || ((errorMessage.includes('hết hạn') || errorMessage.includes('expired')) && errorCode !== 'TOKEN_EXPIRED')) {
        // Đánh dấu đang hiển thị alert
        showingSessionAlert = true;
        Swal.fire({
          title: 'Hết phiên đăng nhập',
          text: 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.',
          icon: 'info',
          confirmButtonText: 'Đăng nhập lại',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then((result) => {
          if (result.isConfirmed) {
            showingSessionAlert = false;
            clearAuth();
            window.location.href = '/login';
          }
        });
        return new Promise(() => { });
      }

      // Nếu không phải SESSION_EXPIRED hay REFRESH_TOKEN_EXPIRED
      // Có thể là concurrent login nhưng backend không trả đúng code/message
      // Hoặc là các lỗi 401 khác → Hiển thị alert trước khi thử refresh
      const isLoginRequest = originalRequest.url?.includes('/login');

      if (isLoginRequest) {
        // Nếu là request login bị 401 thì không refresh, trả về lỗi luôn
        return Promise.reject(error);
      }

      // Log để debug
      console.log('401 but no specific code - will try refresh. Error:', {
        code: errorCode,
        message: errorMessage
      });

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
        // Refresh thất bại -> Không reject queue để tránh lỗi đỏ ở UI (vì sắp redirect rồi)
        // Chỉ cần clear queue để các request đó "treo" luôn
        failedQueue = [];
        isRefreshing = false;

        console.log('Refresh failed completely. Error:', refreshError);

        // Prevent duplicate alerts in catch block
        if (showingSessionAlert) {
          return new Promise(() => { });
        }

        // ALWAYS show alert regardless of error code to prevent immediate redirect
        showingSessionAlert = true;

        let alertTitle = 'Hết phiên đăng nhập';
        let alertText = 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.';
        let alertIcon = 'info';

        // Customise message if specific code
        if (refreshError?.code === 'SESSION_EXPIRED' || refreshError?.message?.includes('thiết bị khác')) {
          alertTitle = 'Cảnh báo đăng nhập';
          alertText = 'Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Vui lòng đăng nhập lại.';
          alertIcon = 'warning';
        }

        /* 
           QUAN TRỌNG: Trả về một Promise treo (không bao giờ resolve/reject) 
           để ngăn chặn các logic khác (như redirect tự động) chạy đè lên Alert. 
           Việc redirect sẽ được thực hiện thủ công trong Swal.then() 
        */
        Swal.fire({
          title: alertTitle,
          text: alertText,
          icon: alertIcon,
          confirmButtonText: 'Đăng nhập lại',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then((result) => {
          if (result.isConfirmed) {
            showingSessionAlert = false;
            clearAuth();
            window.location.href = '/login';
          }
        });

        return new Promise(() => { }); // Treo request vô hạn cho đến khi user bấm nút
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
  forgotPassword,
  resetPassword
};
