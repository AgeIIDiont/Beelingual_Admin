import React, { useEffect, useState } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { fetchAdminLogs, fetchUserStats } from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const formatDateTime = (value) => {
  if (!value) return '—';
  const dt = new Date(value);
  return `${dt.toLocaleDateString('vi-VN')} • ${dt.toLocaleTimeString('vi-VN')}`;
};

const Stats = () => {
  const { setPageInfo } = usePage();
  const [userStats, setUserStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [userStatsRes, logsRes] = await Promise.all([
        fetchUserStats(),
        fetchAdminLogs({ limit: 8 }),
      ]);

      setUserStats(userStatsRes);
      setLogs(logsRes.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageInfo({
      title: 'Thống kê hệ thống',
      description: 'Theo dõi sức khỏe dữ liệu và hoạt động của admin',
      actions: (
        <button className="btn btn-warning text-dark fw-bold" onClick={loadAll}>
          <i className="fas fa-rotate me-2" />
          Làm mới
        </button>
      ),
    });
    return () => setPageInfo({ title: '', description: '', actions: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPageInfo]); // loadAll is stable, no need to include it

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="text-muted mt-3">Đang tải thống kê...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
              <div className="col-md-4 col-sm-6">
              <StatsCard
                title="Tổng người dùng"
                number={userStats?.totalUsers || 0}
                subtitle="Tất cả tài khoản"
                icon="fa-users"
              />
            </div>
              <div className="col-md-4 col-sm-6">
              <StatsCard
                title="Quản trị viên"
                number={userStats?.adminsCount || 0}
                subtitle="Có quyền quản trị"
                icon="fa-user-shield"
              />
            </div>
              <div className="col-md-4 col-sm-6">
              <StatsCard
                title="Học viên"
                number={userStats?.studentsCount || 0}
                subtitle="Đang học trên app"
                icon="fa-graduation-cap"
              />
            </div>
            {/* Bài tập card removed per request */}
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="bg-white rounded-4 shadow p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Phân bổ cấp độ</h5>
                <table className="table table-borderless align-middle">
                  <thead>
                    <tr className="text-muted">
                      <th>Cấp độ</th>
                      <th className="text-end">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(userStats?.levelStats || []).map((item) => (
                      <tr key={item._id || 'unknown'}>
                        <td className="fw-medium">{item._id || 'Chưa xác định'}</td>
                        <td className="text-end">{item.count}</td>
                      </tr>
                    ))}
                    {!userStats?.levelStats?.length && (
                      <tr>
                        <td colSpan={2} className="text-center text-muted py-3">
                          Chưa có dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bg-white rounded-4 shadow p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Người dùng đăng ký gần đây</h5>
                <ul className="list-group list-group-flush">
                  {(userStats?.recentUsers || []).map((user) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={user._id}>
                      <div>
                        <div className="fw-semibold">{user.username}</div>
                        <small className="text-muted">
                          {user.role} • {formatDateTime(user.createdAt)}
                        </small>
                      </div>
                      <span className="badge bg-light text-dark">{user.level || '—'}</span>
                    </li>
                  ))}
                  {!userStats?.recentUsers?.length && (
                    <li className="list-group-item text-center text-muted">Chưa có dữ liệu.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4 shadow p-4 mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Nhật ký hoạt động của admin</h5>
              <span className="text-muted small">Hiển thị 8 hoạt động gần nhất</span>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted">
                    <th>Thời gian</th>
                    <th>Hành động</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDateTime(log.createdAt)}</td>
                      <td>
                        <span className="badge bg-warning text-dark text-uppercase">{log.action}</span>
                      </td>
                      <td>
                        <pre className="mb-0 small bg-light rounded-3 p-2">
                          {JSON.stringify(log.meta || {}, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {!logs.length && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        Chưa có hoạt động được ghi lại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;

