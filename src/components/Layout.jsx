// components/Layout.jsx
import React from 'react';
import theme from '../styles/theme.js';

const Layout = ({ children }) => {
  return (
    <div className="min-vh-100" style={{ background: '#FFF8E7' }}>
      <style>{theme}</style>
      <div className="container-fluid py-4 px-4 px-lg-5">
        {children}
      </div>
    </div>
  );
};

export default Layout;
