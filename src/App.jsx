import React from 'react';
import Sidebar from './components/ui/Sidebar';
import StatsCard from './components/ui/StatsCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css' 
function App() {
  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
        {/* Header */}
        <div className="container-fluid py-5 px-4 px-lg-5">
          <div className="bg-white rounded-4 shadow p-4 mb-5 d-flex justify-content-between align-items-center">
            <h1 className="h3 fw-bold text-dark mb-0">
              Chào mừng quay lại, <span className="text-warning">Admin</span>!
            </h1>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Xin chào, Admin</span>
              <img src="https://randomuser.me/api/portraits/men/32.jpg" 
                   alt="admin" className="rounded-circle border border-warning border-4" 
                   width="56" height="56" />
            </div>
          </div>

          {/* 2x2 Grid */}
          <div className="row g-5">
            <div className="col-12 col-md-6">
              <StatsCard title="Tổng từ vựng" number={8542} subtitle="Từ & Cụm từ trong hệ thống" icon="fa-book" />
            </div>
            <div className="col-12 col-md-6">
              <StatsCard title="Chủ điểm ngữ pháp" number={126} subtitle="Bài học ngữ pháp chi tiết" icon="fa-spell-check" />
            </div>
            <div className="col-12 col-md-6">
              <StatsCard title="Chủ đề học" number={48} subtitle="Topics & Units" icon="fa-tags" />
            </div>
            <div className="col-12 col-md-6">
              <StatsCard title="Bài tập & Đề thi" number={324} subtitle="Bài tập đã tạo & sẵn sàng" icon="fa-file-alt" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;