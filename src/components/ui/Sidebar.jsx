import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/sidebar.scss';

const menu = [
  { icon: 'fa-home', label: 'Tổng quan', path: '/dashboard' },
  { icon: 'fa-book', label: 'Quản lý Từ vựng', path: '/vocabulary' },
  { icon: 'fa-spell-check', label: 'Quản lý Ngữ pháp', path: '/grammar' },
  { icon: 'fa-tags', label: 'Chủ đề học', path: '/topics' },
  { icon: 'fa-file-alt', label: 'Câu hỏi & Bài tập', path: '/exercises' },
  { icon: 'fa-users', label: 'Người dùng', path: '/users' },
  { icon: 'fa-chart-bar', label: 'Hoạt động Admin', path: '/admin-activity' },
  { icon: 'fa-globe', label: 'Trang giới thiệu', path: '/landing-page' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className="sidebar-container d-flex flex-column bg-dark text-white">

      <nav className="sidebar-menu">
        {menu.map((item, i) => {
          const active = isActive(item.path);
          return (
            <div
              key={i}
              className={`sidebar-menu-item ${active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation(item.path);
                }
              }}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
