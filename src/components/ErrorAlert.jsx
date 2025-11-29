// components/ErrorAlert.jsx
import React from 'react';

const ErrorAlert = ({ message }) => (
  <div className="alert alert-honey shadow-sm d-flex align-items-center" role="alert">
    <i className="fas fa-exclamation-triangle me-3 fs-4 text-honey"></i>
    <div>
      <strong>Lỗi:</strong> {message}
    </div>
  </div>
);

export default ErrorAlert;
