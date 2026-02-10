import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PermissionMatrixPreview from './PermissionMatrixPreview.jsx';

import { getRoles, deleteRole } from '../../../shared/services/apiClient';

const Permissions = () => {
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getRoles();
        console.log('Roles API response:', response.data); // Debug log
        setRoles(response.data || []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        console.error("Error response:", err.response); // Debug log
        setError(err.response?.data?.detail || err.message || "Failed to load roles.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleViewPermissions = (roleName) => {
    setSelectedRole(roleName);
    setShowPermissionMatrix(true);
  };

  const handleClosePermissionMatrix = () => {
    setShowPermissionMatrix(false);
    setSelectedRole('');
  };

  const handleEditRole = (roleId) => {
    // Navigate to edit role page or open edit modal
    window.location.href = `/roles/edit/${roleId}`;
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRole(roleId);
      // Refresh roles list
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (err) {
      console.error('Failed to delete role:', err);
      alert(err.response?.data?.detail || err.message || 'Failed to delete role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Roles</h3>
          <p className="text-red-300">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-2">Roles & Permissions</h1>
      <p className="text-gray-400 mb-6">Manage roles and their permissions across the studio.</p>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search by role name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <Link
          to="/roles/create"
          className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add New Role
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Permissions Count
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-5 py-5 border-b border-gray-700 text-center text-gray-400">
                  No roles found. Create a new role to get started.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-700">
                  <td className="px-5 py-5 border-b border-gray-700 text-sm">
                    <p className="text-white whitespace-no-wrap">{role.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-700 text-sm">
                    <p className="text-white whitespace-no-wrap">
                      {role.permissions ? role.permissions.length : 0} permissions
                    </p>
                  </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleViewPermissions(role.name)}
                      className="text-blue-400 hover:text-blue-600 mr-4 font-semibold"
                    >
                      View Permissions
                    </button>
                    <button onClick={() => handleEditRole(role.id)} className="text-gray-400 hover:text-blue-500 mr-3">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteRole(role.id, role.name)} className="text-gray-400 hover:text-red-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPermissionMatrix && (
        <PermissionMatrixPreview
          roleName={selectedRole}
          onClose={handleClosePermissionMatrix}
        />
      )}
    </div>
  );
};

export default Permissions;
