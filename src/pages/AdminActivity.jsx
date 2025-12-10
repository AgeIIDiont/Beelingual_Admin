// ...existing imports
import React, { useEffect, useState } from 'react';
import { fetchAdminLogs, fetchUsers } from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const formatDateTime = (value) => {
    if (!value) return '—';
    const dt = new Date(value);
    return `${dt.toLocaleDateString('vi-VN')} • ${dt.toLocaleTimeString('vi-VN')}`;
};

const AdminActivity = () => {
    const { setPageInfo } = usePage();
    const [logs, setLogs] = useState([]);
    const [adminMap, setAdminMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch logs and users in parallel
            // Fetching mostly admins would be better but fetchUsers returns all, which is fine for now as we just need the map
            // We might want to filter for admins if the list is huge, but let's assume fetchUsers is paginated.
            // Actually, to be safe, let's just fetch a larger list or rely on what we can get.
            // Ideally invalid/unknown IDs will fallback to 'Unknown' or the ID itself.

            const [logsRes, usersRes] = await Promise.all([
                fetchAdminLogs({ limit: 10 }),
                fetchUsers({ limit: 1000 }) // Fetch a large batch to try and cover all admins
            ]);

            const logsData = logsRes.data || [];

            // Build map from ID to Name
            const users = usersRes.users || usersRes.data || [];
            const map = {};
            users.forEach(u => {
                map[u._id] = u.username || u.email;
            });
            setAdminMap(map);
            setLogs(logsData);

        } catch (err) {
            setError(err.message || 'Không thể tải nhật ký hoạt động');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPageInfo({
            title: 'Trang hoạt động admin',
            description: 'Nhật ký các hành động của quản trị viên trên hệ thống',
            actions: (
                <button className="btn btn-warning text-dark fw-bold" onClick={loadData}>
                    <i className="fas fa-rotate me-2" />
                    Làm mới
                </button>
            ),
        });
        return () => setPageInfo({ title: '', description: '', actions: null });
    }, [setPageInfo]);

    useEffect(() => {
        loadData();
    }, []);

    const getAdminName = (log) => {
        // If populated by backend
        if (log.adminId && typeof log.adminId === 'object') {
            return log.adminId.fullname || log.adminId.username || 'Unknown';
        }
        // If string ID, lookup in map
        if (log.adminId && typeof log.adminId === 'string') {
            return adminMap[log.adminId] || log.adminId;
        }
        return '—';
    };

    return (
        <div className="container-fluid py-5 px-4 px-lg-5">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status" />
                    <p className="text-muted mt-3">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="bg-white rounded-4 shadow p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-dark mb-0">Nhật ký hoạt động</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle table-hover">
                            <thead>
                                <tr className="text-muted border-bottom">
                                    <th>Thời gian</th>
                                    <th>Tài khoản</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="text-nowrap">{formatDateTime(log.createdAt)}</td>
                                        <td>
                                            <div className="fw-semibold">
                                                {getAdminName(log)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: '0.85rem' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!logs.length && (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted py-5">
                                            <i className="fas fa-history fa-2x mb-3 d-block opacity-50"></i>
                                            Chưa có hoạt động nào được ghi lại.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActivity;
