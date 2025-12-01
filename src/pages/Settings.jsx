import React, { useEffect, useState } from 'react';
import { changePassword, fetchProfile, updateProfile } from '../services/adminService';
import { setUser } from '../services/authService';
import { usePage } from '../contexts/PageContext';

const Settings = () => {
  const { setPageInfo } = usePage();
  const [profile, setProfile] = useState(null);
  
  // States quản lý Form
  const [profileForm, setProfileForm] = useState({ email: '', level: 'A', avatarUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // States quản lý UI
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCrPassword, setShowCrPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // --- STATE 1: CHẾ ĐỘ SỬA PROFILE ---
  const [isEditing, setIsEditing] = useState(false); 

  // --- STATE 2: CHẾ ĐỘ MỞ RỘNG MẬT KHẨU (MỚI) ---
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);

  // Helper: Show Toast
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 5000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageInfo({ title: 'Hồ sơ cá nhân', description: 'Quản lý thông tin và bảo mật' });
    loadProfile();
  }, [setPageInfo]);

  // Handle Edit Mode Toggle
  const toggleEditMode = () => {
    if (isEditing) {
      setProfileForm({
        email: profile.email || '',
        level: profile.level || 'A',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('success', 'Cập nhật thông tin thành công!');
      const updatedData = await fetchProfile();
      setProfile(updatedData);
      setUser(updatedData);
      setIsEditing(false); 
    } catch (err) {
      showToast('danger', err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return showToast('danger', 'Mật khẩu xác nhận không khớp.');
    
    setChangingPassword(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      showToast('success', 'Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordExpanded(false); // Đóng lại sau khi thành công
    } catch (err) {
      showToast('danger', err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-warning"></div></div>;

  return (
    <div className="container-fluid py-4">
      {/* CSS Animation cho hiệu ứng trượt */}
      <style>
        {`
          .password-collapse {
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out, margin-top 0.3s ease;
          }
          .password-collapse.open {
            max-height: 500px; /* Đủ lớn để chứa form */
            opacity: 1;
            margin-top: 1rem;
          }
            /* Style cho trạng thái CHỈNH SỬA (Màu xanh lá) */
          .btn-pale-success {
            background-color: rgba(25, 135, 84, 0.15); /* Màu xanh nhạt (độ trong suốt 15%) */
            color: #198754; /* Chữ màu xanh đậm */
            border: 1px solid transparent;
          }
          .btn-pale-success:hover {
            background-color: #12e78432; /* Hover: Nền xanh đậm */
            color: #23a521ff; /* Hover: Chữ trắng */
            box-shadow: 0 4px 12px rgba(25, 135, 84, 1); /* Đổ bóng xanh */
          }

          /* Style cho trạng thái HỦY BỎ (Màu xám) */
          .btn-pale-secondary {
            background-color: rgba(108, 117, 125, 0.15); /* Màu xám nhạt */
            color: #6c757d; /* Chữ xám đậm */
            border: 1px solid transparent;
          }
          .btn-pale-secondary:hover {
            background-color: #6475843e; /* Hover: Nền xám đậm */
            color: #f20000ff; /* Hover: Chữ trắng */
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        `}
      </style>

      {/* Toast */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className={`toast show align-items-center text-white bg-${toast.type} border-0 shadow-lg`}>
            <div className="d-flex"><div className="toast-body">{toast.message}</div></div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
        <div style={{ height: '180px', background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)' }}></div>
        <div className="card-body px-4 px-md-5 position-relative">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end" style={{ marginTop: '-80px' }}>
            <div className="position-relative mb-3 mb-md-0 me-md-4">
              <img
                src={profile?.avatarUrl || 'https://ui-avatars.com/api/?name=Admin'}
                alt="Avatar"
                className="rounded-circle border border-5 border-white shadow"
                width={140} height={140}
                style={{ objectFit: 'cover', backgroundColor: '#fff' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg'; }}
              />
              <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-3 border-white p-2"></div>
            </div>
            <div className="text-center text-md-start mb-3 flex-grow-1">
              <h2 className="fw-bold text-dark mb-1">{profile?.username || 'Admin User'}</h2>
              <p className="text-muted mb-0">
                <i className="fas fa-shield-alt text-primary me-2"></i>{profile?.role} 
                <span className="mx-2">•</span> 
                <i className="fas fa-calendar-alt text-secondary me-2"></i>Tham gia: {formatDate(profile?.createdAt)}
              </p>
            </div>
            <div className="mb-3">
               <button 
                 className={`btn ${isEditing ? 'btn-pale-secondary' : 'btn-pale-success'} rounded-pill px-4 fw-bold shadow-sm transition-all`}
                 onClick={toggleEditMode}
               >
                 {isEditing ? <><i className="fas fa-times me-2"></i> Hủy bỏ</> : <><i className="fas fa-pen me-2"></i> Chỉnh sửa</>}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-4">
        {/* ... (Các card thống kê giữ nguyên như cũ) ... */}
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <i className="fas fa-user-shield fa-2x text-primary mb-2"></i>
                <h6 className="text-muted text-uppercase fw-bold small mb-1">Loại tài khoản</h6>
                <h5 className="fw-bold text-dark mb-0">{profile?.role || 'Admin'}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                <h6 className="text-muted text-uppercase fw-bold small mb-1">Trạng thái</h6>
                <h5 className="fw-bold text-success mb-0">Hoạt động</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <i className="fas fa-calendar-day fa-2x text-info mb-2"></i>
                <h6 className="text-muted text-uppercase fw-bold small mb-1">Ngày tham gia</h6>
                <h5 className="fw-bold text-dark mb-0">{formatDate(profile?.createdAt)}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <i className="fas fa-star fa-2x text-warning mb-2"></i>
                <h6 className="text-muted text-uppercase fw-bold small mb-1">XP</h6>
                <h5 className="fw-bold text-warning mb-0">{profile?.xp || 0}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT CONTENT */}
      <div className="row g-4">
        
        {/* LEFT COLUMN: EDIT INFO */}
        <div className="col-lg-8">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <div className="d-flex align-items-center border-start border-4 border-success ps-3 justify-content-between">
                <h5 className="fw-bold text-dark mb-0">Thông tin liên hệ</h5>
                {isEditing && <span className="badge bg-success animate-pulse">Đang chỉnh sửa</span>}
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">Tên đăng nhập</label>
                    <input type="text" className="form-control bg-light" value={profile?.username} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Email</label>
                    <input type="email" className={`form-control ${isEditing ? 'bg-white' : 'bg-light'}`} value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} disabled={!isEditing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Cấp độ</label>
                    <select className={`form-select ${isEditing ? 'bg-white' : 'bg-light'}`} value={profileForm.level} onChange={(e) => setProfileForm({...profileForm, level: e.target.value})} disabled={!isEditing}>
                      <option value="A">Sơ cấp (A)</option>
                      <option value="B">Trung cấp (B)</option>
                      <option value="C">Cao cấp (C)</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">Avatar URL</label>
                    <input type="text" className={`form-control ${isEditing ? 'bg-white' : 'bg-light'}`} value={profileForm.avatarUrl} onChange={(e) => setProfileForm({...profileForm, avatarUrl: e.target.value})} disabled={!isEditing} />
                  </div>
                  {isEditing && (
                    <div className="col-12 pt-3 d-flex gap-2">
                      <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={savingProfile}>{savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                      <button type="button" className="btn btn-light px-4 fw-bold text-muted" onClick={toggleEditMode}>Hủy</button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY (Đã chỉnh sửa hiệu ứng Slide) */}
        <div className="col-lg-4">
          
          {/* Card Tài sản (Giữ nguyên) */}
          <div className="card border-0 shadow rounded-4 mb-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
               <div className="d-flex align-items-center border-start border-4 border-warning ps-3">
                <h5 className="fw-bold text-dark mb-0">Tài sản</h5>
              </div>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="d-flex justify-content-between align-items-center border-bottom py-3">
                <span className="text-muted">Đá quý (Gems)</span>
                <span className="fw-bold text-primary">{profile?.gems || 0} <i className="fas fa-gem ms-1"></i></span>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-3">
                <span className="text-muted">Cập nhật</span>
                <span className="fw-bold text-dark">{formatDate(new Date())}</span>
              </div>
            </div>
          </div>

          {/* Card Bảo mật (Có hiệu ứng Slide) */}
          <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <div className="d-flex align-items-center border-start border-4 border-danger ps-3">
                <h5 className="fw-bold text-dark mb-0">Bảo mật tài khoản</h5>
              </div>
            </div>
            <div className="card-body p-4">
              <p className="small text-muted mb-3">
                Giữ tài khoản an toàn bằng mật khẩu mạnh.
              </p>
              
              {/* Nút bấm ban đầu (Chỉ hiện khi chưa mở rộng) */}
              {!isPasswordExpanded && (
                <button 
                  className="btn btn-outline-danger w-100 fw-bold py-2 shadow-sm"
                  onClick={() => setIsPasswordExpanded(true)}
                >
                  <i className="fas fa-key me-2"></i> Đổi mật khẩu
                </button>
              )}

              <div className={`password-collapse ${isPasswordExpanded ? 'open' : ''}`}>
                <form onSubmit={handlePasswordSubmit}>
                  
                  {/* Mật khẩu hiện tại */}
                  <div className="mb-4">
                    <div className="input-group">
                      <input
                        type={showCrPassword ? "text" : "password"}
                        className="form-control border-end-0"
                        placeholder="Mật khẩu hiện tại"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        required
                      />
                      <span
                        className="input-group-text bg-white border-start-0 cursor-pointer"
                        onClick={() => setShowCrPassword(!showCrPassword)}
                      >
                        <i className={`fa ${showCrPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </span>
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="mb-4">
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-end-0"
                        placeholder="Mật khẩu mới"
                        value={passwordForm.newPassword}
                        minLength={6}
                        required
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                      />
                      <span
                        className="input-group-text bg-white border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </span>
                    </div>
                  </div>

                  {/* Nhập lại mật khẩu */}
                  <div className="mb-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      minLength={6}
                      required
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                    />
                  </div>

                  {/* Cảnh báo realtime */}
                  {passwordForm.confirmPassword.length > 0 &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <small className="text-danger d-block mb-3">
                        Mật khẩu nhập lại không khớp
                      </small>
                    )}

                  {/* Nút bấm */}
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="btn btn-danger flex-grow-1 fw-bold"
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Đang xử lý..." : "Xác nhận đổi"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-light fw-bold text-muted"
                      onClick={() => {
                        setIsPasswordExpanded(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>


            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
