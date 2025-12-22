import React from 'react';

const PreviewPanel = ({ iframeRef, isMobilePreview, setIsMobilePreview, previewUrl }) => {
  return (
    <div className="lp-card sticky-top" style={{
      top: '24px',
      height: 'calc(100vh - 50px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10
    }}>
      {/* Header */}
      <div className="lp-preview-header">
        <h5 className="mb-0 fw-bold">
          <i className="fas fa-eye me-2 text-warning"></i>
          Live Preview
        </h5>
        
        <div className="d-flex align-items-center gap-3">
          {/* Device Toggle */}
          <div className="lp-preview-toggle">
            <button
              className={`lp-preview-toggle-btn ${!isMobilePreview ? 'active' : ''}`}
              onClick={() => setIsMobilePreview(false)}
            >
              <i className="fas fa-desktop"></i>
              Desktop
            </button>
            <button
              className={`lp-preview-toggle-btn ${isMobilePreview ? 'active' : ''}`}
              onClick={() => setIsMobilePreview(true)}
            >
              <i className="fas fa-mobile-alt"></i>
              Mobile
            </button>
          </div>

          {/* Live Badge */}
          <span className="lp-live-badge">Live</span>
        </div>
      </div>

      {/* Preview Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: isMobilePreview ? '#f0f2f5' : 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: isMobilePreview ? '24px 0' : '0'
      }}>
        {/* Mobile Frame */}
        {isMobilePreview && (
          <div style={{
            position: 'relative',
            background: '#1a1a1a',
            borderRadius: '36px',
            padding: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            {/* Notch */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '24px',
              background: '#1a1a1a',
              borderRadius: '0 0 16px 16px',
              zIndex: 10
            }}></div>
            
            <iframe
              src={previewUrl}
              ref={iframeRef}
              style={{
                width: '375px',
                height: '700px',
                border: 'none',
                borderRadius: '24px',
                background: '#fff'
              }}
              title="Beelingual Landing Page Preview"
            />
          </div>
        )}

        {/* Desktop Preview */}
        {!isMobilePreview && (
          <iframe
            src={previewUrl}
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Beelingual Landing Page Preview"
          />
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
