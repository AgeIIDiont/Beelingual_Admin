import React from 'react';

const SkeletonLoading = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Editor Column Skeleton */}
        <div className="col-lg-6">
          <div className="lp-card">
            <div className="lp-card-header">
              <div className="lp-skeleton lp-skeleton-text" style={{ width: '180px' }}></div>
            </div>
            <div className="lp-card-body">
              {/* Tabs Skeleton */}
              <div className="lp-skeleton" style={{ height: '56px', marginBottom: '1.5rem' }}></div>
              
              {/* Form Fields Skeleton */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="lp-form-group">
                  <div className="lp-skeleton lp-skeleton-text short"></div>
                  <div className="lp-skeleton lp-skeleton-input"></div>
                </div>
              ))}
              
              {/* Button Skeleton */}
              <div className="lp-skeleton lp-skeleton-button"></div>
            </div>
          </div>
        </div>

        {/* Preview Column Skeleton */}
        <div className="col-lg-6">
          <div className="lp-card">
            <div className="lp-card-header d-flex justify-content-between align-items-center">
              <div className="lp-skeleton lp-skeleton-text" style={{ width: '120px' }}></div>
              <div className="lp-skeleton" style={{ width: '180px', height: '36px' }}></div>
            </div>
            <div className="lp-card-body p-0">
              <div className="lp-skeleton" style={{ height: 'calc(100vh - 200px)', borderRadius: '0 0 16px 16px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
