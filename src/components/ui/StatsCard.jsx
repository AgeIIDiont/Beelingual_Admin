import React, { useEffect, useState } from 'react';
import './styles/stats-card.scss';

const StatsCard = ({ title, number, subtitle, icon }) => {
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

  return (
    <div className="stats-card card border-0 stat-card-hover slide-up-fade position-relative">
      <div className="stats-card__progress-line position-absolute top-0 start-0 progress-line-anim"></div>
      <i className={`fas ${icon} floating-icon stats-card__icon-bg`}></i>

      <div className="stats-card__body card-body">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h6 className="text-muted text-uppercase fw-bold small ls-1 mb-1 stats-card__title">
              {title}
            </h6>
            <h2 className="display-5 fw-bold text-dark mb-0">
              {count.toLocaleString()}
            </h2>
          </div>

          <div className="stats-card__icon-circle">
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

export default StatsCard;