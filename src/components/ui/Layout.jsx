import React, { memo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { PageProvider } from '../../contexts/PageContext';

const Layout = memo(({ children }) => {
  return (
    <PageProvider>
      <div className="d-flex" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
        {/* 1. Sidebar */}
        <Sidebar />

        {/* 2. Main Content Wrapper */}
        <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
          
          <Header />
          
          {/* 3. Main Area */}
          <main 
            className="flex-grow-1"
            style={{ 
              marginTop: '50px', // Đẩy xuống để không bị Header che (Header cao ~80-90px)
              padding: '30px',   // QUAN TRỌNG: Tạo khoảng cách giữa nội dung và các mép
              overflowX: 'hidden' // Ngăn thanh cuộn ngang nếu animation bay ra ngoài
            }}
          >
            {children}
          </main>
          
        </div>
      </div>
    </PageProvider>
  );
});

Layout.displayName = 'Layout';

export default Layout;