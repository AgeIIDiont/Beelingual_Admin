import React from 'react';

const FormInput = ({ label, value, onChange, type = 'text', placeholder, rows }) => (
  <div className="lp-form-group">
    <label className="lp-label">{label}</label>
    {type === 'textarea' ? (
      <textarea
        className="lp-textarea"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 3}
      />
    ) : (
      <input
        type={type}
        className="lp-input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

const HeroSection = ({ content, onContentChange, onSave, saving }) => {
  const updateField = (key, value) => {
    onContentChange('hero', key, value);
  };

  return (
    <div className="fade-in">
      <FormInput
        label="Tiêu đề chính"
        value={content.hero?.heroTitle}
        onChange={(val) => updateField('heroTitle', val)}
        placeholder="Tiêu đề hiển thị lớn nhất..."
      />
      
      <FormInput
        label="Phụ đề"
        type="textarea"
        value={content.hero?.heroSubtitle}
        onChange={(val) => updateField('heroSubtitle', val)}
        placeholder="Mô tả ngắn gọn..."
        rows={3}
      />
      
      <FormInput
        label="URL Hình ảnh"
        value={content.hero?.heroImageUrl}
        onChange={(val) => updateField('heroImageUrl', val)}
        placeholder="https://example.com/hero-image.png"
      />
      
      <FormInput
        label="Text nút CTA"
        value={content.hero?.heroCtaText}
        onChange={(val) => updateField('heroCtaText', val)}
        placeholder="Tải ứng dụng ngay"
      />
      
      <button
        className="lp-btn-save"
        onClick={() => onSave('hero')}
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
            Lưu Hero Section
          </>
        )}
      </button>
    </div>
  );
};

export default HeroSection;
