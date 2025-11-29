// components/PageHeader.jsx
import React from 'react';

const PageHeader = ({ icon, title, subtitle, action, actionText, onAction }) => {
  return (
    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title mb-2">
            <i className={`fas ${icon} text-honey me-3`}></i>
            {title}
          </h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {action && (
          <button className="btn btn-honey-primary rounded-3 px-4 py-2" onClick={onAction}>
            <i className={`fas ${action} me-2`}></i>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
