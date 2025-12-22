import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../store/slices/userSlice';
import StatsCard from '../components/ui/StatsCard';
import AreaChartCard from '../components/ui/AreaChartCard';
import LeaderboardCard from '../components/ui/LeaderboardCard';
import {
  fetchVocabulary,
  fetchGrammar,
  fetchTopics,
  fetchExercises,
  fetchGrammarExercises,
  fetchStatsNewUsers,
  fetchUsers
} from '../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  // const reduxProfile = useSelector(selectUser);
  const [userChartData, setUserChartData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          vocabRes,
          grammarRes,
          topicsRes,
          exercisesRes,
          grammarExercisesRes,
          newUsersRes
        ] = await Promise.all([
          fetchVocabulary({ page: 1, limit: 1 }),
          fetchGrammar({ page: 1, limit: 1 }),
          fetchTopics({ page: 1, limit: 1 }),
          // Regular exercises - API trả về total đúng
          fetchExercises({ page: 1, limit: 1 }),
          // Grammar exercises - fetch all vì API không hỗ trợ total
          fetchGrammarExercises({}),
          fetchStatsNewUsers()
        ]);

        setUserChartData(newUsersRes);

        // Hàm lấy total từ API response
        const getTotal = (res) => {
          if (Array.isArray(res)) return res.length;
          // API thường trả về total/count
          if (res && typeof res.total === 'number') return res.total;
          if (res && typeof res.count === 'number') return res.count;
          // Fallback: đếm từ data array
          if (res && res.data && Array.isArray(res.data)) return res.data.length;
          if (res && res.items && Array.isArray(res.items)) return res.items.length;
          return 0;
        };

        // Tổng bài tập = exercises (từ API total) + grammar exercises (đếm array)
        const regularExercisesCount = getTotal(exercisesRes);
        const grammarExercisesCount = grammarExercisesRes?.data?.length || grammarExercisesRes?.length || 0;
        const totalExercises = regularExercisesCount + grammarExercisesCount;

        setStats({
          vocabulary: getTotal(vocabRes),
          grammar: getTotal(grammarRes),
          topics: getTotal(topicsRes),
          exercises: totalExercises,
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

  // Load top users - Xử lý hoàn toàn ở frontend
  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        setLeaderboardLoading(true);
        const data = await fetchUsers({ page: 1, limit: 100 });

        const users = data.users || data.data || [];
        const sortedUsers = users
          .sort((a, b) => (b.xp || 0) - (a.xp || 0))
          .slice(0, 5);

        setTopUsers(sortedUsers);
      } catch (err) {
        console.error('Lỗi tải bảng xếp hạng:', err);
        setTopUsers([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    loadTopUsers();
  }, []);

  return (
    <div className="container-fluid py-4">
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

          {/* Hàng 2: Biểu đồ & Bảng xếp hạng */}
          <div className="row g-4">
            {/* Biểu đồ: Người dùng mới */}
            <div className="col-12 col-lg-7">
              <AreaChartCard
                title="Người dùng mới trong 7 ngày qua"
                data={userChartData}
                dataKey="count"
                color="#0d6efd"
                unit="người"
              />
            </div>

            {/* Bảng xếp hạng */}
            <div className="col-12 col-lg-5">
              <LeaderboardCard users={topUsers} loading={leaderboardLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
