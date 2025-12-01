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
        // Fix 1: Set chiều rộng cố định cho cột ảnh
        minWidth: '100px', 
        render: (item) => (
          item.imageUrl ? (
            <div className="ratio ratio-4x3" style={{ width: '80px', borderRadius: '8px', overflow: 'hidden' }}>
               {/* Fix 2: Hiển thị ảnh thay vì text URL */}
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="object-fit-cover w-100 h-100"
                onError={(e) => { e.target.src = 'https://placehold.co/80x60?text=No+Img'; }} // Fallback nếu ảnh lỗi
              />
            </div>
          ) : (
            <span className="text-muted small fst-italic">Không có ảnh</span>
          )
        ),
      },
      {
        key: 'name',
        label: 'Chủ đề',
        minWidth: '200px',
        render: (item) => (
          <div>
            <div className="fw-bold text-dark fs-6">{item.name}</div>
          </div>
        ),
      },
      {
        key: 'level',
        label: 'Trình độ',
        minWidth: '100px',
        render: (item) => {
          // Fix 3: Thêm Badge màu sắc cho Level nhìn chuyên nghiệp hơn
          let colorClass = 'bg-secondary';
          if (item.level === 'A') colorClass = 'bg-success';
          if (item.level === 'B') colorClass = 'bg-warning text-dark';
          if (item.level === 'C') colorClass = 'bg-danger';
          
          return (
            <span className={`badge ${colorClass} rounded-pill px-3 py-2`}>
              {item.level ? `Level ${item.level}` : 'Chưa set'}
            </span>
          );
        },
      },
      {
        key: 'description',
        label: 'Mô tả',
        // Quan trọng: Đặt minWidth để cột đủ rộng, chữ không bị ép quá hẹp
        minWidth: '300px', 
        render: (item) => (
          <div 
            className="text-muted"
            // whiteSpace: 'pre-wrap': Giữ nguyên xuống dòng nếu trong data có enter
            // wordBreak: 'break-word': Đảm bảo từ quá dài sẽ tự xuống dòng, không tràn ra ngoài
            style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              lineHeight: '1.5' 
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
        label: 'Tìm kiếm',
        type: 'text',
        placeholder: 'Nhập tiêu đề...',
        col: 6,
      },
      {
        name: 'level',
        label: 'Trình độ',
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
        options: levelOptions.slice(1), // Bỏ option 'Tất cả'
        defaultValue: 'A',
        col: 4,
      },
      {
        name: 'imageUrl',
        label: 'Link Hình ảnh (URL)',
        type: 'text', // Đổi thành text input thường để paste link
        placeholder: 'https://...',
        col: 12,
        helper: 'Dán đường dẫn ảnh trực tiếp từ internet.'
      },
      {
        name: 'description',
        label: 'Mô tả chi tiết',
        type: 'textarea',
        rows: 4,
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
      description="Chuẩn hóa và quản lý toàn bộ chủ đề bài học."
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
