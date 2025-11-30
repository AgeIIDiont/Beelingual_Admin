import React from 'react';

const StatsCard = ({ title, number, subtitle, icon, iconBg }) => (
  <div className="stats-card h-100 p-4">
    {/* Icon trang trí mờ làm nền */}
    <i className={`fas ${icon} stats-decor-icon`}></i>

    <div className="d-flex justify-content-between align-items-start position-relative">
      {/* Phần Text bên trái */}
      <div className="d-flex flex-column justify-content-between" style={{ minHeight: '100px' }}>
        <div>
          <p className="stats-label mb-1">{title}</p>
          <h2 className="stats-number mb-0">{number.toLocaleString()}</h2>
        </div>
        
        <div className="mt-3">
          <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-normal">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Phần Icon Box bên phải */}
      <div className={`stats-icon-box ${iconBg}`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
  </div>
);

export default StatsCard;