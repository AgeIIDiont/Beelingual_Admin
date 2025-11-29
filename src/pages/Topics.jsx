import React, { useState, useEffect } from 'react';
import TopicAPI from '../pages/Topics'; // Import API service

// Topic Card Component
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
    const lowerName = name.toLowerCase();
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
          <button className="btn btn-sm btn-light rounded-circle border-0" type="button" data-bs-toggle="dropdown" style={{ width: '32px', height: '32px', padding: 0 }}>
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

// Topics Page Component
const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0
  });
  const [error, setError] = useState(null);

  // Fetch topics from API
  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterLevel !== 'all') params.level = filterLevel;

      const data = await TopicAPI.getAllTopics(params);
      
      setTopics(data.data || []);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      });
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTopics();
  }, []);

  // Reload when search or filter changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchTopics();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterLevel]);

  // Reload when page changes
  useEffect(() => {
    if (pagination.page > 1 || pagination.page === 1) {
      fetchTopics();
    }
  }, [pagination.page]);

  const handleEdit = (topic) => {
    console.log('Edit topic:', topic);
    alert(`Chỉnh sửa: ${topic.name}`);
    // TODO: Implement edit modal/form
  };

  const handleDelete = async (topic) => {
    if (window.confirm(`Bạn có chắc muốn xóa chủ đề "${topic.name}"?`)) {
      try {
        await TopicAPI.deleteTopic(topic._id);
        alert('Xóa chủ đề thành công!');
        fetchTopics(); // Reload topics
      } catch (err) {
        console.error('Error deleting topic:', err);
        alert('Không thể xóa chủ đề. Vui lòng thử lại.');
      }
    }
  };

  const handleView = (topic) => {
    console.log('View topic:', topic);
    alert(`Xem chi tiết: ${topic.name}`);
    // TODO: Navigate to topic detail page
  };

  const handleAddTopic = () => {
    alert('Mở form thêm chủ đề mới');
    // TODO: Implement add topic modal/form
  };

  return (
    <div className="min-vh-100" style={{ background: '#FFF8E7' }}>
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .bg-warning-honey {
          background-color: #FDB913;
        }
        
        .bg-orange-honey {
          background-color: #FF9F1C;
        }
        
        .bg-brown-honey {
          background-color: #8B5A00;
        }
        
        .bg-dark-honey {
          background-color: #2D3142;
        }
        
        .text-honey {
          color: #FDB913;
        }
        
        .topic-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(253, 185, 19, 0.1);
        }
        
        .topic-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(253, 185, 19, 0.2);
          border-color: rgba(253, 185, 19, 0.3);
        }
        
        .topic-icon {
          transition: all 0.3s ease;
        }
        
        .topic-card:hover .topic-icon {
          transform: scale(1.1) rotate(5deg);
        }
        
        .badge-active {
          background: #4caf50;
          color: white;
        }
        
        .stats-mini-card {
          background: white;
          border: 1px solid rgba(253, 185, 19, 0.1);
          transition: all 0.3s ease;
        }
        
        .stats-mini-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(253, 185, 19, 0.15);
        }
        
        .search-input {
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
          background: white;
        }
        
        .search-input:focus {
          border-color: #FDB913;
          box-shadow: 0 0 0 0.2rem rgba(253, 185, 19, 0.25);
          outline: none;
        }
        
        .filter-select {
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
          background: white;
        }
        
        .filter-select:focus {
          border-color: #FDB913;
          box-shadow: 0 0 0 0.2rem rgba(253, 185, 19, 0.25);
          outline: none;
        }
        
        .btn-honey-primary {
          background: linear-gradient(135deg, #FDB913 0%, #FF9F1C 100%);
          color: white;
          border: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-honey-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 185, 19, 0.4);
        }
        
        .btn-honey-outline {
          background: white;
          color: #2D3142;
          border: 2px solid #FDB913;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-honey-outline:hover {
          background: #FDB913;
          color: white;
          border-color: #FDB913;
        }
        
        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #2D3142;
        }
        
        .dropdown-menu {
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-item {
          padding: 0.6rem 1.2rem;
          transition: all 0.2s ease;
        }
        
        .dropdown-item:hover {
          background: #FFF8E7;
          color: #2D3142;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #ef9a9a;
        }
      `}</style>

      <div className="container-fluid py-4 px-4 px-lg-5">
        {/* Header */}
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="page-title mb-2">
                <i className="fas fa-tags text-honey me-3"></i>
                Quản lý Chủ đề học
              </h1>
              <p className="text-muted mb-0">Quản lý các chủ đề và bài học của Beelingual</p>
            </div>
            <button className="btn btn-honey-primary rounded-3 px-4 py-2" onClick={handleAddTopic}>
              <i className="fas fa-plus-circle me-2"></i>
              Thêm chủ đề mới
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="row g-4 mb-4">
          <div className="col-6 col-md-3">
            <div className="stats-mini-card rounded-4 shadow-sm p-3 text-center">
              <div className="small text-muted mb-1">Tổng chủ đề</div>
              <div className="fw-bold fs-3" style={{ color: '#2D3142' }}>{pagination.total}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stats-mini-card rounded-4 shadow-sm p-3 text-center">
              <div className="small text-muted mb-1">Trang hiện tại</div>
              <div className="fw-bold fs-3" style={{ color: '#2D3142' }}>{pagination.page}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stats-mini-card rounded-4 shadow-sm p-3 text-center">
              <div className="small text-muted mb-1">Tổng trang</div>
              <div className="fw-bold fs-3" style={{ color: '#2D3142' }}>{pagination.totalPages}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stats-mini-card rounded-4 shadow-sm p-3 text-center">
              <div className="small text-muted mb-1">Đang hiển thị</div>
              <div className="fw-bold fs-3" style={{ color: '#2D3142' }}>{topics.length}</div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="position-relative">
                <i className="fas fa-search position-absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }}></i>
                <input
                  type="text"
                  className="form-control search-input rounded-3 ps-5 py-2"
                  placeholder="Tìm kiếm chủ đề theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select filter-select rounded-3 py-2"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="A">Cơ bản (A)</option>
                <option value="B">Trung cấp (B)</option>
                <option value="C">Nâng cao (C)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* Topics Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#FDB913', width: '3rem', height: '3rem', borderWidth: '0.3rem' }} role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 fw-semibold" style={{ color: '#2D3142' }}>Đang tải danh sách chủ đề...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-4 shadow-sm p-5 text-center">
            <i className="fas fa-folder-open fa-3x mb-3" style={{ color: '#e0e0e0' }}></i>
            <h5 className="fw-bold mb-2" style={{ color: '#2D3142' }}>Không tìm thấy chủ đề nào</h5>
            <p className="text-muted">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="row g-4">
            {topics.map((topic) => (
              <div key={topic._id} className="col-12 col-md-6 col-xl-4">
                <TopicCard
                  topic={topic}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;