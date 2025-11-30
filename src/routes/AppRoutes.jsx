// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Dashboard from '../pages/Dashboard';
import Vocabulary from '../pages/Vocabulary';
import Grammar from '../pages/Grammar';
import Topics from '../pages/Topics';
import Exercises from '../pages/Exercises';
import Exercises_Vocal from '../pages/Exercises_Vocal';
import Exercises_Gram from '../pages/Exercises_Gram';
import Users from '../pages/Users';
import Stats from '../pages/Stats';
import Settings from '../pages/Settings';

// Components
import PrivateRoutes from './PrivateRoutes';
import Login from '../components/Login/Login';
import { isAuthenticated } from '../services/authService';

// Component để redirect nếu đã đăng nhập
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
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
      <Route path="/" element={<PrivateRoutes><Dashboard /></PrivateRoutes>} />
      <Route path="/dashboard" element={<PrivateRoutes><Dashboard /></PrivateRoutes>} />
      <Route path="/vocabulary" element={<PrivateRoutes><Vocabulary /></PrivateRoutes>} />
      <Route path="/grammar" element={<PrivateRoutes><Grammar /></PrivateRoutes>} />
      <Route path="/topics" element={<PrivateRoutes><Topics /></PrivateRoutes>} />
      <Route path="/exercises" element={<PrivateRoutes><Exercises /></PrivateRoutes>} />
      <Route path="/exercises/vocal" element={<PrivateRoutes><Exercises_Vocal /></PrivateRoutes>} />
        <Route path="/exercises/gram" element={<PrivateRoutes><Exercises_Gram /></PrivateRoutes>} />
      <Route path="/users" element={<PrivateRoutes><Users /></PrivateRoutes>} />
      <Route path="/stats" element={<PrivateRoutes><Stats /></PrivateRoutes>} />
      <Route path="/settings" element={<PrivateRoutes><Settings /></PrivateRoutes>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="container text-center py-5">
          <h1>404 - Không tìm thấy trang</h1>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;

