import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';

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
  hideHeader = false, // New prop to hide header section
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
      setRecords(response.data || response.items || []);
      const totalRecords = response.total ?? response.count ?? 0;
      const limitValue = response.limit ?? limit ?? defaultLimit;
      const computedPages =
        response.totalPages ?? Math.max(1, Math.ceil(totalRecords / Math.max(1, limitValue)));

      setMeta({
        total: totalRecords,
        page: response.page ?? page,
        limit: limitValue,
        totalPages: computedPages,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, baseQueryString, limit, listApi, page, refreshIndex]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    setFilterInputs(initialFilterValues);
    setAppliedFilters(initialFilterValues);
    setPage(1);
  }, [initialFilterValues]);

  useEffect(() => {
    setFormState(initialFormValues);
  }, [initialFormValues]);

  const handleFilterInputChange = (e, filter) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({
      ...prev,
      [name]: filter.type === 'number' ? Number(value) : value,
    }));
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
      await deleteApi(item[primaryKey]);
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

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    refresh: () => setRefreshIndex((prev) => prev + 1),
    openCreateForm,
  }));

  const renderFilterInput = (filter) => {
    const value = filterInputs[filter.name] ?? '';
    const commonProps = {
      className: 'form-control',
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
      className: 'form-control',
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

  const hasActions = Boolean(updateApi || deleteApi);

  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      {/* Only show header section if not hidden */}
      {!hideHeader && (
        <div className="bg-white rounded-4 shadow p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">{title}</h1>
              {description && <p className="text-muted mb-0">{description}</p>}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setRefreshIndex((prev) => prev + 1)}
              >
                <i className="fas fa-rotate me-2"></i>
                Làm mới
              </button>
              {createApi && (
                <button className="btn btn-warning text-dark fw-bold" onClick={openCreateForm}>
                  <i className="fas fa-plus me-2" />
                  Thêm {resourceName}
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className={`alert alert-${feedback.type} mt-3 mb-0`} role="alert">
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

      {/* Feedback alert when header is hidden */}
      {hideHeader && feedback && (
        <div className={`alert alert-${feedback.type} mb-4`} role="alert">
          {feedback.message}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setFeedback(null)}
          ></button>
        </div>
      )}

      {filters.length > 0 && (
        <div className="bg-white rounded-4 shadow p-4 mb-4">
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3">
              {filters.map((filter) => (
                <div className={`col-md-${filter.col || 4}`} key={filter.name}>
                  <label htmlFor={filter.name} className="form-label text-muted fw-medium">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-warning text-dark fw-bold">
                Áp dụng
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
                Xóa bộ lọc
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-4 shadow p-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted">
                {columns.map((col) => (
                  <th key={col.key} style={{ minWidth: col.minWidth || 'auto' }}>
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
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-4 text-muted">
                    Chưa có {resourceName} nào.
                  </td>
                </tr>
              )}

              {!loading &&
                records.length > 0 &&
                records.map((item) => (
                  <tr key={item[primaryKey]}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(item) : item[col.key] ?? '—'}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="text-end">
                        {updateApi && (
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openEditForm(item)}
                          >
                            <i className="fas fa-pen me-1" />
                            Sửa
                          </button>
                        )}
                        {deleteApi && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item)}
                          >
                            <i className="fas fa-trash me-1" />
                            Xóa
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
          <div className="text-muted">
            Hiển thị {records.length} / {meta.total} {resourceName}.
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="text-muted me-2 mb-0">Số dòng / trang</label>
            <select
              className="form-select w-auto"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </button>
              <span className="btn btn-outline-secondary disabled">
                Trang {page} / {meta.totalPages}
              </span>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {resourceName}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeForm}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {formError && (
                      <div className="alert alert-danger" role="alert">
                        {formError}
                      </div>
                    )}
                    <div className="row">
                      {formFields.map((field) => (
                        <div className={`col-md-${field.col || 12} mb-3`} key={field.name}>
                          <label htmlFor={field.name} className="form-label fw-medium text-muted">
                            {field.label}
                          </label>
                          {renderFormField(field)}
                          {field.helper && <small className="text-muted d-block mt-1">{field.helper}</small>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeForm}
                      disabled={saving}
                    >
                      Đóng
                    </button>
                    <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2" />
                          Lưu {resourceName}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
});

ResourceManager.displayName = 'ResourceManager';

export default ResourceManager;


