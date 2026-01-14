import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import './styles/resource-manager.scss';



const sanitizePayload = (values) => {
  const payload = {};
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        payload[key] = trimmed;
      }
    } else if (value !== '' && value !== null) {
      payload[key] = value;
    }
  });
  return payload;
};

const ResourceManager = forwardRef(({
  title,
  description,
  resourceName = 'bản ghi',
  columns = [],
  filters = [],
  formFields = [],
  listApi,
  createApi,
  updateApi,
  deleteApi,
  bulkDeleteApi,
  defaultLimit = 10,
  limitOptions = [10, 20, 50],
  primaryKey = '_id',
  baseQuery = {},
  mapItemToForm,
  buildPayload,
  hideHeader = false,
  customFormRenderer,
  hideActionsColumn = false,
  enableReorder = false,
  onReorder,
}, ref) => {
  const initialFilterValues = useMemo(() => {
    const values = {};
    filters.forEach((filter) => {
      values[filter.name] = filter.defaultValue ?? '';
    });
    return values;
  }, [filters]);

  const initialFormValues = useMemo(() => {
    const formValues = {};
    formFields.forEach((field) => {
      formValues[field.name] = field.defaultValue ?? '';
    });
    return formValues;
  }, [formFields]);

  const [filterInputs, setFilterInputs] = useState(initialFilterValues);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterValues);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Kiểm tra xem có đang filter không
  const isFiltering = useMemo(() => {
    return Object.keys(appliedFilters).some(
      (key) => appliedFilters[key] !== initialFilterValues[key]
    );
  }, [appliedFilters, initialFilterValues]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState(initialFormValues);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false); // New state for selection mode toggle

  // Hover Hint State
  const [hintRowId, setHintRowId] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleRowMouseEnter = (id) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (!isSelectionMode && deleteApi) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHintRowId(id);
      }, 1000); // 2 seconds delay
    }
  };

  const handleRowMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHintRowId(null);
  };

  const baseQueryString = JSON.stringify(baseQuery || {});

  const fetchRecords = useCallback(async () => {
    if (!listApi) return;

    setLoading(true);
    setError('');
    try {
      const params = {
        ...JSON.parse(baseQueryString),
        ...appliedFilters,
        page,
        limit,
      };
      const response = await listApi(params);
      let fetchedRecords = response.data || response.items || [];
      const totalRecords = response.total ?? response.count ?? 0;
      const limitValue = response.limit ?? limit ?? defaultLimit;

      // LOGIC MỚI: Hỗ trợ phân trang Client-side khi API trả về Full list (dành cho trường hợp Merge nhiều nguồn)
      // Nếu số lượng bản ghi trả về > limit VÀ khớp với tổng số lượng -> Có nghĩa là chưa được phân trang server
      if (fetchedRecords.length > limitValue && fetchedRecords.length === totalRecords) {
        const startIndex = (page - 1) * limitValue;
        const endIndex = startIndex + limitValue;
        fetchedRecords = fetchedRecords.slice(startIndex, endIndex);
      }

      setRecords(fetchedRecords);

      const computedPages =
        response.totalPages ?? Math.max(1, Math.ceil(totalRecords / Math.max(1, limitValue)));

      setMeta({
        total: totalRecords,
        page: response.page ?? page, // warning: response.page might be undefined for full list
        limit: limitValue,
        totalPages: computedPages,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, baseQueryString, limit, listApi, page, refreshIndex]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    setFilterInputs(initialFilterValues);
    setAppliedFilters(initialFilterValues);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilterValues)]);

  useEffect(() => {
    setFormState(initialFormValues);
  }, [initialFormValues]);

  const handleFilterInputChange = (e, filter) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({
      ...prev,
      [name]: filter.type === 'number' ? Number(value) : value,
    }));

    // Call onChange callback if provided
    if (filter.onChange) {
      filter.onChange(value, name);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filterInputs);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilterInputs(initialFilterValues);
    setAppliedFilters(initialFilterValues);
    setPage(1);
  };

  const handleFormChange = (e, field) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho number với min: nếu giá trị < min thì về rỗng (auto)
    if (field.type === 'number' && field.min !== undefined) {
      if (value !== '' && Number(value) < field.min) {
        setFormState((prev) => ({ ...prev, [name]: '' }));
        return;
      }
    }

    setFormState((prev) => ({
      ...prev,
      [name]:
        field.type === 'number'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError('');
    setEditingItem(null);
    setFormState(initialFormValues);
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormState(initialFormValues);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (item) => {
    const mapped = mapItemToForm ? mapItemToForm(item) : { ...initialFormValues, ...item };
    setEditingItem(item);
    setFormState(mapped);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!createApi && !updateApi) return;

    setSaving(true);
    setFormError('');

    try {
      const payload = buildPayload
        ? buildPayload(formState, Boolean(editingItem))
        : sanitizePayload(formState);

      if (editingItem) {
        await updateApi(editingItem[primaryKey], payload);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Đã cập nhật ${resourceName} thành công.`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await createApi(payload);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Đã thêm ${resourceName} mới thành công.`,
          timer: 1500,
          showConfirmButton: false
        });
      }

      closeForm();
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: err.message || 'Không thể lưu dữ liệu.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!deleteApi) return;

    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn xóa?',
      text: `Hành động này sẽ xóa ${resourceName} và không thể hoàn tác.`,
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
      await deleteApi(item[primaryKey], item);
      Swal.fire(
        'Đã xóa!',
        `Đã xóa ${resourceName} thành công.`,
        'success'
      );
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Không thể xóa bản ghi.';
      Swal.fire(
        'Lỗi!',
        message,
        'error'
      );
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => setRefreshIndex((prev) => prev + 1),
    openCreateForm,
    openEditForm,
  }));

  const handleDragStart = (itemId) => {
    if (!enableReorder) return;
    setDraggingId(itemId);
  };

  const handleDragEnter = (itemId) => {
    if (!enableReorder || itemId === draggingId) return;
    setDragOverId(itemId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDrop = async (targetId) => {
    if (!enableReorder || !draggingId) return;

    const sourceIndex = records.findIndex((r) => r[primaryKey] === draggingId);
    const destinationIndex = records.findIndex((r) => r[primaryKey] === targetId);

    if (sourceIndex === -1 || destinationIndex === -1 || sourceIndex === destinationIndex) {
      handleDragEnd();
      return;
    }

    const reordered = [...records];
    const [movedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedItem);

    const reindexed = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setRecords(reindexed);
    setDraggingId(null);
    setDragOverId(null);

    if (onReorder) {
      try {
        await onReorder(sourceIndex, destinationIndex, movedItem);
      } catch (err) {
        console.error('onReorder failed', err);
        setFeedback({ type: 'danger', message: 'Không thể sắp xếp. Đang làm mới...' });
        setRefreshIndex((prev) => prev + 1);
      }
    }
  };

  // ========== BULK ACTIONS ==========

  // Toggle select all items on current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = records.map(item => item[primaryKey]);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  // Toggle select individual item
  const handleSelectItem = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const newSelected = prev.filter(itemId => itemId !== id);
        if (newSelected.length === 0) setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, id];
        if (newSelected.length === records.length) setSelectAll(true);
        return newSelected;
      }
    });
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
    setSelectAll(false);
    setIsSelectionMode(false); // Exit selection mode
  };

  // Bulk delete selected items
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa hàng loạt',
      html: `Bạn có chắc chắn muốn xóa <strong>${selectedIds.length}</strong> ${resourceName}?<br><small class="text-muted">Hành động này không thể hoàn tác!</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Xóa ${selectedIds.length} mục`,
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);

      // OPTION 1: Use Bulk Delete API if available
      if (bulkDeleteApi) {
        try {
          await bulkDeleteApi(selectedIds);
          setFeedback({ type: 'success', message: `Đã xóa thành công ${selectedIds.length} ${resourceName}!` });
          Swal.fire('Đã xóa!', `Đã xóa ${selectedIds.length} mục thành công.`, 'success');
          handleClearSelection();
          setRefreshIndex((prev) => prev + 1);
          return;
        } catch (e) {
          console.error("Bulk Delete Failed", e);
          throw e; // Let catch block handle it
        } finally {
          setSaving(false);
        }
      }

      // OPTION 2: Fallback to One-by-One
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedIds) {
        try {
          await deleteApi(id);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete ${id}:`, err);
          failCount++;
        }
      }

      // Show result
      if (failCount === 0) {
        setFeedback({
          type: 'success',
          message: `Đã xóa thành công ${successCount} ${resourceName}!`
        });
      } else {
        setFeedback({
          type: 'warning',
          message: `Đã xóa ${successCount} ${resourceName}. ${failCount} mục không thể xóa.`
        });
      }

      // Clear selection and refresh
      handleClearSelection();
      setRefreshIndex(prev => prev + 1);

    } catch (err) {
      console.error('Bulk delete error:', err);
      setFeedback({
        type: 'danger',
        message: 'Có lỗi xảy ra khi xóa hàng loạt!'
      });
    } finally {
      setSaving(false);
    }
  };

  // Clear selection when filters change (but keep on page change)
  useEffect(() => {
    handleClearSelection();
  }, [appliedFilters, refreshIndex]);


  const renderFilterInput = (filter) => {
    const value = filterInputs[filter.name] ?? '';
    const commonProps = {
      className: 'form-control rm-input-modern', // NEW CLASS
      id: filter.name,
      name: filter.name,
      value,
      onChange: (e) => handleFilterInputChange(e, filter),
      placeholder: filter.placeholder,
      autoComplete: 'off', // Tắt gợi ý trình duyệt
    };

    if (filter.type === 'select' && Array.isArray(filter.options)) {
      return (
        <select {...commonProps}>
          {filter.options.map((option) => (
            <option key={option.value ?? option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={filter.type === 'number' ? 'number' : 'text'}
        {...commonProps}
      />
    );
  };

  const renderFormField = (field) => {
    if (field.onlyCreate && editingItem) return null;
    if (field.onlyEdit && !editingItem) return null;

    const value = formState[field.name] ?? '';
    let disabled = field.disabled;
    if (typeof disabled === 'function') {
      disabled = disabled(editingItem);
    }
    disabled = disabled || (field.disabledOnEdit && editingItem);
    const commonProps = {
      className: 'form-control rm-input-modern', // NEW CLASS
      id: field.name,
      name: field.name,
      value,
      onChange: (e) => handleFormChange(e, field),
      placeholder: field.placeholder,
      required: field.required && !(field.onlyCreate && editingItem),
      disabled,
      autoComplete: field.type === 'password' ? 'new-password' : 'off', // Tắt gợi ý trình duyệt
    };

    if (field.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={field.rows || 3}
        />
      );
    }

    if (field.type === 'select' && Array.isArray(field.options)) {
      return (
        <select {...commonProps}>
          {field.options.map((option) => (
            <option key={option.value ?? option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const inputType =
      field.type === 'number'
        ? 'number'
        : field.type === 'password'
          ? 'password'
          : field.type === 'email'
            ? 'email'
            : 'text';

    // Thêm min/max cho input number
    const numberProps = field.type === 'number' ? {
      min: field.min,
      max: field.max,
    } : {};

    return <input type={inputType} {...commonProps} {...numberProps} />;
  };

  const hasActions = Boolean((updateApi || deleteApi) && !hideActionsColumn);

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (hasActions ? 1 : 0) + (enableReorder ? 1 : 0)} className="text-center py-5">
              <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="text-muted mt-2">Đang tải dữ liệu...</p>
            </td>
          </tr>
        </tbody>
      );
    }

    if (records.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (hasActions ? 1 : 0) + (enableReorder ? 1 : 0)} className="text-center py-5 text-muted">
              <div className="py-4">
                <i className="fas fa-folder-open display-4 text-light mb-3"></i>
                <p>Chưa có dữ liệu {resourceName} nào.</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    const rows = records.map((item, index) => {
      const isDragging = draggingId === item[primaryKey];
      const isDragOver = dragOverId === item[primaryKey];
      return (
        <tr
          key={item[primaryKey]}
          className={`rm-table-row${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
          draggable={enableReorder && !isFiltering}
          onDragStart={() => handleDragStart(item[primaryKey])}
          onDragEnter={() => handleDragEnter(item[primaryKey])}
          onDragOver={(e) => {
            if (enableReorder) e.preventDefault();
          }}
          onDrop={(e) => {
            if (enableReorder) {
              e.preventDefault();
              handleDrop(item[primaryKey]);
            }
          }}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => handleRowMouseEnter(item[primaryKey])}
          onMouseLeave={handleRowMouseLeave}
          onDoubleClick={(e) => {

            e.preventDefault();
            if (deleteApi) {
              setIsSelectionMode(true);
              if (!selectedIds.includes(item[primaryKey])) {
                handleSelectItem(item[primaryKey]);
              }
            } else if (updateApi && !isSelectionMode) {
              openEditForm(item);
            }
          }}
          style={{ cursor: (deleteApi || updateApi) ? 'pointer' : 'default' }}
        >
          {/* Bulk selection checkbox */}
          {/* Bulk selection checkbox */}
          {deleteApi && isSelectionMode && (
            <td className="text-center">
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedIds.includes(item[primaryKey])}
                onChange={() => handleSelectItem(item[primaryKey])}
              />
            </td>
          )}
          {enableReorder && (
            <td className="text-center text-muted" style={{ width: '40px', cursor: isFiltering ? 'not-allowed' : 'grab' }}>
              {isFiltering ? (
                <i className="fas fa-filter text-secondary opacity-25" title="Tắt bộ lọc để sắp xếp"></i>
              ) : (
                <i className="fas fa-grip-vertical"></i>
              )}
            </td>
          )}
          {columns.map((col, index) => (
            <td key={col.key} className={col.className} style={{ position: 'relative' }}>
              {index === 0 && hintRowId === item[primaryKey] && !isSelectionMode && (
                <div className="position-absolute bg-dark text-white px-2 py-1 rounded small shadow top-0 start-0 translate-middle-y ms-2 mt-n2 animate__animated animate__fadeIn"
                  style={{ zIndex: 1000, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                  Double click để chọn
                  <div className="position-absolute bg-dark"
                    style={{ bottom: '-4px', left: '10px', width: '8px', height: '8px', transform: 'rotate(45deg)' }}></div>
                </div>
              )}
              {col.render ? col.render(item) : (
                <span className="fw-medium text-dark">{item[col.key] ?? '—'}</span>
              )}
            </td>
          ))}
          {hasActions && (
            <td className="text-end">
              <div className="d-flex justify-content-end gap-2">
                {updateApi && (
                  <button
                    className="rm-action-btn edit"
                    onClick={() => openEditForm(item)}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-pen fa-sm" />
                  </button>
                )}
                {deleteApi && (
                  <button
                    className="rm-action-btn delete"
                    onClick={() => handleDelete(item)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash fa-sm" />
                  </button>
                )}
              </div>
            </td>
          )}
        </tr>
      );
    });

    return <tbody>{rows}</tbody>;
  };

  return (
    <div className="container-fluid py-4 rm-container">

      {/* HEADER SECTION */}
      {!hideHeader && (
        <div className="rm-card p-4 mb-4 fade-in-up">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h1 className="h3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <span className="badge bg-warning text-dark rounded-circle p-2" style={{ fontSize: '0.5em' }}>
                  <i className="fas fa-layer-group"></i>
                </span>
                {title}
              </h1>
              {description && <p className="text-muted mb-0 ms-1">{description}</p>}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light text-secondary fw-medium shadow-sm"
                type="button"
                onClick={() => setRefreshIndex((prev) => prev + 1)}
              >
                <i className="fas fa-rotate me-2"></i>
                Làm mới
              </button>
              {createApi && (
                <button className="btn rm-btn-primary fw-bold rounded-pill px-4" onClick={openCreateForm}>
                  <i className="fas fa-plus me-2" />
                  Thêm mới
                </button>
              )}

            </div>
          </div>

          {feedback && (
            <div className={`alert alert-${feedback.type} mt-4 mb-0 shadow-sm border-0 rounded-3`} role="alert">
              <i className={`fas fa-${feedback.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
              {feedback.message}
              <button
                type="button"
                className="btn-close float-end"
                onClick={() => setFeedback(null)}
              ></button>
            </div>
          )}
        </div>
      )
      }

      {hideHeader && feedback && (
        <div className={`alert alert-${feedback.type} mb-4 shadow-sm border-0 rounded-3`} role="alert">
          {feedback.message}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setFeedback(null)}
          ></button>
        </div>
      )}

      {/* FILTER SECTION */}
      {
        filters.length > 0 && (
          <div className="rm-card p-4 mb-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleApplyFilters}>
              <div className="row g-3">
                {filters.map((filter) => {
                  // Check visibility condition
                  if (filter.hideCondition && filter.hideCondition(filterInputs)) {
                    return null;
                  }
                  return (
                    <div className={`col-md-${filter.col || 4}`} key={filter.name}>
                      <label htmlFor={filter.name} className="form-label text-secondary fw-bold small text-uppercase">
                        {filter.label}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  );
                })}
              </div>
              <div className="d-flex gap-2 mt-4 pt-2 border-top">
                <button type="submit" className="btn btn-dark px-4 fw-medium">
                  <i className="fas fa-filter me-2"></i> Áp dụng
                </button>
                <button type="button" className="btn btn-link text-decoration-none text-secondary" onClick={handleResetFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>
        )
      }

      {/* TABLE SECTION */}
      <div className="rm-card p-0 overflow-hidden fade-in-up" style={{ animationDelay: '0.2s' }}>
        {error && (
          <div className="alert alert-danger m-4" role="alert">
            {error}
          </div>
        )}

        {/* BULK ACTION TOOLBAR */}
        {(selectedIds.length > 0 || isSelectionMode) && (
          <div className="alert alert-info d-flex align-items-center justify-content-between mb-0 rounded-0 border-start-0 border-end-0" style={{ borderTop: '2px solid #0dcaf0' }}>
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-check-circle"></i>
              <span className="fw-bold">Đã chọn {selectedIds.length} mục</span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClearSelection}
              >
                <i className="fas fa-times me-1"></i>
                Bỏ chọn
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
                disabled={saving}
              >
                <i className="fas fa-trash me-1"></i>
                {saving ? 'Đang xóa...' : `Xóa ${selectedIds.length} mục`}
              </button>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="rm-table-header">
              <tr>
                {/* Bulk selection checkbox */}
                {/* Bulk selection checkbox */}
                {deleteApi && isSelectionMode && (
                  <th style={{ width: '50px' }} className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={records.length === 0}
                    />
                  </th>
                )}
                {/* {enableReorder && <th style={{ width: '40px' }}></th>} */}
                {columns.map((col) => (
                  <th key={col.key} style={{ minWidth: col.minWidth || 'auto' }} className={col.className}>
                    {col.label}
                  </th>
                ))}
                {hasActions && <th className="text-end">Thao tác</th>}
              </tr>
            </thead>
            {renderTableBody()}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-top bg-light bg-opacity-10 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="text-muted small">
            Hiển thị <strong>{records.length}</strong> / <strong>{meta.total}</strong> kết quả.
          </div>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select form-select-sm rm-input-modern"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ minWidth: '140px', paddingRight: '2.5rem' }}
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option} dòng/trang
                </option>
              ))}
            </select>
            <div className="btn-group shadow-sm">
              <button
                className="btn btn-white border"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <i className="fas fa-chevron-left small"></i>
              </button>
              <span className="btn btn-white border-top border-bottom disabled fw-bold bg-white text-dark px-3">
                {page}
              </span>
              <button
                className="btn btn-white border"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              >
                <i className="fas fa-chevron-right small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {
        showForm && (
          <>
            <div className="modal fade show d-block modal-blur" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content border-0 shadow-lg overflow-hidden rounded-4 fade-in-up">
                  <div className="modal-header bg-light border-bottom-0 p-4">
                    <div>
                      <h5 className="modal-title fw-bold text-dark">
                        {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {resourceName}
                      </h5>
                      <p className="text-muted small mb-0">Điền thông tin chi tiết bên dưới</p>
                    </div>
                    <button type="button" className="btn-close" onClick={closeForm}></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body p-4">
                      {formError && (
                        <div className="alert alert-danger rounded-3" role="alert">
                          {formError}
                        </div>
                      )}
                      {customFormRenderer ? (
                        customFormRenderer({
                          formState,
                          setFormState,
                          editingItem,
                          handleFormChange,
                          renderFormField,
                        })
                      ) : (
                        <div className="row g-3">
                          {formFields.map((field) => {
                            // Check visibility before rendering anything
                            if (field.onlyCreate && editingItem) return null;
                            if (field.onlyEdit && !editingItem) return null;

                            return (
                              <div className={`col-md-${field.col || 12}`} key={field.name}>
                                <label htmlFor={field.name} className="form-label fw-bold text-secondary small text-uppercase">
                                  {field.label} {field.required && <span className="text-danger">*</span>}
                                </label>
                                {renderFormField(field)}
                                {field.helper && <small className="text-muted d-block mt-1 fst-italic">{field.helper}</small>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer border-top-0 p-4 pt-0">
                      <button
                        type="button"
                        className="btn btn-light text-secondary fw-medium"
                        onClick={closeForm}
                        disabled={saving}
                      >
                        Hủy bỏ
                      </button>
                      <button type="submit" className="btn rm-btn-primary fw-bold px-4 rounded-pill" disabled={saving}>
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2" />
                            Lưu lại
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" style={{ opacity: 0.5 }}></div>
          </>
        )
      }
    </div >
  );
});

ResourceManager.displayName = 'ResourceManager';

export default ResourceManager;