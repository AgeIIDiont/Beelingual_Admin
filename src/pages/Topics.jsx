import React, { useMemo } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  fetchTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../services/adminService';

const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A', label: 'Level A' },
  { value: 'B', label: 'Level B' },
  { value: 'C', label: 'Level C' },
];

const Topics = () => {
  const columns = useMemo(
    () => [
      {
        key: 'imageUrl',
        label: 'Hình ảnh',
        minWidth: '100px',
        render: (item) => (
          item.imageUrl ? (
            <div className="ratio ratio-4x3 shadow-sm" style={{ width: '80px', borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="object-fit-cover w-100 h-100"
                onError={(e) => { e.target.src = 'https://placehold.co/80x60?text=No+Img'; }}
              />
            </div>
          ) : (
            // Đồng bộ style "No Img" với trang Vocabulary
            <div className="bg-light d-flex align-items-center justify-content-center text-muted small border" style={{ width: '80px', height: '60px', borderRadius: '8px' }}>
              No Img
            </div>
          )
        ),
      },
      {
        key: 'name',
        label: 'Tên chủ đề',
        minWidth: '200px',
        render: (item) => (
          <div>
            <div className="fw-bold text-dark fs-6 mb-1">{item.name}</div>
            {/* Hiển thị ID nhỏ giúp Admin dễ debug nếu cần */}
            <small className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>ID: {item._id?.slice(-6).toUpperCase()}</small>
          </div>
        ),
      },
      {
        key: 'level',
        label: 'Level',
        minWidth: '100px',
        render: (item) => {
          let colorClass = 'bg-secondary';
          if (item.level === 'A') colorClass = 'bg-success';
          if (item.level === 'B') colorClass = 'bg-warning text-dark';
          if (item.level === 'C') colorClass = 'bg-danger';
          
          return (
            <span className={`badge ${colorClass} rounded-pill px-3 py-2`}>
              {item.level || '—'}
            </span>
          );
        },
      },
      {
        key: 'description',
        label: 'Mô tả chi tiết',
        minWidth: '350px', // Tăng độ rộng để text dài không bị ép quá
        render: (item) => (
          <div 
            className="text-secondary"
            style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }} 
          >
            {item.description || '—'}
          </div>
        ),
      },
    ],
    []
  );

  const filters = useMemo(
    () => [
      {
        name: 'search',
        label: 'Tìm kiếm chủ đề...',
        type: 'text',
        placeholder: 'Nhập tên chủ đề...',
        col: 6,
      },
      {
        name: 'level',
        label: 'Lọc theo trình độ',
        type: 'select',
        options: levelOptions,
        col: 3,
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: 'name',
        label: 'Tên Chủ đề',
        type: 'text',
        required: true,
        placeholder: 'Ví dụ: Daily Routine, Travel...',
        col: 8,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A',
        col: 4,
      },
      {
        name: 'imageUrl',
        label: 'Link Hình ảnh (URL)',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        col: 12,
        helper: 'Dán đường dẫn ảnh trực tiếp từ internet.'
      },
      {
        name: 'description',
        label: 'Mô tả chi tiết',
        type: 'textarea',
        rows: 5,
        col: 12,
        placeholder: 'Mô tả nội dung bài học...'
      },
    ],
    []
  );

  const buildPayload = (values) => {
    const payload = {
      name: values.name?.trim(),
      level: values.level || 'A',
      description: values.description?.trim(),
      imageUrl: values.imageUrl?.trim(),
    };

    Object.keys(payload).forEach((key) => {
      if (!payload[key]) delete payload[key];
    });

    return payload;
  };

  return (
    <ResourceManager
      title="Quản lý Chủ đề"
      description="Chuẩn hóa và quản lý các nhóm chủ đề bài học trong hệ thống."
      resourceName="chủ đề"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={fetchTopics}
      createApi={createTopic}
      updateApi={updateTopic}
      deleteApi={deleteTopic}
      buildPayload={buildPayload}
    />
  );
};

export default Topics;
