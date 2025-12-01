import React, { useEffect, useState } from 'react';

const StatsCard = ({ title, number, subtitle, icon }) => {
  // 1. Logic xử lý hiệu ứng số nhảy (Count Up) - GIỮ NGUYÊN
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [number]);

  // 2. CSS Styles - CẬP NHẬT SHADOW
  const styles = {
    card: {
      background: 'linear-gradient(145deg, #ffffff, #fdfbf7)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 215, 0, 0.15)',
      // --- THAY ĐỔI Ở ĐÂY: Shadow tùy chỉnh, mềm và sâu hơn ---
      // Kết hợp 2 lớp shadow: 1 lớp màu vàng rất nhạt lan rộng, 1 lớp màu xám tạo khối
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
      // --- THAY ĐỔI NHẸ: Tăng một chút độ đậm cho bóng của icon ---
      boxShadow: '0 6px 15px rgba(255, 215, 0, 0.35)',
    }
  };

  return (
    <>
      <style>
        {`
          /* Khi hover, bóng đổ chuyển sang màu vàng rực và đẩy card lên cao hơn chút */
          .stat-card-hover:hover {
            transform: translateY(-12px) !important; /* Đẩy lên cao hơn xíu (cũ là -10px) */
            box-shadow: 0 20px 40px -10px rgba(255, 215, 0, 0.3) !important; /* Bóng vàng đậm và rộng hơn */
          }
          
          .floating-icon {
            animation: float 6s ease-in-out infinite;
          }
          .slide-up-fade {
            animation: slideUp 0.8s ease-out forwards;
          }
          .progress-line-anim {
            width: 0%;
            animation: growWidth 1.5s ease-out 0.5s forwards;
          }
          
          @keyframes float {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            50% { transform: translate(-10px, -15px) rotate(5deg); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes growWidth {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}
      </style>

      <div 
        // Đã loại bỏ class 'shadow-sm' của Bootstrap để dùng style tùy chỉnh
        className="card h-100 border-0 stat-card-hover slide-up-fade position-relative"
        style={styles.card}
      >
        {/* Thanh trang trí trên cùng */}
        <div 
          className="position-absolute top-0 start-0 h-1 progress-line-anim" 
          style={{ 
            height: '4px', 
            background: 'linear-gradient(90deg, #FFD700, #ffecb3)' 
          }}
        ></div>

        {/* Icon nền to phía sau */}
        <i 
          className={`fas ${icon} floating-icon`}
          style={styles.iconBg}
        ></i>

        <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-1" style={{ letterSpacing: '1px' }}>
                {title}
              </h6>
              {/* Số hiển thị với hiệu ứng chạy */}
              <h2 className="display-5 fw-bold text-dark mb-0">
                {count.toLocaleString()}
              </h2>
            </div>
            
            {/* Icon tròn nhỏ */}
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

export default StatsCard;