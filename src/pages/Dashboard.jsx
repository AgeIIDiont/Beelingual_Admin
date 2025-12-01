import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { getDashboardStats } from '../services/dashboardService';
import { fetchProfile } from '../services/adminService'; 

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

        // Gọi song song: profile + stats → nhanh hơn
        const [profileRes, statsRes] = await Promise.all([
          fetchProfile(),
          getDashboardStats(),
        ]);

        setProfile(profileRes);
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        } else {
          setError('Không thể tải thống kê');
        }
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
      {/* Header chào mừng */}
      <div className="bg-white rounded-4 shadow p-4 mb-5 d-flex justify-content-between align-items-center">
        <h1 className="h3 fw-bold text-dark mb-0">
          Chào mừng quay lại,{' '}
          <span className="text-warning">
            {profile?.username || profile?.name || 'Admin'}!
          </span>
        </h1>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">
            Xin chào, {profile?.username || 'Admin'}
          </span>
          <img
            src={profile?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
            alt={profile?.username || 'admin'}
            className="rounded-circle border border-warning border-4"
            width={56}
            height={56}
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://randomuser.me/api/portraits/men/32.jpg';
            }}
          />
        </div>
      </div>

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