// components/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, number, subtitle, icon, iconBg }) => (
  <div className="stats-card bg-white rounded-4 shadow-sm border-0 p-4 h-100 position-relative overflow-hidden">
    <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '120px', right: '-20px', top: '-40px' }}>
      <i className={`fas ${icon}`}></i>
    </div>
    
    <div className="position-relative">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="text-secondary fw-semibold mb-2 text-uppercase small">{title}</h6>
          <h2 className="display-4 fw-bold mb-0" style={{ color: '#2D3142' }}>{number.toLocaleString()}</h2>
        </div>
        <div className={`${iconBg} rounded-3 p-3 shadow-sm d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
          <i className={`fas ${icon} fa-2x text-white`}></i>
        </div>
      </div>
      <p className="mb-0 fw-semibold small" style={{ color: '#FDB913' }}>{subtitle}</p>
    </div>
  </div>
);

export default StatsCard;
