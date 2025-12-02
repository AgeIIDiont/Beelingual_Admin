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

  // Lấy title hiện tại
  const currentTitle = pageTitle || routeTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfile();

    const handler = (e) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('auth:userUpdated', handler);

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
    <>
      <style>
        {`
          /* --- HEADER CONTAINER --- */
          .header-container {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03); 
            width: calc(100% - 280px); /* Mặc định trừ đi Sidebar */
            transition: left 0.3s, width 0.3s;
          }

          /* --- RESPONSIVE: Mobile & Tablet (< 992px) --- */
          @media (max-width: 991.98px) {
            .header-container {
              left: 0 !important;
              width: 100% !important;
            }
          }

          /* --- PROFILE PILL STYLES --- */
          .profile-pill {
            padding: 6px 8px 6px 16px;
            border-radius: 50px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
            background: transparent;
          }
          .profile-pill:hover, .profile-pill.active {
            background: rgba(0,0,0,0.04);
            border-color: rgba(0,0,0,0.05);
          }
          
          /* --- AVATAR RING --- */
          .avatar-ring {
            padding: 2px;
            border: 2px solid #FFD700;
            border-radius: 50%;
            display: inline-block;
            background: #fff;
          }

          /* --- DROPDOWN ANIMATION --- */
          .custom-dropdown {
            animation: slideDownFade 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
            border: none;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
          }

          .dropdown-item-custom {
            border-radius: 8px;
            transition: all 0.2s;
            color: #555;
            font-weight: 500;
          }
          .dropdown-item-custom:hover {
            background-color: #FFF9C4;
            color: #d4a017;
          }
          .dropdown-item-logout:hover {
            background-color: #fee2e2;
            color: #dc3545;
          }

          @keyframes slideDownFade {
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>

      <header
        className="header-container position-fixed top-0 end-0"
        style={{
          left: '280px', // Giá trị mặc định cho Desktop
          height: '80px',
          zIndex: 1000,
        }}
      >
        <div className="d-flex justify-content-between align-items-center h-100 px-4 px-lg-5">
          
          {/* Left side: Page Title */}
          <div className="flex-grow-1 d-flex flex-column justify-content-center">
            <h1 className="h4 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>
              {currentTitle}
            </h1>
            {pageDescription && (
              <div className="d-flex align-items-center mt-1">
                 <span 
                    className="d-inline-block rounded-circle bg-warning me-2" 
                    style={{ width: '6px', height: '6px' }}>
                 </span>
                 <p className="text-muted mb-0 small" style={{ fontSize: '13px' }}>
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

            {/* Profile Section */}
            <div className="position-relative" ref={dropdownRef}>
              <div
                className={`d-flex align-items-center gap-3 profile-pill ${showDropdown ? 'active' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {/* Text Info */}
                <div className="text-end d-none d-md-block" style={{ lineHeight: '1.2' }}>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                    {profile?.fullname || 'Admin User'}
                  </div>
                  <div className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    {profile?.role || 'Administrator'}
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
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://ui-avatars.com/api/?name=User';
                    }}
                  />
                </div>
                
                {/* Chevron */}
                <i className={`fas fa-chevron-down small text-muted transition-icon ${showDropdown ? 'fa-rotate-180' : ''}`} style={{ transition: 'transform 0.2s' }}></i>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  className="position-absolute end-0 mt-3 bg-white rounded-4 custom-dropdown overflow-hidden"
                  style={{ minWidth: '240px' }}
                >
                  <div className="p-3 bg-light border-bottom">
                    <p className="fw-bold mb-0 text-dark">{profile?.fullname}</p>
                    <p className="text-muted small mb-0 text-truncate">{profile?.email || 'admin@beelingual.com'}</p>
                  </div>

                  <div className="p-2">
                    <button
                      className="btn w-100 text-start px-3 py-2 border-0 bg-transparent dropdown-item-custom mb-1"
                      onClick={handleViewProfile}
                    >
                      <i className="fas fa-user-circle me-3 text-warning"></i>
                      Hồ sơ cá nhân
                    </button>
                    
                    <button
                      className="btn w-100 text-start px-3 py-2 border-0 bg-transparent dropdown-item-custom mb-1"
                      onClick={() => navigate('/settings')}
                    >
                      <i className="fas fa-cog me-3 text-secondary"></i>
                      Cài đặt hệ thống
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
    </>
  );
};

export default Header;