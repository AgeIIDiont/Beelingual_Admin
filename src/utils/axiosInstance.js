import { BASE_URL } from "../constant/index";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");

    if (token && isTokenExpired(token)) {
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        token = res.data.accessToken;
        setAccessToken(token);
      } catch (err) {
        console.error("Proactive refresh failed:", err);
        setAccessToken(null);
        window.location.href = "/auth/login";
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response (fallback khi bị 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed after 401:", err);
        setAccessToken(null);
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
