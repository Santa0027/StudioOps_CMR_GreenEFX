import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if the current user has specific roles or permissions.
 * Currently uses Group-based checks as a proxy for permissions.
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const isStaff = user?.is_staff || false;
  
  // Role checks
  const isAdmin = user?.groups?.includes('Admin') || isStaff;
  const isManager = user?.groups?.includes('Manager') || isAdmin;
  const isArtist = user?.groups?.includes('Artist');
  
  /**
   * Checks if user has a specific role.
   * @param {string|string[]} roles - Single role or array of roles.
   */
  const hasRole = (roles) => {
    if (!user || !user.groups) return false;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some(role => user.groups.includes(role)) || isStaff;
  };

  /**
   * Checks if user is authorized based on a required permission level.
   * Levels: 'admin', 'manager', 'artist', 'any'
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
    user
  };
};
