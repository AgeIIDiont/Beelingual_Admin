import React from 'react';

const FeaturesSection = ({ content, onFeatureChange, onSave, saving }) => {
  const features = content.features?.features || [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-secondary mb-0">
          <i className="fas fa-list-ul me-2"></i>
          Danh sách tính năng ({features.length})
        </h6>
      </div>

      {features.map((feature, index) => (
        <div key={index} className="lp-section-card">
          <div className="lp-section-card-title">
            <span className="badge bg-warning text-dark rounded-pill">#{index + 1}</span>
            <span>{feature.title || 'Tính năng chưa đặt tên'}</span>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <div className="lp-form-group mb-0">
                <label className="lp-label">Icon (emoji)</label>
                <input
                  type="text"
                  className="lp-input text-center"
                  value={feature.icon || ''}
                  onChange={(e) => onFeatureChange(index, 'icon', e.target.value)}
                  placeholder="📱"
                  style={{ fontSize: '1.5rem' }}
                />
              </div>
            </div>

            <div className="col-md-9">
              <div className="lp-form-group mb-0">
                <label className="lp-label">Tiêu đề</label>
                <input
                  type="text"
                  className="lp-input"
                  value={feature.title || ''}
                  onChange={(e) => onFeatureChange(index, 'title', e.target.value)}
                  placeholder="Tên tính năng..."
                />
              </div>
            </div>

            <div className="col-12">
              <div className="lp-form-group mb-0">
                <label className="lp-label">Mô tả</label>
                <textarea
                  className="lp-textarea"
                  value={feature.description || ''}
                  onChange={(e) => onFeatureChange(index, 'description', e.target.value)}
                  placeholder="Mô tả chi tiết tính năng..."
                  rows={2}
                />
              </div>
            </div>

            <div className="col-12">
              <div className="lp-form-group mb-0">
                <label className="lp-label">URL Hình ảnh</label>
                <input
                  type="text"
                  className="lp-input"
                  value={feature.imageUrl || ''}
                  onChange={(e) => onFeatureChange(index, 'imageUrl', e.target.value)}
                  placeholder="https://example.com/feature-image.png"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="lp-btn-save"
        onClick={() => onSave('features')}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="spinner-border spinner-border-sm"></span>
            Đang lưu...
          </>
        ) : (
          <>
            <i className="fas fa-save"></i>
            Lưu Features
          </>
        )}
      </button>
    </div>
  );
};

export default FeaturesSection;
