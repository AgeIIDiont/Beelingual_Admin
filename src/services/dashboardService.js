// Service để fetch dashboard statistics
// TODO: Thay bằng real API call khi backend sẵn sàng

// import api from './api';
import { fetchDashboardStats } from '../data/mockData';

/**
 * Fetch dashboard statistics from API
 * @returns {Promise<Object>} Dashboard statistics data (chỉ các số liệu)
 */
export const getDashboardStats = async () => {
  try {
    // TODO: Thay bằng real API call khi backend sẵn sàng
    // const response = await api.get('/dashboard/stats');
    // return {
    //   success: true,
    //   data: response.data
    // };
    
    // Mock data cho development (giả lập axios response format)
    const mockResponse = await fetchDashboardStats();
    return mockResponse;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

