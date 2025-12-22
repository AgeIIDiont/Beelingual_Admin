import React from 'react';

const FooterSection = ({ content, setContent, onContentChange, onSave, saving }) => {
  const updateSocialLink = (platform, value) => {
    setContent(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: {
          ...prev.footer?.socialLinks,
          [platform]: value
        }
      }
    }));
  };

  return (
    <div className="fade-in">
      <div className="lp-form-group">
        <label className="lp-label">Mô tả Footer</label>
        <textarea
          className="lp-textarea"
          value={content.footer?.footerDescription || ''}
          onChange={(e) => onContentChange('footer', 'footerDescription', e.target.value)}
          placeholder="Thông tin về công ty..."
          rows={3}
        />
      </div>

      <h6 className="fw-bold text-secondary mb-3 mt-4">
        <i className="fas fa-share-alt me-2"></i>
        Social Links
      </h6>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-facebook text-primary me-1"></i> Facebook
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.footer?.socialLinks?.facebook || ''}
              onChange={(e) => updateSocialLink('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-instagram text-danger me-1"></i> Instagram
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.footer?.socialLinks?.instagram || ''}
              onChange={(e) => updateSocialLink('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-twitter text-info me-1"></i> Twitter
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.footer?.socialLinks?.twitter || ''}
              onChange={(e) => updateSocialLink('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fab fa-youtube text-danger me-1"></i> Youtube
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.footer?.socialLinks?.youtube || ''}
              onChange={(e) => updateSocialLink('youtube', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      <h6 className="fw-bold text-secondary mb-3 mt-4">
        <i className="fas fa-address-book me-2"></i>
        Thông tin liên hệ
      </h6>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fas fa-envelope me-1"></i> Email
            </label>
            <input
              type="email"
              className="lp-input"
              value={content.footer?.contactEmail || ''}
              onChange={(e) => onContentChange('footer', 'contactEmail', e.target.value)}
              placeholder="contact@beelingual.com"
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">
              <i className="fas fa-phone me-1"></i> Số điện thoại
            </label>
            <input
              type="text"
              className="lp-input"
              value={content.footer?.contactPhone || ''}
              onChange={(e) => onContentChange('footer', 'contactPhone', e.target.value)}
              placeholder="+84 123 456 789"
            />
          </div>
        </div>
      </div>

      <button
        className="lp-btn-save mt-4"
        onClick={() => onSave('footer')}
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
            Lưu Footer
          </>
        )}
      </button>
    </div>
  );
};

export default FooterSection;
