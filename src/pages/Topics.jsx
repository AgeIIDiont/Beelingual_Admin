import React, { useMemo, useEffect, useRef } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  fetchTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A1', label: 'Level A1' },
  { value: 'A2', label: 'Level A2' },
  { value: 'B1', label: 'Level B1' },
  { value: 'B2', label: 'Level B2' },
  { value: 'C1', label: 'Level C1' },
  { value: 'C2', label: 'Level C2' },
];

const Topics = () => {
  const { setPageInfo } = usePage();
  const resourceManagerRef = useRef(null);

  useEffect(() => {
    const handleRefresh = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.refresh();
      }
    };

    const handleCreate = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.openCreateForm();
      }
    };

    setPageInfo({
      title: 'Chủ đề học',
      description: 'Quản lý toàn bộ chủ đề bài học sử dụng trong ứng dụng.',
      actions: (
        <>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleRefresh}
          >
            <i className="fas fa-rotate me-2"></i>
            Làm mới
          </button>
          <button className="btn btn-warning text-dark fw-bold" onClick={handleCreate}>
            <i className="fas fa-plus me-2" />
            Thêm chủ đề
          </button>
        </>
      ),
    });
    return () => setPageInfo({ title: '', description: '', actions: null });
  }, [setPageInfo]);
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
          if (['A1', 'A2', 'A'].includes(item.level)) colorClass = 'bg-success';
          if (['B1', 'B2', 'B'].includes(item.level)) colorClass = 'bg-warning text-dark';
          if (['C1', 'C2', 'C'].includes(item.level)) colorClass = 'bg-danger';

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
        minWidth: '350px',
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
        col: 6,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A1',
        col: 3,
      },
      {
        name: 'order',
        label: 'Thứ tự hiển thị',
        type: 'number',
        placeholder: 'auto',
        col: 3,
        min: 1,
        helper: 'Để trống = tự động thêm vào cuối.'
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
    // Đảm bảo order >= 1
    let orderValue = values.order ? Number(values.order) : undefined;
    if (orderValue !== undefined && orderValue < 1) {
      orderValue = 1;
    }
    
    const payload = {
      name: values.name?.trim(),
      level: values.level || 'A1',
      description: values.description?.trim(),
      imageUrl: values.imageUrl?.trim(),
      order: orderValue,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === '') delete payload[key];
    });

    return payload;
  };

  return (
    <ResourceManager
      title="Quản lý Chủ đề"
      description="Chuẩn hóa và quản lý các nhóm chủ đề bài học trong hệ thống."
      ref={resourceManagerRef}
      resourceName="chủ đề"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={async (params) => {
        // Fetch ALL topics first (ignore page/limit, use high limit)
        const res = await fetchTopics({ limit: 10000 });
        let items = Array.isArray(res) ? res : (res.data || res.items || []);

        // Sắp xếp theo thứ tự order (tăng dần)
        items = items.sort((a, b) => (a.order || 999) - (b.order || 999));

        try {
          if (params) {
            if (params.search) {
              const q = String(params.search).toLowerCase();
              items = items.filter((it) => (it.name || '').toLowerCase().includes(q));
            }
            if (params.level) {
              if (params.level !== '') items = items.filter((it) => it.level === params.level);
            }
          }
        } catch (e) {
          console.warn('Client-side filter fallback failed for Topics', e);
        }

        return { data: items, total: items.length };
      }}
      createApi={async (payload) => {
        const res = await fetchTopics({ limit: 10000 });
        const allTopics = Array.isArray(res) ? res : (res.data || res.items || []);
        
        if (payload.order) {
          // Nếu có order, tự động đẩy các topic có order >= newOrder lên 1
          const newOrder = Number(payload.order);
          
          // Tìm các topic cần shift (order >= newOrder)
          const topicsToShift = allTopics.filter(t => (t.order || 999) >= newOrder);
          
          // Update từng topic bị ảnh hưởng
          for (const topic of topicsToShift) {
            await updateTopic(topic._id, { order: (topic.order || 999) + 1 });
          }
        } else {
          // Nếu không nhập order, tự động gán order = max + 1
          const maxOrder = allTopics.reduce((max, t) => Math.max(max, t.order || 0), 0);
          payload.order = maxOrder + 1;
        }
        
        return createTopic(payload);
      }}
      updateApi={async (id, payload) => {
        // Nếu order thay đổi, xử lý shift
        if (payload.order !== undefined) {
          const newOrder = Number(payload.order);
          const res = await fetchTopics({ limit: 10000 });
          const allTopics = Array.isArray(res) ? res : (res.data || res.items || []);
          
          // Tìm topic hiện tại để lấy order cũ
          const currentTopic = allTopics.find(t => t._id === id);
          const oldOrder = currentTopic?.order || 999;
          
          if (oldOrder !== newOrder) {
            if (newOrder < oldOrder) {
              // Di chuyển lên: đẩy các topic từ newOrder đến oldOrder-1 xuống 1
              const topicsToShift = allTopics.filter(t => 
                t._id !== id && 
                (t.order || 999) >= newOrder && 
                (t.order || 999) < oldOrder
              );
              for (const topic of topicsToShift) {
                await updateTopic(topic._id, { order: (topic.order || 999) + 1 });
              }
            } else {
              // Di chuyển xuống: đẩy các topic từ oldOrder+1 đến newOrder lên 1
              const topicsToShift = allTopics.filter(t => 
                t._id !== id && 
                (t.order || 999) > oldOrder && 
                (t.order || 999) <= newOrder
              );
              for (const topic of topicsToShift) {
                await updateTopic(topic._id, { order: (topic.order || 999) - 1 });
              }
            }
          }
        }
        
        return updateTopic(id, payload);
      }}
      deleteApi={async (id, item) => {
        const deletedOrder = item?.order;
        
        // Xóa topic trước
        const result = await deleteTopic(id);
        
        // Sau đó giảm order của các topic có order > deletedOrder
        if (deletedOrder) {
          const res = await fetchTopics({ limit: 10000 });
          const allTopics = Array.isArray(res) ? res : (res.data || res.items || []);
          
          const topicsToShift = allTopics.filter(t => (t.order || 999) > deletedOrder);
          
          for (const topic of topicsToShift) {
            await updateTopic(topic._id, { order: (topic.order || 999) - 1 });
          }
        }
        
        return result;
      }}
      buildPayload={buildPayload}
      hideHeader={true}
    />
  );
};

export default Topics;
