import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { getDashboardStats } from '../services/dashboardService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError('Không thể tải dữ liệu thống kê');
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      <div className="bg-white rounded-4 shadow p-4 mb-5 d-flex justify-content-between align-items-center">
        <h1 className="h3 fw-bold text-dark mb-0">
          Chào mừng quay lại, <span className="text-warning">Admin</span>!
        </h1>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">Xin chào, Admin</span>
          <img 
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="admin" 
            className="rounded-circle border border-warning border-4" 
            width="56" 
            height="56" 
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải dữ liệu thống kê...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && stats && (
        <div className="row g-5">
          <div className="col-12 col-md-6">
            <StatsCard 
              title="Tổng từ vựng"
              number={stats.vocabulary} 
              subtitle="Từ & Cụm từ trong hệ thống"
              icon="fa-book"
            />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard 
              title="Chủ điểm ngữ pháp"
              number={stats.grammar} 
              subtitle="Bài học ngữ pháp chi tiết"
              icon="fa-spell-check"
            />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard 
              title="Chủ đề học"
              number={stats.topics} 
              subtitle="Topics & Units"
              icon="fa-tags"
            />
          </div>
          <div className="col-12 col-md-6">
            <StatsCard 
              title="Bài tập & Đề thi"
              number={stats.exercises} 
              subtitle="Bài tập đã tạo & sẵn sàng"
              icon="fa-file-alt"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

