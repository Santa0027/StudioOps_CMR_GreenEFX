import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, user, loading } = useAuth(); // Get loading state

  if (loading) {
    return <div>Loading...</div>; // Or a spinner, or null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access check removed
  // if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  //   // Optionally redirect to an unauthorized page or dashboard with an error
  //   return <Navigate to="/dashboard" replace />; // Redirect to dashboard if not authorized
  // }

  return <Outlet />;
};

export default PrivateRoute;
