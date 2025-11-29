// components/Header.jsx
import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <div className="header-card rounded-4 shadow-sm p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="brand-logo">BEELINGUAL</div>
          <div className="vr d-none d-md-block" style={{ height: '40px' }}></div>
          <h1 className="welcome-text mb-0">
            {title} <span className="welcome-accent">{subtitle}</span>
          </h1>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <div className="text-muted small">Xin chào,</div>
            <div className="fw-semibold" style={{ color: '#2D3142' }}>Admin</div>
          </div>
          <img 
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="admin" 
            className="admin-avatar rounded-circle" 
            width="56" 
            height="56" 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
