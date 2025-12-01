import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { fetchProfile, fetchVocabulary, fetchGrammar, fetchTopics, fetchExercises } from '../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null); // ← Đổi từ user → profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi song song: profile + từng endpoint (mỗi endpoint trả về object có total)
        const [profileRes, vocabRes, grammarRes, topicsRes, exercisesRes] = await Promise.all([
          fetchProfile(),
          fetchVocabulary({ page: 1, limit: 1 }),
          fetchGrammar({ page: 1, limit: 1 }),
          fetchTopics({ page: 1, limit: 1 }),
          fetchExercises({ page: 1, limit: 1 }),
        ]);

        setProfile(profileRes);

        const getTotal = (res) => {
          if (!res) return 0;
          return res.total ?? 0;
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

  // Khi profile thay đổi (ví dụ: đổi avatar ở Settings), tự động cập nhật
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('auth:userUpdated', handler);
    return () => window.removeEventListener('auth:userUpdated', handler);
  }, []);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      {/* Welcome Header */}
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
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* Stats */}
      {!loading && !error && stats && (
        <div className="row g-5">
          <div className="col-12 col-md-6">
            <StatsCard title="Tổng từ vựng" number={stats.vocabulary} subtitle="Từ & cụm từ" icon="fa-book" />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard title="Ngữ pháp" number={stats.grammar} subtitle="Chủ điểm ngữ pháp" icon="fa-spell-check" />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard title="Chủ đề" number={stats.topics} subtitle="Topics & Units" icon="fa-tags" />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard title="Bài tập" number={stats.exercises} subtitle="Đề thi & bài tập" icon="fa-file-alt" />
          </div>
        </div>
      )}
    </div>
  );
};
    export default Dashboard;