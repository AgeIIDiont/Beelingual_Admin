import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import AreaChartCard from '../components/ui/AreaChartCard';
import LeaderboardCard from '../components/ui/LeaderboardCard';
import {
  fetchProfile,
  fetchVocabulary,
  fetchGrammar,
  fetchTopics,
  fetchExercises,
  fetchStatsNewUsers,
  fetchUsers
} from '../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [_profile, setProfile] = useState(null);
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

        const getTotal = (res) => {
          if (Array.isArray(res)) return res.length;
          return res && res.total ? res.total : 0;
        };

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

  // Effect xử lý update profile
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
