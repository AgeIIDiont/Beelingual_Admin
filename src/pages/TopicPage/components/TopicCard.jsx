import React from 'react';

const TopicCard = ({ topic, onEdit, onDelete, onView }) => {
  // Map level to Vietnamese
  const getLevelText = (level) => {
    const levels = {
      'A': 'Cơ bản',
      'B': 'Trung cấp',
      'C': 'Nâng cao'
    };
    return levels[level] || level;
  };

  // Generate color class based on level
  const getColorClass = (level) => {
    const colors = {
      'A': 'bg-warning-honey',
      'B': 'bg-orange-honey',
      'C': 'bg-brown-honey'
    };
    return colors[level] || 'bg-dark-honey';
  };

  // Generate icon based on topic name
  const getIcon = (name) => {
    const lowerName = name ? name.toLowerCase() : '';
    if (lowerName.includes('greeting') || lowerName.includes('chào')) return 'fa-comments';
    if (lowerName.includes('business') || lowerName.includes('kinh doanh')) return 'fa-briefcase';
    if (lowerName.includes('travel') || lowerName.includes('du lịch')) return 'fa-plane';
    if (lowerName.includes('food') || lowerName.includes('ẩm thực')) return 'fa-utensils';
    if (lowerName.includes('tech') || lowerName.includes('công nghệ')) return 'fa-laptop-code';
    if (lowerName.includes('health') || lowerName.includes('sức khỏe')) return 'fa-heartbeat';
    return 'fa-book';
  };

  return (
    <div className="topic-card bg-white rounded-4 shadow-sm border-0 p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className={`topic-icon ${getColorClass(topic.level)} rounded-3 p-3 shadow-sm d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
          <i className={`fas ${getIcon(topic.name)} fa-2x text-white`}></i>
        </div>
        <div className="dropdown">
          <button className="btn btn-sm btn-light rounded-circle border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ width: '32px', height: '32px', padding: 0 }}>
            <i className="fas fa-ellipsis-v" style={{ color: '#2D3142' }}></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0">
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
      
      <h5 className="fw-bold mb-2" style={{ color: '#2D3142' }}>{topic.name}</h5>
      <p className="text-muted small mb-3" style={{ lineHeight: '1.6' }}>{topic.description}</p>
      
      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="text-center p-2 rounded-3" style={{ background: '#FFF8E7' }}>
            <div className="small text-muted mb-1">Cấp độ</div>
            <div className="fw-bold" style={{ color: '#2D3142', fontSize: '1.1rem' }}>{getLevelText(topic.level)}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="text-center p-2 rounded-3" style={{ background: '#FFF8E7' }}>
            <div className="small text-muted mb-1">Thứ tự</div>
            <div className="fw-bold" style={{ color: '#2D3142', fontSize: '1.1rem' }}>{topic.order}</div>
          </div>
        </div>
      </div>
      
      <div className="d-flex align-items-center justify-content-between">
        <span className="badge rounded-pill px-3 py-2 badge-active">
          <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem' }}></i>
          Đang hoạt động
        </span>
        <button className="btn btn-honey-outline btn-sm rounded-3 px-3" onClick={() => onView(topic)}>
          <i className="fas fa-eye me-1"></i>Chi tiết
        </button>
      </div>
    </div>
  );
};

export default TopicCard;