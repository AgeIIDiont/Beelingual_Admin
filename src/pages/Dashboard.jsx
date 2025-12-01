import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header'; // Giả sử bạn đã có component này
import StatsCard from '../components/StatsCard';
import { getDashboardStats } from '../services/dashboardService';
import { fetchProfile } from '../services/adminService'; 

// Component Loading đơn giản (nếu bạn chưa có file Loading riêng)
const Loading = () => (
  <div className="d-flex justify-content-center py-5">
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null); // ← Đổi từ user → profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
        // Giả lập data để bạn test giao diện ngay nếu API chưa có
        // const response = { success: true, data: { vocabulary: 8542, grammar: 126, topics: 48, exercises: 324 }};
        const response = await getDashboardStats();
        
        if (response.success && response.data) {
          setStats(response.data);
=======
        setError(null);

        // Gọi song song: profile + stats → nhanh hơn
        const [profileRes, statsRes] = await Promise.all([
          fetchProfile(),
          getDashboardStats(),
        ]);

        setProfile(profileRes);
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
>>>>>>> master
        } else {
          setError('Không thể tải thống kê');
        }
      } catch (err) {
<<<<<<< HEAD
        console.error('Error:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu');
=======
        console.error('Lỗi tải Dashboard:', err);
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
>>>>>>> master
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD
    loadDashboardStats();
=======

    loadData();
  }, []);

  // Khi profile thay đổi (ví dụ: đổi avatar ở Settings), tự động cập nhật
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('auth:userUpdated', handler);
    return () => window.removeEventListener('auth:userUpdated', handler);
>>>>>>> master
  }, []);

  const statsConfig = stats ? [
    {
      title: "Tổng từ vựng",
      number: stats.vocabulary || 0,
      subtitle: "Từ vựng hệ thống",
      icon: "fa-book",
      iconBg: "bg-gradient-warning" // Màu vàng
    },
    {
      title: "Ngữ pháp",
      number: stats.grammar || 0,
      subtitle: "Bài học chi tiết",
      icon: "fa-spell-check",
      iconBg: "bg-gradient-orange" // Màu cam
    },
    {
      title: "Chủ đề học",
      number: stats.topics || 0,
      subtitle: "Topics & Units",
      icon: "fa-tags",
      iconBg: "bg-gradient-brown" // Màu nâu
    },
    {
      title: "Bài tập & Đề",
      number: stats.exercises || 0,
      subtitle: "Sẵn sàng làm bài",
      icon: "fa-file-alt",
      iconBg: "bg-gradient-dark" // Màu tối
    }
  ] : [];

  return (
<<<<<<< HEAD
    <Layout>
      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-end dashboard-header mb-5">
        <div>
          <h2 className="welcome-title mb-1">
            Chào mừng quay lại, <span className="welcome-name">Admin!</span>
          </h2>
          <p className="text-muted mb-0">Đây là tổng quan hệ thống Beelingual hôm nay.</p>
        </div>
        <div className="d-none d-md-block">
          <span className="text-muted small">
            <i className="far fa-calendar-alt me-2"></i>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {loading && <Loading />}
      
      {error && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
          <i className="fas fa-exclamation-triangle me-3 fs-4"></i> {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Stats Grid */}
          <div className="row g-4 mb-5">
            {statsConfig.map((stat, index) => (
              <div key={index} className="col-12 col-md-6 col-xl-3">
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="row">
            <div className="col-12">
              <div className="quick-action-card shadow-sm">
                <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: '#2D3142' }}>
                  <i className="fas fa-bolt text-warning me-2"></i>
                  Thao tác nhanh
                </h5>
                <div className="d-flex flex-wrap gap-3">
                  <button className="action-btn btn-honey-fill">
                    <i className="fas fa-plus-circle"></i>
                    Thêm từ vựng
                  </button>
                  <button className="action-btn btn-honey-fill">
                    <i className="fas fa-book-open"></i>
                    Tạo bài học
                  </button>
                  <button className="action-btn btn-honey-fill">
                    <i className="fas fa-clipboard-check"></i>
                    Tạo đề thi
                  </button>
                  <div className="vr d-none d-md-block mx-2 text-muted"></div>
                  <button className="action-btn btn-honey-soft">
                    <i className="fas fa-chart-line"></i>
                    Xem báo cáo chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
=======
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
>>>>>>> master
      )}
    </Layout>
  );
};

export default Dashboard;