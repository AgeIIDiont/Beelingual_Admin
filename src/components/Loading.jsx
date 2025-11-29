// components/Loading.jsx
import React from 'react';

const Loading = ({ message = "Đang tải..." }) => (
  <div className="text-center py-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Đang tải...</span>
    </div>
    <p className="mt-3 fw-semibold" style={{ color: '#2D3142' }}>{message}</p>
  </div>
);

export default Loading;
