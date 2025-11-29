// components/TopicCard.jsx
import React from 'react';

const TopicCard = ({ topic, onEdit, onDelete, onView }) => {
  const levelColors = {
    'A': 'level-A',
    'B': 'level-B',
    'C': 'level-C'
  };

  return (
    <div className="topic-card bg-white rounded-4 shadow-sm border-0 p-0 h-100 overflow-hidden">
      {/* Image Section */}
      <div className="position-relative" style={{ height: '180px' }}>
        <img 
          src={topic.imageUrl} 
          alt={topic.name}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
        <div className="image-overlay"></div>
        
        {/* Level Badge on Image */}
        <div className="position-absolute top-0 start-0 m-3">
          <span className={`level-badge ${levelColors[topic.level] || 'level-A'}`}>
            Level {topic.level}
          </span>
        </div>
        
        {/* Actions Dropdown on Image */}
        <div className="position-absolute top-0 end-0 m-3">
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-light rounded-circle border-0 shadow-sm" 
              type="button" 
              data-bs-toggle="dropdown" 
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              <i className="fas fa-ellipsis-v" style={{ color: '#2D3142' }}></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0">
              <li>
                <button className="dropdown-item" onClick={() => onView(topic)}>
                  <i className="fas fa-eye me-2 text-honey"></i>Xem chi tiết
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => onEdit(topic)}>
                  <i className="fas fa-edit me-2 text-honey"></i>Chỉnh sửa
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(topic)}>
                  <i className="fas fa-trash me-2"></i>Xóa
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h5 className="fw-bold mb-2" style={{ color: '#2D3142' }}>{topic.name}</h5>
        <p className="text-muted small mb-3" style={{ lineHeight: '1.6', minHeight: '40px' }}>
          {topic.description}
        </p>
        
        {/* Order Badge */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="badge rounded-pill px-3 py-2" style={{ background: '#FFF8E7', color: '#2D3142' }}>
            <i className="fas fa-sort-numeric-down me-1 text-honey"></i>
            Thứ tự: {topic.order}
          </span>
          <button 
            className="btn btn-honey-outline btn-sm rounded-3 px-3" 
            onClick={() => onView(topic)}
          >
            <i className="fas fa-arrow-right me-1"></i>Xem
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
