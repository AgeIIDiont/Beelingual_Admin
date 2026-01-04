import React, { useMemo, useEffect, useRef } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  fetchUserStats,
} from '../services/adminService';
import StatsCard from '../components/ui/StatsCard';
import { usePage } from '../contexts/PageContext';

const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A1', label: 'Level A1' },
  { value: 'A2', label: 'Level A2' },
  { value: 'B1', label: 'Level B1' },
  { value: 'B2', label: 'Level B2' },
  { value: 'C1', label: 'Level C1' },
  { value: 'C2', label: 'Level C2' },
];

const roleOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'admin', label: 'Admin' },
  { value: 'student', label: 'Học viên' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
};

const Users = () => {
  const { setPageInfo } = usePage();
  const resourceManagerRef = useRef(null);

  useEffect(() => {
    const handleRefresh = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.refresh();
      }
    };

    const handleCreate = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.openCreateForm();
      }
    };

    setPageInfo({
      title: 'Người dùng',
      description: 'Quản lý tài khoản admin và học viên trên hệ thống Beelingual.',
      actions: (
        <>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleRefresh}
          >
            <i className="fas fa-rotate me-2"></i>
            Làm mới
          </button>
          <button className="btn btn-warning text-dark fw-bold" onClick={handleCreate}>
            <i className="fas fa-plus me-2" />
            Thêm người dùng
          </button>
        </>
      ),
    });
    return () => setPageInfo({ title: '', description: '', actions: null });
  }, [setPageInfo]);

  const columns = useMemo(
    () => [
      {
        key: 'username',
        label: 'Người dùng',
        render: (item) => (
          <div>
            <div className="fw-bold text-capitalize" style={{ color: 'var(--text-primary)' }}>{item.fullname || item.username}</div>
            <small style={{ color: 'var(--text-muted)' }}>{item.username}{item.email ? ` · ${item.email}` : ''}</small>
          </div>
        ),
      },
      {
        key: 'role',
        label: 'Vai trò',
        render: (item) => (
          <span className={`badge ${item.role === 'admin' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
            {item.role === 'admin' ? 'Admin' : 'Học viên'}
          </span>
        ),
      },
      {
        key: 'level',
        label: 'Trình độ',
        render: (item) => item.level || '—',
      },
      {
        key: 'xp',
        label: 'XP / Gems',
        render: (item) => (
          <div>
            <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{item.xp ?? 0} XP</span>
            <div className="small" style={{ color: 'var(--text-muted)' }}>{item.gems ?? 0} gems</div>
          </div>
        ),
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        render: (item) => formatDate(item.createdAt),
      },
    ],
    []
  );

  const filters = useMemo(
    () => [
      {
        name: 'search',
        label: 'Tìm kiếm ',
        type: 'text',
        placeholder: 'Nhập tên hoặc email...',
        col: 4,
      },
      {
        name: 'role',
        label: 'Vai trò',
        type: 'select',
        options: roleOptions,
        col: 4,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions,
        col: 4,
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: 'username',
        label: 'Tên đăng nhập',
        type: 'text',
        required: true,
        placeholder: 'vd: admin_bee',
        col: 6,
      },
      {
        name: 'fullname',
        label: 'Họ và tên',
        type: 'text',
        placeholder: 'vd: Nguyễn Văn A',
        col: 6,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        placeholder: 'admin@beelingual.app',
        col: 6,
      },
      {
        name: 'password',
        label: 'Mật khẩu',
        type: 'password',
        required: true,
        placeholder: 'Tối thiểu 6 ký tự',
        onlyCreate: true,
        col: 6,
      },
      {
        name: 'role',
        label: 'Vai trò',
        type: 'select',
        options: roleOptions.slice(1),
        defaultValue: 'student',
        col: 3,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A1',
        col: 3,
      },
      {
        name: 'xp',
        label: 'Điểm kinh nghiệm (XP)',
        type: 'number',
        defaultValue: 0,
        col: 3,
        disabledOnEdit: true,
      },
      {
        name: 'gems',
        label: 'Gems',
        type: 'number',
        defaultValue: 0,
        col: 3,
        disabledOnEdit: true,
      },
      {
        name: 'avatarUrl',
        label: 'Ảnh đại diện',
        type: 'text',
        placeholder: 'https://...',
        col: 12,
        helper: 'URL ảnh đại diện nếu có',
      }
    ],
    []
  );

  const buildPayload = (values, isEdit) => {
    const payload = {
      fullname: values.fullname?.trim(),
      username: values.username?.trim(),
      email: values.email?.trim(),
      role: values.role || 'student',
      level: values.level || 'A1',
      xp: Number.isFinite(values.xp) ? values.xp : Number(values.xp || 0),
      gems: Number.isFinite(values.gems) ? values.gems : Number(values.gems || 0),
      avatarUrl: values.avatarUrl?.trim(),
    };

    if (!isEdit) {
      payload.password = values.password?.trim();
    }

    // Remove undefined/empty values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  const mapUserToForm = (item) => ({
    fullname: item.fullname || '',
    username: item.username || '',
    email: item.email || '',
    password: '',
    role: item.role || 'student',
    level: item.level || 'A1',
    xp: item.xp ?? 0,
    gems: item.gems ?? 0,
    avatarUrl: item.avatarUrl || '',
  });

  // State for stats
  const [userStats, setUserStats] = React.useState(null);
  const [statsLoading, setStatsLoading] = React.useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchUserStats();
        setUserStats(data);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Stats Section */}
      {!statsLoading && userStats && (
        <div className="mb-5">
          {/* Stats Cards Row */}
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
          </div>

          {/* Detail Cards Row */}
          <div className="row g-4">
            {/* Level Distribution Card */}
            <div className="col-lg-6">
              <div
                className="h-100"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-hover)',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fas fa-chart-pie text-white" style={{ fontSize: '0.9rem' }}></i>
                    </span>
                    Phân bổ cấp độ
                  </h5>
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                  <table className="table table-borderless align-middle mb-0">
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f3f5' }}>
                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0.75rem 0' }}>
                          Cấp độ
                        </th>
                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0.75rem 0', textAlign: 'right' }}>
                          Số lượng
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Sắp xếp theo thứ tự A1 → C2
                        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                        const sortedStats = [...(userStats?.levelStats || [])].sort((a, b) => {
                          const indexA = levelOrder.indexOf(a._id);
                          const indexB = levelOrder.indexOf(b._id);
                          // Nếu không tìm thấy trong levelOrder, đẩy xuống cuối
                          if (indexA === -1 && indexB === -1) return 0;
                          if (indexA === -1) return 1;
                          if (indexB === -1) return -1;
                          return indexA - indexB;
                        });

                        return sortedStats.map((item, idx) => (
                          <tr
                            key={item._id || 'unknown'}
                            style={{
                              borderBottom: idx < (sortedStats.length - 1) ? '1px solid #f1f3f5' : 'none',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.875rem 0' }}>
                              <span
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                  background: item._id?.startsWith('A') ? '#77f9a4ff' :
                                    item._id?.startsWith('B') ? '#fff04dff' :
                                      item._id?.startsWith('C') ? '#f76161ff' : '#f1f5f9',
                                  color: item._id?.startsWith('A') ? '#066229ff' :
                                    item._id?.startsWith('B') ? '#442605ff' :
                                      item._id?.startsWith('C') ? '#630b0bff' : '#475569',
                                  fontWeight: 600
                                }}
                              >
                                {item._id || 'Chưa xác định'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', padding: '0.875rem 0' }}>
                              <span className="fw-bold text-dark">{item.count}</span>
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}> người</span>
                            </td>
                          </tr>
                        ));
                      })()}
                      {!userStats?.levelStats?.length && (
                        <tr>
                          <td colSpan={2} className="text-center py-4" style={{ color: '#94a3b8' }}>
                            <i className="fas fa-inbox fa-2x mb-2 d-block" style={{ opacity: 0.5 }}></i>
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Users Card */}
            <div className="col-lg-6">
              <div
                className="h-100"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-hover)',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fas fa-user-plus text-white" style={{ fontSize: '0.9rem' }}></i>
                    </span>
                    Đăng ký gần đây
                  </h5>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  {(userStats?.recentUsers || []).map((user) => (
                    <div
                      key={user._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        margin: '0.25rem 0',
                        transition: 'all 0.2s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${user.role === 'admin' ? '#fbbf24' : '#60a5fa'} 0%, ${user.role === 'admin' ? '#f59e0b' : '#3b82f6'} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {(user.fullname || user.username || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{user.fullname || user.username}</div>
                          <small style={{ color: '#94a3b8' }}>
                            <span
                              className="badge me-1"
                              style={{
                                background: user.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                                color: user.role === 'admin' ? '#92400e' : '#1e40af',
                                fontWeight: 500,
                                fontSize: '0.7rem'
                              }}
                            >
                              {user.role === 'admin' ? 'Admin' : 'Học viên'}
                            </span>
                            {formatDate(user.createdAt)}
                          </small>
                        </div>
                      </div>
                      <span
                        className="badge rounded-pill px-2 py-1"
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 500
                        }}
                      >
                        {user.level || '—'}
                      </span>
                    </div>
                  ))}
                  {!userStats?.recentUsers?.length && (
                    <div className="text-center py-4" style={{ color: '#94a3b8' }}>
                      <i className="fas fa-user-slash fa-2x mb-2 d-block" style={{ opacity: 0.5 }}></i>
                      Chưa có dữ liệu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResourceManager
        ref={resourceManagerRef}
        resourceName="người dùng"
        columns={columns}
        filters={filters}
        formFields={formFields}
        listApi={fetchUsers}
        createApi={createUser}
        updateApi={updateUser}
        deleteApi={deleteUser}
        mapItemToForm={mapUserToForm}
        buildPayload={buildPayload}
        hideHeader={true}
      />
    </div>
  );
};

export default Users;