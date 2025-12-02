import React, { useMemo, useEffect, useRef } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A', label: 'Level A' },
  { value: 'B', label: 'Level B' },
  { value: 'C', label: 'Level C' },
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
        label: 'Tìm kiếm (Tên/Email)',
        type: 'text',
        placeholder: 'Nhập từ khóa...',
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
        options: [
          { value: 'A', label: 'Level A' },
          { value: 'B', label: 'Level B' },
          { value: 'C', label: 'Level C' },
        ],
        defaultValue: 'A',
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
      level: values.level || 'A',
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
    level: item.level || 'A',
    xp: item.xp ?? 0,
    gems: item.gems ?? 0,
    avatarUrl: item.avatarUrl || '',
  });

  return (
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
  );
};

export default Users;

