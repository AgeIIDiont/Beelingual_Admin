// Mock data cho Dashboard statistics - chỉ mock số liệu (number)
export const mockDashboardStats = {
  vocabulary: 8542,
  grammar: 126,
  topics: 48,
  exercises: 324
};

export const fetchDashboardStats = async () => {
  // Simulate API delay (800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    data: mockDashboardStats, // Chỉ các số liệu thống kê
    timestamp: new Date().toISOString()
  };
};

