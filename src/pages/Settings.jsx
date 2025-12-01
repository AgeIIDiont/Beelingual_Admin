import React, { useEffect, useState } from 'react';
import { changePassword, fetchProfile, updateProfile } from '../services/adminService';
import { logout, setUser } from '../services/authService';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ email: '', level: 'A', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
      setFeedback({ type: 'danger', message: err.message || 'Không thể tải thông tin tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedback(null);

    try {
      await updateProfile({
        email: profileForm.email.trim(),
        level: profileForm.level,
        avatarUrl: profileForm.avatarUrl.trim(),
      });
      setFeedback({ type: 'success', message: 'Cập nhật thông tin cá nhân thành công.' });
      loadProfile();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Không thể cập nhật thông tin.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'danger', message: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }

    setChangingPassword(true);
    setFeedback(null);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setFeedback({ type: 'success', message: 'Đổi mật khẩu thành công.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      <div className="bg-white rounded-4 shadow p-4 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Cài đặt tài khoản</h1>
          <p className="text-muted mb-0">Quản lý thông tin đăng nhập và hồ sơ quản trị viên</p>
        </div>
        <button className="btn btn-outline-danger" onClick={logout}>
          <i className="fas fa-sign-out-alt me-2" />
          Đăng xuất
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} role="alert">
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="text-muted mt-3">Đang tải hồ sơ...</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="bg-white rounded-4 shadow p-4 h-100">
              <h5 className="fw-bold text-dark mb-3">Thông tin cá nhân</h5>
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted">Tên đăng nhập</label>
                  <input type="text" className="form-control" value={profile?.username || ''} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="admin@beelingual.app"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Cấp độ mặc định</label>
                  <select
                    name="level"
                    value={profileForm.level}
                    onChange={handleProfileChange}
                    className="form-select"
                  >
                    <option value="A">Level A</option>
                    <option value="B">Level B</option>
                    <option value="C">Level C</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Ảnh đại diện</label>
                  <input
                    type="text"
                    name="avatarUrl"
                    value={profileForm.avatarUrl}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="https://..."
                  />
                  <small className="text-muted">Link trực tiếp đến ảnh đại diện.</small>
                  {profileForm.avatarUrl && (
                    <div className="mt-3 d-flex align-items-center gap-3">
                      <img
                        src={profileForm.avatarUrl}
                        alt={profile?.username || 'avatar'}
                        title={profile?.username || ''}
                        className="rounded-circle border border-secondary"
                        width={80}
                        height={80}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80'; }}
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="">
                        <div className="fw-semibold text-dark">{profile?.username}</div>
                        <small className="text-muted">Click ảnh để xem đầy đủ tên (hover để hiển thị).</small>
                      </div>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="bg-white rounded-4 shadow p-4 h-100">
              <h5 className="fw-bold text-dark mb-3">Đổi mật khẩu</h5>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-dark" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang đổi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key me-2" />
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12">
            <div className="bg-white rounded-4 shadow p-4">
              <h5 className="fw-bold text-dark mb-3">Thông tin hệ thống</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <p className="text-muted mb-1">Vai trò</p>
                  <span className="badge bg-warning text-dark">{profile?.role}</span>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1">Ngày tham gia</p>
                  <p className="fw-semibold mb-0">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1">XP</p>
                  <p className="fw-semibold mb-0">{profile?.xp ?? 0}</p>
                </div>
                <div className="col-md-3">
                  <p className="text-muted mb-1">Gems</p>
                  <p className="fw-semibold mb-0">{profile?.gems ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

