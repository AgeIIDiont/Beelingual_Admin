import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import SessionMonitor from '../SessionMonitor';
import { PageProvider } from '../../contexts/PageContext';
import './styles/layout.scss';

const Layout = ({ children }) => {
  return (
    <PageProvider>
      <SessionMonitor />
      <div className="layout-container d-flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="layout-main d-flex flex-column">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="layout-content flex-grow-1">
            {children}
          </main>
        </div>
      </div>
    </PageProvider>
  );
};

export default Layout;