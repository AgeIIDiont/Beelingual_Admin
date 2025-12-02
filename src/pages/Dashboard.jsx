import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
// Import component chung mới
import AreaChartCard from '../components/ui/AreaChartCard'; 
import { 
  fetchProfile, 
  fetchVocabulary, 
  fetchGrammar, 
  fetchTopics, 
  fetchExercises, 
  fetchStatsNewUsers 
} from '../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userChartData, setUserChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          profileRes, 
          vocabRes, 
          grammarRes, 
          topicsRes, 
          exercisesRes,
          newUsersRes
        ] = await Promise.all([
          fetchProfile(),
          fetchVocabulary({ page: 1, limit: 1 }),
          fetchGrammar({ page: 1, limit: 1 }),
          fetchTopics({ page: 1, limit: 1 }),
          fetchExercises({ page: 1, limit: 1 }),
          fetchStatsNewUsers()
        ]);

        setProfile(profileRes);
        setUserChartData(newUsersRes);

        const getTotal = (res) => (res && res.total ? res.total : 0);

        setStats({
          vocabulary: getTotal(vocabRes),
          grammar: getTotal(grammarRes),
          topics: getTotal(topicsRes),
          exercises: getTotal(exercisesRes),
        });
      } catch (err) {
        console.error('Lỗi tải Dashboard:', err);
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Effect xử lý update profile (giữ nguyên code cũ của bạn)
  useEffect(() => {
    const handler = (e) => { if (e.detail) setProfile(e.detail); };
    window.addEventListener('auth:userUpdated', handler);
    return () => window.removeEventListener('auth:userUpdated', handler);
  }, []);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert alert-warning" role="alert">{error}</div>}

      {/* Content */}
      {!loading && !error && stats && (
        <>
          {/* Hàng 1: Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-6 col-md-3">
              <StatsCard title="Tổng từ vựng" number={stats.vocabulary} subtitle="Từ & cụm từ" icon="fa-book" />
            </div>
            <div className="col-6 col-md-3">
              <StatsCard title="Ngữ pháp" number={stats.grammar} subtitle="Chủ điểm ngữ pháp" icon="fa-spell-check" />
            </div>
            <div className="col-6 col-md-3">
              <StatsCard title="Chủ đề" number={stats.topics} subtitle="Topics & Units" icon="fa-tags" />
            </div>
            <div className="col-6 col-md-3">
              <StatsCard title="Bài tập" number={stats.exercises} subtitle="Đề thi & bài tập" icon="fa-file-alt" />
            </div>
          </div>

          {/* Hàng 2: Biểu đồ */}
          <div className="row g-4">
            {/* Biểu đồ 1: Người dùng mới (Màu xanh dương) */}
            <div className="col-12 col-lg-6">
              <AreaChartCard 
                title="Người dùng mới trong 7 ngày qua" 
                data={userChartData} 
                dataKey="count"       // Key trong object API: { count: 12 }
                color="#0d6efd"       // Màu xanh Primary
                unit="người"
              />
            </div>

            {/* Ví dụ Biểu đồ 2: Giả sử bạn muốn dùng lại component này cho thống kê khác (Màu vàng cam) */}
            {/* Bạn có thể bỏ đoạn này đi nếu chưa có dữ liệu */}
            <div className="col-12 col-lg-6">
               <AreaChartCard 
                title="Hoạt động bài tập (Demo)" 
                data={userChartData} // Tạm dùng chung data để demo
                dataKey="count"
                color="#ffc107"       // Màu vàng Warning
                unit="lượt làm"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;