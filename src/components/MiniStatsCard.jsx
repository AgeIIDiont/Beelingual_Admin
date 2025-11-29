// components/MiniStatsCard.jsx
import React from 'react';

const MiniStatsCard = ({ label, value }) => (
  <div className="stats-mini-card rounded-4 shadow-sm p-3 text-center">
    <div className="small text-muted mb-1">{label}</div>
    <div className="fw-bold fs-3" style={{ color: '#2D3142' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

export default MiniStatsCard;
