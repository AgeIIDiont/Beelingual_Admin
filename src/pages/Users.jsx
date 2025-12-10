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
            <div className="fw-bold text-dark text-capitalize">{item.fullname || item.username}</div>
            <small className="text-muted">{item.username}{item.email ? ` · ${item.email}` : ''}</small>
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
            <span className="text-dark fw-semibold">{item.xp ?? 0} XP</span>
            <div className="text-muted small">{item.gems ?? 0} gems</div>
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
      },
      {
        name: 'gems',
        label: 'Gems',
        type: 'number',
        defaultValue: 0,
        col: 3,
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
                        <div className="fw-semibold">{user.fullname || user.username}</div>
                        <small className="text-muted">
                          {user.role} • {formatDate(user.createdAt)}
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