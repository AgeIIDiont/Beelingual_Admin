import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/userSlice';
import { logout } from '../../services/authService';
import { usePage } from '../../contexts/PageContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoHome from '../../assets/LogoHome.png';
import './styles/header.scss';

const routeTitles = {
  '/dashboard': 'Tổng quan',
  '/vocabulary': 'Quản lý Từ vựng',
  '/grammar': 'Quản lý Ngữ pháp',
  '/topics': 'Chủ đề học',
  '/exercises': 'Bài tập & Đề thi',
  '/users': 'Người dùng',
  '/stats': 'Thống kê',
  '/settings': 'Cài đặt',
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageTitle, pageDescription, actionButtons } = usePage();
  const profile = useSelector(selectUser);
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const currentTitle = pageTitle || routeTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    navigate('/settings');
  };

  return (
    <header className="header-container">
      <div className="d-flex justify-content-between align-items-center h-100 px-4 px-lg-5">

        {/* Logo */}
        <div className="header-logo me-4">
          <img
            src={LogoHome}
            alt="Beelingual"
            style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          />
        </div>

        {/* Page Title */}
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            {currentTitle}
          </h1>
          {pageDescription && (
            <div className="d-flex align-items-center mt-1">
              <span className="d-inline-block rounded-circle bg-warning me-2" style={{ width: '6px', height: '6px' }}>
              </span>
              <p className="text-muted mb-0 small">
                {pageDescription}
              </p>
            </div>
          )}
        </div>

        {/* Right side: Action Buttons & Profile */}
        <div className="d-flex align-items-center gap-4">

          {/* Action Buttons */}
          {actionButtons && (
            <div className="d-flex gap-2 animate-fade-in">
              {actionButtons}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Chuyển sang Dark Mode' : 'Chuyển sang Light Mode'}
          >
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>

          {/* Profile Section */}
          <div className="position-relative" ref={dropdownRef}>
            <div
              className={`d-flex align-items-center gap-3 profile-pill ${showDropdown ? 'active' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {/* Text Info */}
              <div className="text-end d-none d-md-block">
                <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile?.fullname}
                </div>
                <div className="text-uppercase" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {profile?.role}
                </div>
              </div>

              {/* Avatar with Ring */}
              <div className="avatar-ring">
                <img
                  src={profile?.avatarUrl || 'https://ui-avatars.com/api/?name=Admin&background=FFD700&color=fff'}
                  alt="User"
                  className="rounded-circle"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=User';
                  }}
                />
              </div>

              {/* Chevron */}
              <i className={`fas fa-chevron-down small text-muted transition-icon ${showDropdown ? 'fa-rotate-180' : ''}`}></i>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="position-absolute end-0 mt-3 rounded-4 custom-dropdown overflow-hidden" style={{ minWidth: '240px' }}>
                <div className="p-3 border-bottom" style={{ background: 'var(--bg-hover)' }}>
                  <p className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{profile?.fullname}</p>
                  <p className="small mb-0 text-truncate" style={{ color: 'var(--text-muted)' }}>{profile?.email || 'admin@beelingual.com'}</p>
                </div>

                <div className="p-2">
                  <button
                    className="btn w-100 text-start px-3 py-2 border-0 bg-transparent dropdown-item-custom mb-1"
                    onClick={handleViewProfile}
                  >
                    <i className="fas fa-user-circle me-3 text-warning"></i>
                    Hồ sơ cá nhân
                  </button>

                  <div className="dropdown-divider my-2"></div>

                  <button
                    className="btn w-100 text-start px-3 py-2 border-0 bg-transparent dropdown-item-custom dropdown-item-logout"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-3"></i>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;