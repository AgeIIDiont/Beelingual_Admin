import api from './api';

const unwrap = (promise) =>
  promise.then((response) => response.data).catch((error) => {
    const message = error?.response?.data?.message || error?.response?.data?.error || error.message;
    const err = new Error(message || 'Đã xảy ra lỗi');
    err.status = error?.response?.status;
    throw err;
  });

// ===== Dashboard & Stats =====
export const fetchDashboardOverview = () => unwrap(api.get('/api/admin/dashboard'));
export const fetchUserStats = () => unwrap(api.get('/api/admin/users-stats'));
export const fetchAdminLogs = (params = {}) => unwrap(api.get('/api/admin/logs', { params }));

// ===== Users =====
export const fetchUsers = (params = {}) => unwrap(api.get('/api/admin/users', { params }));
export const createUser = (payload) => unwrap(api.post('/api/admin/add_users', payload));
export const updateUser = (id, payload) => unwrap(api.put(`/api/admin/users/${id}`, payload));
export const deleteUser = (id) => unwrap(api.delete(`/api/admin/users/${id}`));
export const resetUserPassword = (id, newPassword) =>
  unwrap(api.put(`/api/admin/users/${id}/reset-password`, { newPassword }));

// ===== Vocabulary =====
export const fetchVocabulary = (params = {}) => unwrap(api.get('/api/vocab', { params }));
export const createVocabulary = (payload) => unwrap(api.post('/api/vocab', payload));
export const updateVocabulary = (id, payload) => unwrap(api.put(`/api/vocab/${id}`, payload));
export const deleteVocabulary = (id) => unwrap(api.delete(`/api/vocab/${id}`));

// ===== Grammar =====
export const fetchGrammar = (params = {}) => unwrap(api.get('/api/grammar', { params }));
export const createGrammar = (payload) => unwrap(api.post('/api/add_grammar', payload));
export const updateGrammar = (id, payload) => unwrap(api.put(`/api/edit_grammar/${id}`, payload));
export const deleteGrammar = (id) => unwrap(api.delete(`/api/delet_grammar/${id}`));

// ===== Topics =====
export const fetchTopics = (params = {}) => unwrap(api.get('/api/topics', { params }));
export const createTopic = (payload) => unwrap(api.post('/api/topics', payload));
export const updateTopic = (id, payload) => unwrap(api.put(`/api/edit_topic/${id}`, payload));
export const deleteTopic = (id) => unwrap(api.delete(`/api/delet_topic/${id}`));

// ===== Exercises =====
export const fetchExercises = (params = {}) => unwrap(api.get('/api/exercises', { params }));
export const createExercise = (payload) => unwrap(api.post('/api/exercises', payload));
export const updateExercise = (id, payload) => unwrap(api.put(`/api/edit_exercise/${id}`, payload));
export const deleteExercise = (id) => unwrap(api.delete(`/api/delet_exercise/${id}`));

// ===== Profile / Settings =====
export const fetchProfile = async () => {
  try {
    return await unwrap(api.get('/api/profile'));
  } catch (error) {
    if (error.status === 500) {
      console.warn('API /api/profile lỗi 500 → dùng fallback');
      const [user, streak] = await Promise.all([
        unwrap(api.get('/api/me')),
        unwrap(api.get('/api/my-streak')).catch(() => ({ current: 0, longest: 0 })),
      ]);
      return { ...user, streak: streak || { current: 0, longest: 0 } };
    }
    throw error;
  }
};
//============= Stats =============
export const fetchStatsNewUsers = () => unwrap(api.get('/api/admin/stats/new-users'));

//============= Profile =============
export const updateProfile = (payload) => unwrap(api.put('/api/profile', payload));
export const changePassword = (payload) => unwrap(api.put('/api/change-password', payload));
export const fetchMyStreak = () => unwrap(api.get('/api/my-streak'));


