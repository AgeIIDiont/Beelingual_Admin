import React, { useEffect, useState } from 'react';
import './styles/profile-card.scss';

const ProfileCard = ({ title, number, subtitle, icon }) => {
  const isNumeric = !isNaN(parseFloat(number)) && isFinite(number);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;

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

  return (
    <div className="profile-card card border-0 stat-card-hover slide-up-fade position-relative">
      <div className="profile-card__progress-line position-absolute top-0 start-0 progress-line-anim"></div>
      <i className={`fas ${icon} floating-icon profile-card__icon-bg`}></i>

      <div className="profile-card__body card-body">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="profile-card__content-wrapper">
            <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-1 profile-card__title">
              {title}
            </h6>

            <h2 className={`fw-bold text-dark mb-0 ${isNumeric ? 'fs-2' : 'fs-5'} text-break lh-sm`}>
              {isNumeric ? count.toLocaleString() : number}
            </h2>
          </div>

          <div className="profile-card__icon-circle">
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
  );
};

export default ProfileCard;