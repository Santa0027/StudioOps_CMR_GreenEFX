import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if the current user has specific roles or permissions.
 * Leverages granular permissions from the JWT token.
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const isStaff = user?.is_staff || false;
  const userPermissions = user?.user_permissions || [];
  
  /**
   * Checks if user has a specific granular permission.
   * Format: 'app_label.codename' (e.g., 'hr_payroll.view_employee')
   * Made case-insensitive to ensure reliability.
   */
  const can = (permission) => {
    if (isStaff) return true; // Staff/Superusers bypass granular checks
    if (!userPermissions || userPermissions.length === 0) return false;
    
    return userPermissions.some(p => p.toLowerCase() === permission.toLowerCase());
  };

  // Role checks (computed from groups or permissions)
  const isAdmin = user?.groups?.includes('Admin') || isStaff;
  const isManager = user?.groups?.includes('Manager') || isAdmin;
  const isArtist = user?.groups?.includes('Artist');
  
  /**
   * Checks if user has a specific role.
   */
  const hasRole = (roles) => {
    if (!user || !user.groups) return false;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some(role => user.groups.includes(role)) || isStaff;
  };

  /**
   * Checks if user is authorized based on a required permission level.
   */
  const isAuthorized = (level) => {
    switch (level) {
      case 'admin': return isAdmin;
      case 'manager': return isManager;
      case 'artist': return isArtist || isManager;
      case 'any': return !!user;
      default: return false;
    }
  };

  return {
    isStaff,
    isAdmin,
    isManager,
    isArtist,
    hasRole,
    isAuthorized,
    can,
    user
  };
};
