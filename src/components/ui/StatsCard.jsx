import React from 'react';

const StatsCard = ({ title, number, subtitle, icon }) => {
  return (
    <div className="card border-0 shadow-lg h-100 position-relative overflow-hidden"
         style={{ borderLeft: '8px solid #FFD700', borderRadius: '24px' }}>
      {/* Viền vàng trên cùng */}
      <div className="position-absolute top-0 start-0 w-100 h-2" 
           style={{ background: 'linear-gradient(90deg, #FFD700, #FFED4E)' }}></div>

      {/* Icon nền mờ */}
      <i className={`fas ${icon} position-absolute end-0 bottom-0 opacity-10`}
         style={{ fontSize: '140px', color: '#FFD700', transform: 'translate(30px, 40px)' }}></i>

      <div className="card-body p-5 position-relative">
        <h5 className="card-title text-muted fw-medium">{title}</h5>
        <h2 className="display-5 fw-bold text-dark mb-3">{number.toLocaleString()}</h2>
        <p className="text-warning fw-bold fs-5">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatsCard;
