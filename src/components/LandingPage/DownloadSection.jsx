import React from 'react';

const DownloadSection = ({ content, onContentChange, onSave, saving }) => {
  const updateField = (key, value) => {
    onContentChange('download', key, value);
  };

  return (
    <div className="fade-in">
      <div className="lp-form-group">
        <label className="lp-label">Tiêu đề</label>
        <input
          type="text"
          className="lp-input"
          value={content.download?.downloadTitle || ''}
          onChange={(e) => updateField('downloadTitle', e.target.value)}
          placeholder="Tải ứng dụng ngay"
        />
      </div>

      <div className="lp-form-group">
        <label className="lp-label">Mô tả</label>
        <textarea
          className="lp-textarea"
          value={content.download?.downloadDescription || ''}
          onChange={(e) => updateField('downloadDescription', e.target.value)}
          placeholder="Mô tả về việc tải app..."
          rows={2}
        />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-apple me-1"></i> Link iOS
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.download?.iosLink || ''}
              onChange={(e) => updateField('iosLink', e.target.value)}
              placeholder="https://apps.apple.com/..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-google-play me-1"></i> Link Android
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.download?.androidLink || ''}
              onChange={(e) => updateField('androidLink', e.target.value)}
              placeholder="https://play.google.com/..."
            />
          </div>
        </div>

        <div className="col-12">
          <div className="lp-form-group">
            <label className="lp-label">
              <i className="fab fa-android me-1"></i> Link APK trực tiếp
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.download?.apkLink || ''}
              onChange={(e) => updateField('apkLink', e.target.value)}
              placeholder="https://example.com/app.apk"
            />
          </div>
        </div>
      </div>

      <button
        className="lp-btn-save"
        onClick={() => onSave('download')}
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
            Lưu Download Section
          </>
        )}
      </button>
    </div>
  );
};

export default DownloadSection;
