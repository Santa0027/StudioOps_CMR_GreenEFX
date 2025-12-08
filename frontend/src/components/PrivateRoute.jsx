import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Optionally redirect to an unauthorized page or dashboard with an error
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard if not authorized
  }

  return <Outlet />;
};

export default PrivateRoute;
