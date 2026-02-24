import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * A route guard component that checks for specific permission levels.
 * Redirects to dashboard if user is not authorized.
 */
const RoleBasedRoute = ({ level, roles }) => {
  const { isAuthorized, hasRole, user } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let allowed = false;
  if (roles) {
    allowed = hasRole(roles);
  } else if (level) {
    allowed = isAuthorized(level);
  } else {
    allowed = true;
  }

  if (!allowed) {
    console.warn(`Access denied for level: ${level || roles}. Redirecting to dashboard.`);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
