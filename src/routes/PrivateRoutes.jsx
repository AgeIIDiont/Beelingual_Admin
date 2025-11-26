import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { isAuthenticated } from '../services/authService';

// HOC để bọc component với authentication check
const PrivateRoutes = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    // Lưu location hiện tại để redirect về sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Layout>{children}</Layout>;
};

export default PrivateRoutes;

