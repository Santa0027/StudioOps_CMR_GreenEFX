import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * A wrapper component that only renders its children if the user meets
 * the required permission criteria.
 * 
 * @param {string|string[]} roles - (Optional) Roles allowed to see this content.
 * @param {string} level - (Optional) Minimum authorization level ('admin', 'manager', 'artist').
 * @param {React.ReactNode} fallback - (Optional) Content to show if user is not authorized.
 */
const PermissionGate = ({ 
  children, 
  roles, 
  level, 
  fallback = null 
}) => {
  const { hasRole, isAuthorized } = usePermissions();

  let isAllowed = false;

  if (roles) {
    isAllowed = hasRole(roles);
  } else if (level) {
    isAllowed = isAuthorized(level);
  } else {
    // If neither roles nor level is provided, default to allowing if authenticated
    isAllowed = true; 
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
