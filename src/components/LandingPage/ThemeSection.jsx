import React from 'react';

const ColorPicker = ({ label, value, onChange, defaultValue }) => (
  <div className="lp-form-group">
    <label className="lp-label">{label}</label>
    <div className="lp-color-picker-group">
      <input
        type="color"
        className="lp-color-swatch"
        value={value || defaultValue}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="lp-input lp-color-hex"
        value={value || defaultValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={defaultValue}
      />
    </div>
  </div>
);

const ThemeSection = ({ theme, setTheme, onSave, saving }) => {
  const updateColor = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fade-in">
      <div className="row g-3">
        {/* Primary Colors */}
        <div className="col-12">
          <h6 className="fw-bold text-secondary mb-3">
            <i className="fas fa-paint-brush me-2"></i>
            Màu sắc chính
          </h6>
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu chi tiết & Nút bấm (Primary)"
            value={theme.primaryColor}
            onChange={(val) => updateColor('primaryColor', val)}
            defaultValue="#ffc107"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu nhấn & Trang trí (Accent)"
            value={theme.accentColor}
            onChange={(val) => updateColor('accentColor', val)}
            defaultValue="#ffdb4d"
          />
        </div>

        {/* Background Colors */}
        <div className="col-12 mt-3">
          <h6 className="fw-bold text-secondary mb-3">
            <i className="fas fa-fill-drip me-2"></i>
            Màu nền
          </h6>
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu nền trang (Background)"
            value={theme.backgroundColor}
            onChange={(val) => updateColor('backgroundColor', val)}
            defaultValue="#0f1117"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu nền Features"
            value={theme.secondaryColor}
            onChange={(val) => updateColor('secondaryColor', val)}
            defaultValue="#1a1d29"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu chân trang (Footer)"
            value={theme.footerColor}
            onChange={(val) => updateColor('footerColor', val)}
            defaultValue="#0f1117"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Nền các khối nội dung (Card)"
            value={theme.cardColor}
            onChange={(val) => updateColor('cardColor', val)}
            defaultValue="#1a1d29"
          />
        </div>

        {/* Text Colors */}
        <div className="col-12 mt-3">
          <h6 className="fw-bold text-secondary mb-3">
            <i className="fas fa-font me-2"></i>
            Màu chữ
          </h6>
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Màu chữ chính (Text)"
            value={theme.textColor}
            onChange={(val) => updateColor('textColor', val)}
            defaultValue="#ffffff"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Tiêu đề Hero (Nổi bật)"
            value={theme.heroHeadlineColor}
            onChange={(val) => updateColor('heroHeadlineColor', val)}
            defaultValue="#ffc107"
          />
        </div>

        {/* UI Elements */}
        <div className="col-12 mt-3">
          <h6 className="fw-bold text-secondary mb-3">
            <i className="fas fa-layer-group me-2"></i>
            Thành phần UI
          </h6>
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Nền ô nhập liệu (Input)"
            value={theme.inputBackgroundColor}
            onChange={(val) => updateColor('inputBackgroundColor', val)}
            defaultValue="#ffffff"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Nền khung chat (Chat)"
            value={theme.chatWindowColor}
            onChange={(val) => updateColor('chatWindowColor', val)}
            defaultValue="#ffffff"
          />
        </div>

        {/* Status Colors */}
        <div className="col-12 mt-3">
          <h6 className="fw-bold text-secondary mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            Màu trạng thái
          </h6>
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Thông báo thành công (Success)"
            value={theme.successColor}
            onChange={(val) => updateColor('successColor', val)}
            defaultValue="#28a745"
          />
        </div>

        <div className="col-md-6">
          <ColorPicker
            label="Thông báo lỗi (Error)"
            value={theme.errorColor}
            onChange={(val) => updateColor('errorColor', val)}
            defaultValue="#dc3545"
          />
        </div>
      </div>

      <button
        className="lp-btn-save mt-4"
        onClick={onSave}
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
            Lưu Theme
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeSection;
