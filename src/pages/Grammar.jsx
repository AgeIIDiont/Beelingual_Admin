import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { value: 'A1', label: 'Level A1' },
  { value: 'A2', label: 'Level A2' },
  { value: 'B1', label: 'Level B1' },
  { value: 'B2', label: 'Level B2' },
  { value: 'C1', label: 'Level C1' },
  { value: 'C2', label: 'Level C2' },
];

const Grammar = () => {
  const { setPageInfo } = usePage();
  const navigate = useNavigate();
  const resourceManagerRef = useRef(null);

  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        const categoriesData = Array.isArray(response) ? response : (response.data || []);
        const options = categoriesData.map((categorie) => ({
          value: categorie._id || categorie.id || categorie.name,
          label: `${categorie.icon ? categorie.icon + ' ' : ''}${categorie.name}`,
        }));
        // add a default "Tất cả" option for filters
        setCategoryOptions([{ value: '', label: 'Tất cả' }, ...options]);
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

  // Manual delete handler since we are customizing the actions column
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài ngữ pháp này?')) return;
    try {
      await deleteGrammar(id);
      // Refresh list
      if (resourceManagerRef.current) {
        resourceManagerRef.current.refresh();
      }
    } catch (error) {
      alert('Không thể xóa: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Chủ điểm ngữ pháp',
        render: (item) => (
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="fw-bold text-dark mb-0">{item.title}</h6>
              {/* Level Badge */}
              <span className={`badge rounded-pill ${['A1', 'A2', 'A'].includes(item.level) ? 'bg-success' :
                ['B1', 'B2', 'B'].includes(item.level) ? 'bg-warning text-dark' :
                  ['C1', 'C2', 'C'].includes(item.level) ? 'bg-danger' : 'bg-secondary'
                }`}>
                {item.level || '—'}
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2 fs-7">
              {/* Category Badge */}
              {item.categoryId && typeof item.categoryId === 'object' && (
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                  {item.categoryId.icon} {item.categoryId.name}
                </span>
              )}

              {/* Structure */}
              <span className="text-muted fst-italic border-start ps-2">
                {item.structure || 'Không có cấu trúc'}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'example',
        label: 'Ví dụ',
        render: (item) => (
          <div className="text-muted small text-truncate" style={{ maxWidth: '250px' }} title={item.example}>
            {item.example || '—'}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Hành động',
        minWidth: '150px',
        className: 'text-end',
        render: (item) => (
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/exercises?skill=grammar&grammarId=${item._id}`);
              }}
              title="Quản lý bài tập"
            >
              <i className="fas fa-list-check me-1"></i>
              Bài tập
            </button>
            <button
              className="btn btn-sm btn-light text-primary"
              onClick={() => resourceManagerRef.current?.openEditForm(item)}
              title="Chỉnh sửa"
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              className="btn btn-sm btn-light text-danger"
              onClick={() => handleDelete(item._id)}
              title="Xóa"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ),
      },
    ],
    [navigate]
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
      {
        name: 'categoryId',
        label: 'Loại ngữ pháp',
        type: 'select',
        options: categoryOptions,
        col: 3,
      },
    ],
    [categoryOptions]
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
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A1',
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
        options: categoryOptions, // List options đã lấy từ API
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
    [categoryOptions]
  );

  const buildPayload = (values) => {
    const payload = {
      title: values.title?.trim(),
      title: values.title?.trim(),
      level: values.level || 'A1',
      categoryId: values.categoryId, // Gửi _id của category
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
      listApi={async (params) => {
        // Call backend
        const res = await fetchGrammar(params);
        // Normalize items array
        let items = res.data || res.items || [];

        // If backend did not apply filters, do a lightweight client-side filter as fallback
        try {
          if (params) {
            if (params.categoryId) {
              items = items.filter((it) => {
                const cid = it.categoryId?._id || it.categoryId || '';
                return String(cid) === String(params.categoryId);
              });
            }
            if (params.title) {
              const q = String(params.title).toLowerCase();
              items = items.filter((it) => (it.title || '').toLowerCase().includes(q));
            }
            if (params.level) {
              if (params.level !== '') items = items.filter((it) => it.level === params.level);
            }
          }
        } catch (e) {
          // ignore client-side filter errors
          console.warn('Client-side filter fallback failed', e);
        }

        return {
          ...res,
          data: items,
          total: items.length,
        };
      }}
      createApi={createGrammar}
      updateApi={updateGrammar}
      deleteApi={deleteGrammar}
      buildPayload={buildPayload}
      mapItemToForm={mapItemToForm}
      hideHeader={true}
      hideActionsColumn={true}
    />
  );
};

export default Grammar;
