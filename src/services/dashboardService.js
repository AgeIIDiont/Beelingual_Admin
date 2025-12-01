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
    const mockResponse = await fetchDashboardStats();
    return mockResponse;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

