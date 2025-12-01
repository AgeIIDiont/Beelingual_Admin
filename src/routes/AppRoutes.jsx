// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages for code splitting and better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Vocabulary = lazy(() => import('../pages/Vocabulary'));
const Grammar = lazy(() => import('../pages/Grammar'));
const Topics = lazy(() => import('../pages/Topics'));
const Exercises = lazy(() => import('../pages/Exercises'));
const Users = lazy(() => import('../pages/Users'));
const Stats = lazy(() => import('../pages/Stats'));
const Settings = lazy(() => import('../pages/Settings'));

// Components
import PrivateRoutes from './PrivateRoutes';
import Login from '../components/Login/Login';
import { isAuthenticated } from '../services/authService';

// Loading component
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
    <div className="text-center">
      <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="text-muted mt-3">Đang tải trang...</p>
    </div>
  </div>
);

// Component để redirect nếu đã đăng nhập
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Private routes - bắt buộc đăng nhập, có Layout với Sidebar */}
        <Route 
          path="/" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/vocabulary" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Vocabulary />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/grammar" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Grammar />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/topics" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Topics />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/exercises" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Exercises />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/users" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Users />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Stats />
              </Suspense>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoutes>
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            </PrivateRoutes>
          } 
        />

        {/* 404 */}
        <Route path="*" element={
          <div className="container text-center py-5">
            <h1>404 - Không tìm thấy trang</h1>
          </div>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

