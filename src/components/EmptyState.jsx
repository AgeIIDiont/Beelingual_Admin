// components/EmptyState.jsx
import React from 'react';

const EmptyState = ({ icon = "fa-folder-open", title, message }) => (
  <div className="bg-white rounded-4 shadow-sm p-5 text-center">
    <i className={`fas ${icon} fa-3x mb-3`} style={{ color: '#e0e0e0' }}></i>
    <h5 className="fw-bold mb-2" style={{ color: '#2D3142' }}>{title}</h5>
    <p className="text-muted">{message}</p>
  </div>
);

export default EmptyState;