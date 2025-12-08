import React from 'react';

const LeaderboardCard = ({ users, loading }) => {
    if (loading) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                    <h5 className="card-title fw-bold mb-4">
                        <i className="fas fa-trophy text-warning me-2"></i>
                        Bảng Xếp Hạng
                    </h5>
                    <div className="text-center py-5">
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                    <h5 className="card-title fw-bold mb-4">
                        <i className="fas fa-trophy text-warning me-2"></i>
                        Bảng Xếp Hạng
                    </h5>
                    <div className="text-center py-5 text-muted">
                        <i className="fas fa-users fa-3x mb-3 opacity-25"></i>
                        <p>Chưa có dữ liệu xếp hạng</p>
                    </div>
                </div>
            </div>
        );
    }

    const getMedalIcon = (rank) => {
        switch (rank) {
            case 1:
                return <i className="fas fa-trophy text-warning fs-4"></i>;
            case 2:
                return <i className="fas fa-medal" style={{ color: '#C0C0C0' }}></i>;
            case 3:
                return <i className="fas fa-medal" style={{ color: '#CD7F32' }}></i>;
            default:
                return <span className="badge bg-light text-dark">{rank}</span>;
        }
    };

    const getRankBadgeClass = (rank) => {
        switch (rank) {
            case 1:
                return 'border-warning bg-warning bg-opacity-10';
            case 2:
                return 'border-secondary bg-secondary bg-opacity-10';
            case 3:
                return 'border-danger bg-danger bg-opacity-10';
            default:
                return 'border-light';
        }
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title fw-bold mb-0">
                        <i className="fas fa-trophy text-warning me-2"></i>
                        Bảng Xếp Hạng
                    </h5>
                    <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2">
                        Top {users.length}
                    </span>
                </div>

                <div className="leaderboard-list">
                    {users.map((user, index) => {
                        const rank = index + 1;
                        return (
                            <div
                                key={user._id || index}
                                className={`leaderboard-item d-flex align-items-center p-3 mb-2 border rounded-3 ${getRankBadgeClass(rank)}`}
                            >
                                {/* Rank */}
                                <div className="rank-badge me-3" style={{ minWidth: '40px', textAlign: 'center' }}>
                                    {getMedalIcon(rank)}
                                </div>

                                {/* Avatar */}
                                <div className="me-3">
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || user.username)}&background=ffc107&color=fff`}
                                        alt={user.fullname || user.username}
                                        className="rounded-circle"
                                        width="45"
                                        height="45"
                                        style={{ objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=6c757d&color=fff';
                                        }}
                                    />
                                </div>

                                {/* User Info */}
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark">{user.fullname || user.username}</div>
                                    <div className="small text-muted">
                                        Level {user.level || 'A'}
                                        {user.role === 'admin' && (
                                            <span className="badge bg-danger ms-2" style={{ fontSize: '0.65rem' }}>Admin</span>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="text-end">
                                    <div className="d-flex align-items-center justify-content-end mb-1">
                                        <i className="fas fa-star text-warning me-1" style={{ fontSize: '0.85rem' }}></i>
                                        <span className="fw-bold text-dark">{user.xp?.toLocaleString() || 0}</span>
                                        <span className="text-muted small ms-1">XP</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <i className="fas fa-gem text-info me-1" style={{ fontSize: '0.75rem' }}></i>
                                        <span className="small text-muted">{user.gems?.toLocaleString() || 0} gems</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        .leaderboard-item {
          transition: all 0.2s ease;
        }
        .leaderboard-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
        </div>
    );
};

export default LeaderboardCard;
