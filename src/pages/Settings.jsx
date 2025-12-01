import React, { useEffect, useState } from 'react';
import { changePassword, fetchProfile, updateProfile } from '../services/adminService';
import { logout, setUser } from '../services/authService';
import { usePage } from '../contexts/PageContext';

const Settings = () => {
  const { setPageInfo } = usePage();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ email: '', level: 'A', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      setProfile(data);
      setProfileForm({
        email: data.email || '',
        level: data.level || 'A',
        avatarUrl: data.avatarUrl || '',
      });
      // Update localStorage user and notify other parts of the app
      try {
        setUser(data);
        window.dispatchEvent(new CustomEvent('auth:userUpdated', { detail: data }));
      } catch {
        // no-op
      }
    } catch (err) {
      setProfileFeedback({ type: 'danger', message: err.message || 'Không thể tải thông tin tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageInfo({
      title: 'Cài đặt',
      description: 'Quản lý thông tin cá nhân và bảo mật tài khoản',
    });
    loadProfile();
    return () => setPageInfo({ title: '', description: '', actions: null });
  }, [setPageInfo]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileFeedback(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordFeedback(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      await updateProfile({
        email: profileForm.email.trim(),
        level: profileForm.level,
        avatarUrl: profileForm.avatarUrl.trim(),
      });
      setProfileFeedback({ type: 'success', message: 'Cập nhật thông tin cá nhân thành công.' });
      loadProfile();
      setTimeout(() => setProfileFeedback(null), 5000);
    } catch (err) {
      setProfileFeedback({ type: 'danger', message: err.message || 'Không thể cập nhật thông tin.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'danger', message: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'danger', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordFeedback({ type: 'success', message: 'Đổi mật khẩu thành công.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordFeedback(null), 5000);
    } catch (err) {
      setPasswordFeedback({ type: 'danger', message: err.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 px-4 px-lg-5">
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mt-3">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      {/* Profile Header Section */}
      <div className="bg-white rounded-4 shadow-lg mb-4 overflow-hidden">
        <div className="bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', height: '120px' }}></div>
        <div className="px-4 pb-4" style={{ marginTop: '-60px' }}>
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
            {/* Avatar */}
            <div className="position-relative">
              <img
                src={profile?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt={profile?.username || 'Admin'}
                className="rounded-circle border border-4 border-white shadow-lg"
                width={120}
                height={120}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://randomuser.me/api/portraits/men/32.jpg';
                }}
              />
              <div className="position-absolute bottom-0 end-0 bg-warning rounded-circle p-2 border border-3 border-white">
                <i className="fas fa-camera text-dark"></i>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow-1 text-center text-md-start">
              <h2 className="fw-bold text-dark mb-1">
                {profile?.username || 'Admin'}
              </h2>
              <p className="text-muted mb-2">{profile?.email || ''}</p>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
                <span className="badge bg-warning text-dark px-3 py-2">
                  <i className="fas fa-user-shield me-2"></i>
                  {profile?.role || 'Admin'}
                </span>
                {profile?.createdAt && (
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Tham gia: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-4 shadow mb-4">
        <ul className="nav nav-tabs border-0 px-4 pt-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''} border-0 pb-3`}
              onClick={() => setActiveTab('profile')}
              style={{ 
                color: activeTab === 'profile' ? '#FFC107' : '#6c757d',
                fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                borderBottom: activeTab === 'profile' ? '3px solid #FFC107' : '3px solid transparent'
              }}
            >
              <i className="fas fa-user me-2"></i>
              Thông tin cá nhân
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'password' ? 'active' : ''} border-0 pb-3`}
              onClick={() => setActiveTab('password')}
              style={{ 
                color: activeTab === 'password' ? '#FFC107' : '#6c757d',
                fontWeight: activeTab === 'password' ? 'bold' : 'normal',
                borderBottom: activeTab === 'password' ? '3px solid #FFC107' : '3px solid transparent'
              }}
            >
              <i className="fas fa-lock me-2"></i>
              Đổi mật khẩu
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-4 shadow p-4 p-lg-5">
            {profileFeedback && (
              <div className={`alert alert-${profileFeedback.type} alert-dismissible fade show`} role="alert">
                <i className={`fas ${profileFeedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                {profileFeedback.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setProfileFeedback(null)}
                ></button>
              </div>
            )}

            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-edit me-2 text-warning"></i>
              Chỉnh sửa thông tin
            </h5>

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={profile?.username || ''}
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                  <small className="text-muted">Tên đăng nhập không thể thay đổi</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="form-control form-control-lg"
                    placeholder="admin@beelingual.com"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    Cấp độ mặc định
                  </label>
                  <select
                    name="level"
                    value={profileForm.level}
                    onChange={handleProfileChange}
                    className="form-select form-select-lg"
                  >
                    <option value="A">Level A - Cơ bản</option>
                    <option value="B">Level B - Trung bình</option>
                    <option value="C">Level C - Nâng cao</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    Link ảnh đại diện
                  </label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={profileForm.avatarUrl}
                    onChange={handleProfileChange}
                    className="form-control form-control-lg"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <small className="text-muted">URL trực tiếp đến ảnh đại diện</small>
                </div>

                {profileForm.avatarUrl && (
                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark">Xem trước</label>
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <img
                        src={profileForm.avatarUrl}
                        alt={profile?.username || 'avatar'}
                        className="rounded-circle border border-2 border-warning"
                        width={80}
                        height={80}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://randomuser.me/api/portraits/men/32.jpg';
                        }}
                        style={{ objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-semibold text-dark">{profile?.username}</div>
                        <small className="text-muted">Ảnh đại diện sẽ được cập nhật</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setProfileForm({
                      email: profile?.email || '',
                      level: profile?.level || 'A',
                      avatarUrl: profile?.avatarUrl || '',
                    });
                    setProfileFeedback(null);
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-warning text-dark fw-bold px-4" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-4 shadow p-4 p-lg-5">
            {passwordFeedback && (
              <div className={`alert alert-${passwordFeedback.type} alert-dismissible fade show`} role="alert">
                <i className={`fas ${passwordFeedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                {passwordFeedback.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPasswordFeedback(null)}
                ></button>
              </div>
            )}

            <h5 className="fw-bold text-dark mb-4">
              <i className="fas fa-key me-2 text-warning"></i>
              Thay đổi mật khẩu
            </h5>

            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-4">
                <div className="col-md-8 col-lg-6">
                  <label className="form-label fw-semibold text-dark">
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-control border-start-0"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>
                </div>

                <div className="col-12"></div>

                <div className="col-md-8 col-lg-6">
                  <label className="form-label fw-semibold text-dark">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-key text-muted"></i>
                    </span>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="form-control border-start-0"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      required
                      minLength={6}
                    />
                  </div>
                  <small className="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
                </div>

                <div className="col-md-8 col-lg-6">
                  <label className="form-label fw-semibold text-dark">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-check-circle text-muted"></i>
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-control border-start-0"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Lưu ý:</strong> Mật khẩu mới phải khác với mật khẩu hiện tại và có độ dài tối thiểu 6 ký tự.
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordFeedback(null);
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-dark fw-bold px-4" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang đổi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key me-2"></i>
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* System Info Card */}
      <div className="bg-white rounded-4 shadow p-4 p-lg-5 mt-4">
        <h5 className="fw-bold text-dark mb-4">
          <i className="fas fa-info-circle me-2 text-warning"></i>
          Thông tin hệ thống
        </h5>
        <div className="row g-4">
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-light rounded">
              <p className="text-muted small mb-2">Vai trò</p>
              <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                {profile?.role || 'Admin'}
              </span>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-light rounded">
              <p className="text-muted small mb-2">Ngày tham gia</p>
              <p className="fw-bold mb-0">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-light rounded">
              <p className="text-muted small mb-2">XP</p>
              <p className="fw-bold mb-0 text-warning">
                <i className="fas fa-star me-2"></i>
                {profile?.xp ?? 0}
              </p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-light rounded">
              <p className="text-muted small mb-2">Gems</p>
              <p className="fw-bold mb-0 text-warning">
                <i className="fas fa-gem me-2"></i>
                {profile?.gems ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
