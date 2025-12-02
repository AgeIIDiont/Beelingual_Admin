import React, { useEffect, useState } from 'react';

const ProfileCard = ({ title, number, subtitle, icon }) => {
  // 1. Kiểm tra xem input có phải là số không
  const isNumeric = !isNaN(parseFloat(number)) && isFinite(number);

  // State chỉ dùng cho việc đếm số (Animation)
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Nếu KHÔNG phải là số, return ngay.
    if (!isNumeric) return; 

    // Logic chạy hiệu ứng số
    let startTimestamp = null;
    const duration = 2000;
    const finalNumber = typeof number === 'string' ? parseInt(number, 10) : number;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeProgress * finalNumber));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [number, isNumeric]);

  const styles = {
    card: {
      background: 'linear-gradient(145deg, #ffffff, #fdfbf7)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 215, 0, 0.15)',
      boxShadow: '0 12px 25px -10px rgba(255, 215, 0, 0.15), 0 6px 10px -4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      overflow: 'hidden',
    },
    iconBg: {
      fontSize: '120px',
      color: '#FFD700',
      opacity: 0.1,
      position: 'absolute',
      right: '-20px',
      bottom: '-20px',
      zIndex: 0,
    },
    iconCircle: {
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      boxShadow: '0 6px 15px rgba(255, 215, 0, 0.35)',
    }
  };

  return (
    <>
      <style>
        {`
          .stat-card-hover:hover {
            transform: translateY(-12px) !important;
            box-shadow: 0 20px 40px -10px rgba(255, 215, 0, 0.3) !important;
          }
          .floating-icon { animation: float 6s ease-in-out infinite; }
          .slide-up-fade { animation: slideUp 0.8s ease-out forwards; }
          .progress-line-anim { width: 0%; animation: growWidth 1.5s ease-out 0.5s forwards; }
          
          @keyframes float {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            50% { transform: translate(-10px, -15px) rotate(5deg); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
          }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes growWidth { from { width: 0%; } to { width: 100%; } }
        `}
      </style>

      <div className="card h-100 border-0 stat-card-hover slide-up-fade position-relative" style={styles.card}>
        <div className="position-absolute top-0 start-0 h-1 progress-line-anim" style={{ height: '4px', background: 'linear-gradient(90deg, #FFD700, #ffecb3)' }}></div>
        <i className={`fas ${icon} floating-icon`} style={styles.iconBg}></i>

        <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div style={{ maxWidth: '80%' }}> {/* Giới hạn chiều rộng để không đè lên icon */}
              <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-1" style={{ letterSpacing: '1px' }}>
                {title}
              </h6>
              
              {/* --- CẬP NHẬT: TỰ ĐỘNG CHỈNH CỠ CHỮ --- */}
              <h2 
                className={`fw-bold text-dark mb-0 ${isNumeric ? 'fs-2' : 'fs-5'} text-break lh-sm`}
              >
                {/* Giải thích class:
                   - isNumeric ? 'fs-2' : 'fs-5': Nếu là số thì chữ to (fs-2), nếu là chữ thì nhỏ hơn (fs-5).
                   - text-break: Tự động xuống dòng nếu chữ quá dài không bị tràn.
                   - lh-sm: Giãn dòng nhỏ lại để khi xuống dòng trông gọn hơn.
                */}
                {isNumeric 
                  ? count.toLocaleString() 
                  : number
                }
              </h2>
              {/* -------------------------------------- */}
              
            </div>
            <div style={styles.iconCircle}>
              <i className={`fas ${icon} fs-5`}></i>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning px-2 py-1 me-2 border border-warning border-opacity-25">
               {subtitle}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;