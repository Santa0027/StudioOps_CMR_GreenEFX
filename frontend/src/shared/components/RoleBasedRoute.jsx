import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * A route guard component that checks for specific permission levels or granular permissions.
 * Redirects to dashboard if user is not authorized.
 */
const RoleBasedRoute = ({ level, roles, requiredPermission }) => {
  const { isAuthorized, hasRole, can, user } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let allowed = false;

  if (requiredPermission) {
    // Priority 1: Check for specific granular permission (e.g., 'sales.view_enquiry')
    allowed = can(requiredPermission);
  } else if (roles) {
    // Priority 2: Check for specific group roles
    allowed = hasRole(roles);
  } else if (level) {
    // Priority 3: Check for legacy levels (admin, manager, artist)
    allowed = isAuthorized(level);
  } else {
    // Default: Allow if authenticated
    allowed = true;
  }

  if (!allowed) {
    console.warn(`Access denied. Missing permission: ${requiredPermission || level || roles}. Redirecting to dashboard.`);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
