// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
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

  const statsConfig = stats ? [
    {
      title: "Tổng từ vựng",
      number: stats.vocabulary,
      subtitle: "Từ & Cụm từ trong hệ thống",
      icon: "fa-book",
      iconBg: "bg-warning-honey"
    },
    {
      title: "Chủ điểm ngữ pháp",
      number: stats.grammar,
      subtitle: "Bài học ngữ pháp chi tiết",
      icon: "fa-spell-check",
      iconBg: "bg-orange-honey"
    },
    {
      title: "Chủ đề học",
      number: stats.topics,
      subtitle: "Topics & Units",
      icon: "fa-tags",
      iconBg: "bg-brown-honey"
    },
    {
      title: "Bài tập & Đề thi",
      number: stats.exercises,
      subtitle: "Bài tập đã tạo & sẵn sàng",
      icon: "fa-file-alt",
      iconBg: "bg-dark-honey"
    }
  ] : [];

  return (
    <Layout>
      <Header title="Chào mừng quay lại," subtitle="Admin!" />

      {loading && <Loading message="Đang tải dữ liệu thống kê..." />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && stats && (
        <>
          <div className="row g-4 mb-4">
            {statsConfig.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-xl-3">
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-12">
              <div className="bg-white rounded-4 shadow-sm p-4 border-0">
                <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: '#2D3142' }}>
                  <i className="fas fa-bolt text-honey me-2"></i>
                  Thao tác nhanh
                </h5>
                <div className="d-flex flex-wrap gap-3">
                  <button className="btn btn-honey-primary quick-action-btn rounded-3 px-4 py-2">
                    <i className="fas fa-plus-circle me-2"></i>
                    Thêm từ vựng
                  </button>
                  <button className="btn btn-honey-primary quick-action-btn rounded-3 px-4 py-2">
                    <i className="fas fa-book-open me-2"></i>
                    Tạo bài học
                  </button>
                  <button className="btn btn-honey-primary quick-action-btn rounded-3 px-4 py-2">
                    <i className="fas fa-clipboard-check me-2"></i>
                    Tạo đề thi
                  </button>
                  <button className="btn btn-honey-secondary quick-action-btn rounded-3 px-4 py-2">
                    <i className="fas fa-chart-line me-2"></i>
                    Xem báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;