import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute; 