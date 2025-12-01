import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menu = [
  { icon: 'fa-home', label: 'Tổng quan', path: '/dashboard' },
  { icon: 'fa-book', label: 'Quản lý Từ vựng', path: '/vocabulary' },
  { icon: 'fa-spell-check', label: 'Quản lý Ngữ pháp', path: '/grammar' },
  { icon: 'fa-tags', label: 'Chủ đề học', path: '/topics' },
  { icon: 'fa-file-alt', label: 'Bài tập & Đề thi', path: '/exercises' },
  { icon: 'fa-users', label: 'Người dùng', path: '/users' },
  { icon: 'fa-chart-bar', label: 'Thống kê', path: '/stats' },
  // { icon: 'fa-cog', label: 'Cài đặt', path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Kiểm tra route hiện tại để xác định menu active
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className={`d-flex flex-column bg-dark text-white position-fixed h-100 transition-all w-18`}
         style={{ width: '280px', transition: 'width 0.3s' }}>
      
      <div className="p-4 text-center bg-warning">
        <h3 className="mb-0 fw-bold text-dark">BEELINGUAL</h3>
      </div>

      <nav className="flex-grow-1 px-3 pt-4">
        {menu.map((item, i) => {
          const active = isActive(item.path);
          const itemClass = `d-flex align-items-center px-4 py-3 rounded-3 mb-2 position-relative cursor-pointer ${active ? 'bg-light text-dark border-start border-warning border-5' : 'text-white hover-bg-secondary'}`;
          return (
            <div
              key={i}
              className={itemClass}
              style={{ transition: '0.3s', cursor: 'pointer' }}
              onClick={() => handleNavigation(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation(item.path);
                }
              }}
            >
              <i className={`fas ${item.icon} fs-4 me-4`}></i>
              <span className="fw-medium">{item.label}</span>
            </div>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;

