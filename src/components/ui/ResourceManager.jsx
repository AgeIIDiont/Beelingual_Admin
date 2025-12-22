import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';

// --- STYLES & ANIMATIONS (Inline CSS for portability) ---
const customStyles = `
  .rm-container {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  .rm-card {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 16px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  .rm-card:hover {
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
  }
  .rm-btn-primary {
    background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(237, 143, 3, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .rm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(237, 143, 3, 0.4);
    color: white;
  }
  .rm-table-header th {
    background-color: #f8f9fa;
    color: #6c757d;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 16px;
    border-bottom: 2px solid #e9ecef;
  }
  .rm-table-row {
    transition: all 0.2s ease;
    border-bottom: 1px solid #f1f3f5;
  }
  .rm-table-row:hover {
    background-color: #fff8e1 !important; /* Slight yellow tint on hover */
  }
  .rm-table-row td {
    padding: 16px;
    vertical-align: middle;
    color: #495057;
  }
  .rm-input-modern {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 10px 15px;
    transition: all 0.2s;
  }
  .rm-input-modern:focus {
    background-color: #fff;
    border-color: #ED8F03;
    box-shadow: 0 0 0 4px rgba(237, 143, 3, 0.1);
  }
  .rm-action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border: none;
  }
  .rm-action-btn.edit {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  .rm-action-btn.edit:hover {
    background-color: #1976d2;
    color: white;
  }
  .rm-action-btn.delete {
    background-color: #ffebee;
    color: #d32f2f;
  }
  .rm-action-btn.delete:hover {
    background-color: #d32f2f;
    color: white;
  }
  .fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-blur {
    backdrop-filter: blur(5px);
    background-color: rgba(0,0,0,0.4);
  }
`;

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
  defaultLimit = 10,
  limitOptions = [10, 20, 50],
  primaryKey = '_id',
  baseQuery = {},
  mapItemToForm,
  buildPayload,
  hideHeader = false,
  customFormRenderer,
  hideActionsColumn = false,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState(initialFormValues);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

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
        setFeedback({
          type: 'success',
          message: `Đã cập nhật ${resourceName} thành công.`,
        });
      } else {
        await createApi(payload);
        setFeedback({
          type: 'success',
          message: `Đã thêm ${resourceName} mới thành công.`,
        });
      }

      closeForm();
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      setFormError(err.message || 'Không thể lưu dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!deleteApi) return;
    const confirmDelete = window.confirm(`Bạn chắc chắn muốn xóa ${resourceName} này?`);
    if (!confirmDelete) return;

    try {
      await deleteApi(item[primaryKey], item);
      setFeedback({
        type: 'success',
        message: `Đã xóa ${resourceName} thành công.`,
      });
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Không thể xóa bản ghi.',
      });
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => setRefreshIndex((prev) => prev + 1),
    openCreateForm,
    openEditForm,
  }));

  const renderFilterInput = (filter) => {
    const value = filterInputs[filter.name] ?? '';
    const commonProps = {
      className: 'form-control rm-input-modern', // NEW CLASS
      id: filter.name,
      name: filter.name,
      value,
      onChange: (e) => handleFilterInputChange(e, filter),
      placeholder: filter.placeholder,
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
    const disabled = field.disabled || (field.disabledOnEdit && editingItem);
    const commonProps = {
      className: 'form-control rm-input-modern', // NEW CLASS
      id: field.name,
      name: field.name,
      value,
      onChange: (e) => handleFormChange(e, field),
      placeholder: field.placeholder,
      required: field.required && !(field.onlyCreate && editingItem),
      disabled,
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
          : 'text';

    return <input type={inputType} {...commonProps} />;
  };

  const hasActions = Boolean((updateApi || deleteApi) && !hideActionsColumn);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5 rm-container">
      {/* Inject custom styles */}
      <style>{customStyles}</style>

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
      )}

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
      {filters.length > 0 && (
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
      )}

      {/* TABLE SECTION */}
      <div className="rm-card p-0 overflow-hidden fade-in-up" style={{ animationDelay: '0.2s' }}>
        {error && (
          <div className="alert alert-danger m-4" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="rm-table-header">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ minWidth: col.minWidth || 'auto' }} className={col.className}>
                    {col.label}
                  </th>
                ))}
                {hasActions && <th className="text-end">Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-5">
                    <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-2">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              )}

              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-5 text-muted">
                    <div className="py-4">
                      <i className="fas fa-folder-open display-4 text-light mb-3"></i>
                      <p>Chưa có dữ liệu {resourceName} nào.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                records.length > 0 &&
                records.map((item) => (
                  <tr key={item[primaryKey]} className="rm-table-row">
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
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
                ))}
            </tbody>
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
      {showForm && (
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
                        {formFields.map((field) => (
                          <div className={`col-md-${field.col || 12}`} key={field.name}>
                            <label htmlFor={field.name} className="form-label fw-bold text-secondary small text-uppercase">
                              {field.label} {field.required && <span className="text-danger">*</span>}
                            </label>
                            {renderFormField(field)}
                            {field.helper && <small className="text-muted d-block mt-1 fst-italic">{field.helper}</small>}
                          </div>
                        ))}
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
      )}
    </div>
  );
});

ResourceManager.displayName = 'ResourceManager';

export default ResourceManager;