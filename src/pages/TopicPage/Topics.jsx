import React, { useState, useEffect } from 'react';
import TopicCard from './components/TopicCard';
import * as TopicAPI from './service/topicApi';
import './style/TopicsPage.css'; // Import file CSS

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