import React, { useMemo, useEffect, useRef, useState } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createGrammar,
  deleteGrammar,
  fetchGrammar,
  updateGrammar,
} from '../services/adminService';
import { usePage } from '../contexts/PageContext';
import { fetchCategories } from '../services/adminService';

const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A', label: 'Level A' },
  { value: 'B', label: 'Level B' },
  { value: 'C', label: 'Level C' },
];

const Grammar = () => {
  const { setPageInfo } = usePage();
  const resourceManagerRef = useRef(null);

  const [categoriOptions, setCategoriOptions] = useState([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        const categoriesData = Array.isArray(response) ? response : (response.data || []);
        const options = categoriesData.map(categorie => ({
          value: categorie.name,
          label: `${categorie.name}`,
        }));
        setCategoriOptions(options);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    loadCategories();
  }, []);
  

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
      title: 'Quản lý Ngữ pháp',
      description: 'Chuẩn hóa và quản lý toàn bộ bài học ngữ pháp sử dụng trong ứng dụng.',
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
            Thêm bài ngữ pháp
          </button>
        </>
      ),
    });
    return () => setPageInfo({ title: '', description: '', actions: null });
  }, [setPageInfo]);

  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Chủ điểm',
        render: (item) => (
          <div>
            <div className="fw-bold text-dark">{item.title}</div>
            <small className="text-muted">{item.structure || '—'}</small>
          </div>
        ),
      },
      {
        key: 'categoryId',
        label: 'Danh mục',
        render: (item) => {
          // Kiểm tra nếu categoryId là object (đã populate)
          if (item.categoryId && typeof item.categoryId === 'object') {
            return (
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                {item.categoryId.icon} {item.categoryId.name}
              </span>
            );
          }
          return '—';
        },
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
        key: 'example',
        label: 'Ví dụ',
        render: (item) => item.example || '—',
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        render: (item) => new Date(item.createdAt).toLocaleDateString('vi-VN'),
      },
    ],
    []
  );

  const filters = useMemo(
    () => [
      {
        name: 'title',
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
        name: 'title',
        label: 'Tiêu đề',
        type: 'text',
        required: true,
        col: 6,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A',
        col: 3,
      },
      {
        name: 'structure',
        label: 'Cấu trúc',
        type: 'text',
        placeholder: 'vd: S + V + O',
        col: 12,
      },
      {
        name: 'categoryId', // Sửa name cho đúng với API
        label: 'Loại ngữ pháp',
        type: 'select',
        options: categoriOptions, // List options đã lấy từ API
        required: true,
        col: 12, // Hoặc 3 tùy layout
      },
      {
        name: 'content',
        label: 'Nội dung chi tiết',
        type: 'textarea',
        rows: 4,
        col: 12,
      },
      {
        name: 'example',
        label: 'Ví dụ minh họa',
        type: 'textarea',
        rows: 2,
        col: 12,
      },
    ],
    [categoriOptions,]
  );

  const buildPayload = (values) => {
    const payload = {
      title: values.title?.trim(),
      level: values.level || 'A',
      categoryId: values.categoryId, // Gửi _id của category
      structure: values.structure?.trim(),
      content: values.content?.trim(),
      example: values.example?.trim(),
    };

    Object.keys(payload).forEach((key) => {
      if (!payload[key]) delete payload[key];
    });

    return payload;
  };

  const mapItemToForm = (item) => {
    return {
      ...item,
      // Khi load về categoryId là object { _id, name... }, nhưng select cần _id string
      categoryId: item.categoryId?._id || item.categoryId || '', 
    };
  };

  return (
    <ResourceManager
      ref={resourceManagerRef}
      resourceName="bài ngữ pháp"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={fetchGrammar}
      createApi={createGrammar}
      updateApi={updateGrammar}
      deleteApi={deleteGrammar}
      buildPayload={buildPayload}
      mapItemToForm={mapItemToForm}
      hideHeader={true}
    />
  );
};

export default Grammar;

