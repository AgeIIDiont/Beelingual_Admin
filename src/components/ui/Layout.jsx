import React, { memo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { PageProvider } from '../../contexts/PageContext';

const Layout = memo(({ children }) => {
  return (
    <PageProvider>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
          <Header />
          <main style={{ marginTop: '90px', minHeight: 'calc(100vh - 90px)' }}>
            {children}
          </main>
        </div>
      </div>
    </PageProvider>
  );
});

Layout.displayName = 'Layout';

export default Layout;

