import React, { useMemo, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrammarCategoriesAction, selectGrammarCategories } from '../store/slices/resourceSlice';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createGrammar,
  updateGrammar,
  deleteGrammar,
  fetchGrammar,
  bulkDeleteGrammar,
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

const Grammar = () => {
  const { setPageInfo } = usePage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resourceManagerRef = useRef(null);

  const categoriesData = useSelector(selectGrammarCategories);

  useEffect(() => {
    dispatch(fetchGrammarCategoriesAction());
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const options = categoriesData.map((categorie) => ({
      value: categorie._id || categorie.id || categorie.name,
      label: `${categorie.icon ? categorie.icon + ' ' : ''}${categorie.name}`,
    }));
    return [{ value: '', label: 'Tất cả' }, ...options];
  }, [categoriesData]);


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
    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn xóa?',
      text: "Hành động này sẽ xóa bài ngữ pháp và không thể hoàn tác.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGrammar(id);
      Swal.fire(
        'Đã xóa!',
        'Đã xóa bài ngữ pháp thành công.',
        'success'
      );
      // Refresh list
      if (resourceManagerRef.current) {
        resourceManagerRef.current.refresh();
      }
    } catch (error) {
      Swal.fire(
        'Lỗi!',
        'Không thể xóa: ' + (error.message || 'Lỗi không xác định'),
        'error'
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Chủ điểm ngữ pháp',
        render: (item) => (
          <div>
            <h6 className="fw-bold text-dark mb-1">{item.title}</h6>
            {/* Structure */}
            <div className="text-muted fst-italic small">
              {item.structure || 'Không có cấu trúc'}
            </div>
          </div>
        ),
      },
      {
        key: 'level',
        label: 'Level',
        minWidth: '100px',
        render: (item) => (
          <span className={`badge rounded-pill ${['A1', 'A2', 'A'].includes(item.level) ? 'bg-success' :
            ['B1', 'B2', 'B'].includes(item.level) ? 'bg-warning text-dark' :
              ['C1', 'C2', 'C'].includes(item.level) ? 'bg-danger' : 'bg-secondary'
            }`}>
            {item.level || '—'}
          </span>
        ),
      },
      {
        key: 'category',
        label: 'Danh mục',
        minWidth: '150px',
        render: (item) => (
          <div className="text-dark">
            {item.categoryId && typeof item.categoryId === 'object'
              ? item.categoryId.name
              : '—'}
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
        label: 'Thao tác',
        minWidth: '100px',
        className: 'text-end',
        render: (item) => (
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => resourceManagerRef.current?.openEditForm(item)}
              title="Chỉnh sửa"
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
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
      level: values.level || 'A1',
      // categoryId có thể là object (khi edit) hoặc string (khi create)
      // Luôn extract _id nếu là object
      categoryId: values.categoryId?._id || values.categoryId,
      structure: values.structure?.trim(),
      content: values.content?.trim(),
      example: values.example?.trim(),
    };

    // Chỉ xóa các field undefined, null, hoặc empty string
    // NHƯNG KHÔNG xóa categoryId nếu nó có giá trị
    Object.keys(payload).forEach((key) => {
      if (key === 'categoryId') {
        // Giữ categoryId nếu nó có giá trị (không phải '', null, undefined)
        if (!payload[key]) delete payload[key];
      } else {
        // Các field khác: xóa nếu falsy
        if (!payload[key]) delete payload[key];
      }
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
        // Backend đã xử lý filter, chỉ cần gọi API và trả về kết quả
        const res = await fetchGrammar(params);
        const items = res.data || res.items || [];

        // Debug log (có thể xóa sau khi test xong)
        console.log('📊 Grammar API Response:', {
          params,
          totalItems: items.length,
          total: res.total
        });

        return {
          ...res,
          data: items,
          total: res.total || items.length,
        };
      }}
      createApi={createGrammar}
      updateApi={updateGrammar}
      deleteApi={deleteGrammar}
      bulkDeleteApi={bulkDeleteGrammar}
      buildPayload={buildPayload}
      mapItemToForm={mapItemToForm}
      hideHeader={true}
      hideActionsColumn={true}
    />
  );
};

export default Grammar;
