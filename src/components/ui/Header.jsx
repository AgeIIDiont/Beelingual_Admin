import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import { fetchProfile } from '../../services/adminService';
import { usePage } from '../../contexts/PageContext';

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
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get page title from context or route
  const currentTitle = pageTitle || routeTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    // Load profile
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfile();

    // Listen for profile updates
    const handler = (e) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('auth:userUpdated', handler);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('auth:userUpdated', handler);
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
    <header
      className="bg-white shadow-sm position-fixed top-0 end-0"
      style={{
        left: '280px',
        height: '90px',
        zIndex: 1000,
        transition: 'left 0.3s'
      }}
    >
      <div className="d-flex justify-content-between align-items-center h-100 px-4 px-lg-5">
        {/* Left side: Page Title */}
        <div className="flex-grow-1">
          <h1 className="h4 fw-bold text-dark mb-0" style={{ lineHeight: '1.2' }}>
            {currentTitle}
          </h1>
          {pageDescription && (
            <p className="text-muted mb-0 small" style={{ fontSize: '13px', marginTop: '2px' }}>
              {pageDescription}
            </p>
          )}
        </div>

        {/* Right side: Action Buttons & Profile */}
        <div className="d-flex align-items-center gap-3">
          {/* Action Buttons from pages */}
          {actionButtons && (
            <div className="d-flex gap-2">
              {actionButtons}
            </div>
          )}
          <div className="position-relative" ref={dropdownRef}>
          <button
            className="btn d-flex align-items-center gap-3 p-0 border-0 bg-transparent"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            <div className="text-end d-none d-md-block">
              <div className="fw-semibold text-dark small">
                {profile?.username || 'Admin'}
              </div>
              <div className="text-muted" style={{ fontSize: '12px' }}>
                {profile?.role || 'admin'}
              </div>
            </div>
            <img
              src={profile?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt={profile?.username || 'admin'}
              className="rounded-circle border border-warning border-2"
              width={45}
              height={45}
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://randomuser.me/api/portraits/men/32.jpg';
              }}
            />
            <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'} text-muted small`}></i>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
              style={{
                minWidth: '200px',
                top: '100%',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease-in'
              }}
            >
              <div className="p-2">
                <div className="px-3 py-2 border-bottom">
                  <div className="fw-semibold text-dark small">
                    {profile?.username || 'Admin'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    {profile?.email || ''}
                  </div>
                </div>
                <button
                  className="btn w-100 text-start px-3 py-2 border-0 bg-transparent"
                  onClick={handleViewProfile}
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-user-cog me-2 text-muted"></i>
                  Xem hồ sơ
                </button>
                <button
                  className="btn w-100 text-start px-3 py-2 border-0 bg-transparent text-danger"
                  onClick={handleLogout}
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .btn:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </header>
  );
};

export default Header;

