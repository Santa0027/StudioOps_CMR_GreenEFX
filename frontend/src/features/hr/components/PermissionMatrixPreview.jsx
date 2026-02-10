import React, { useEffect, useState } from 'react';
import { initialPermissionsStructure, parsePermissionName } from '../../../config/permissions.jsx';
import { getRoles, getPermissions } from '../../../shared/services/apiClient';

const PermissionMatrixPreview = ({ roleName, onClose }) => {
  const [permissionsMatrix, setPermissionsMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all roles
        const rolesResponse = await getRoles();
        const rolesData = rolesResponse.data;

        // Find the specific role by name
        const currentRole = rolesData.find(role => role.name === roleName);
        if (!currentRole) {
          throw new Error(`Role "${roleName}" not found.`);
        }

        // Fetch all permissions
        const permissionsResponse = await getPermissions();
        const allPermissionsData = permissionsResponse.data;

        // Map permission IDs to their full objects for quick lookup
        const permissionIdToObjectMap = new Map(allPermissionsData.map(p => [p.id, p]));

        // Get allowed permission names for the current role
        const allowedPermissionNames = currentRole.permissions
          .map(permId => permissionIdToObjectMap.get(permId))
          .filter(Boolean) // Filter out any undefined if a permId is not found
          .map(perm => perm.name);

        // Create a deep copy of the structure but preserve the icon references
        const updatedPermissionsMatrix = {};
        Object.keys(initialPermissionsStructure).forEach(moduleName => {
          updatedPermissionsMatrix[moduleName] = {
            icon: initialPermissionsStructure[moduleName].icon, // Preserve the React element
            actions: { ...initialPermissionsStructure[moduleName].actions }
          };
        });

        // Populate the matrix based on allowed permissions
        allowedPermissionNames.forEach(permName => {
          const { module, action } = parsePermissionName(permName);
          if (updatedPermissionsMatrix[module] && updatedPermissionsMatrix[module].actions[action] !== undefined) {
            updatedPermissionsMatrix[module].actions[action] = true;
          }
        });
        setPermissionsMatrix(updatedPermissionsMatrix);

      } catch (err) {
        console.error('Permission Matrix Error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    if (roleName) {
      fetchPermissions();
    } else {
      setPermissionsMatrix(initialPermissionsStructure); // Reset if no roleName
      setLoading(false);
    }
  }, [roleName]); // Re-run effect if roleName changes

  const ActionToggle = ({ isChecked }) => (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isChecked ? 'bg-cyan-500' : 'border border-gray-600'}`}>
      {isChecked && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="text-white text-xl">Loading permissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-red-800 p-8 rounded-lg shadow-xl text-white">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-4xl font-bold text-white mb-2">Permission Matrix Preview</h2>
        <p className="text-xl text-gray-400 mb-8">Viewing permissions for: <span className="text-white">{roleName}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(permissionsMatrix).map(([moduleName, data]) => (
            <div key={moduleName} className="bg-[#2a2a2a] p-5 rounded-lg border border-gray-700">
              <div className="flex items-center text-cyan-400 mb-4">
                {data.icon}
                <h3 className="text-lg font-semibold ml-2">{moduleName}</h3>
              </div>
              <ul className="space-y-3">
                {Object.entries(data.actions).map(([actionName, isAllowed]) => (
                  <li key={actionName} className="flex justify-between items-center text-gray-300">
                    <span>{actionName}</span>
                    <ActionToggle isChecked={isAllowed} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-600 transition-colors duration-200 text-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrixPreview;