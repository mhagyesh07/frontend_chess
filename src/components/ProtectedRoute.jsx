import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'loading:', loading);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600">
        <div className="text-white text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/welcome" replace />;
};

export default ProtectedRoute;