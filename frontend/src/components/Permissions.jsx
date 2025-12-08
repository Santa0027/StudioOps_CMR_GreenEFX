import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PermissionMatrixPreview from './PermissionMatrixPreview';

const Permissions = () => {
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { name: 'Art Director', description: 'Oversees and guides the artistic vision of projects.', users: 8, status: 'Active' },
    { name: '3D Animator', description: 'Creates and rigs 3D models and animations for vario...', users: 15, status: 'Active' },
    { name: 'Project Manager', description: 'Manages project timelines, resources, and client com...', users: 4, status: 'Active' },
    { name: 'Motion Graphics Artist', description: 'Designs and creates animated graphics and visual ef...', users: 12, status: 'Active' },
    { name: 'Intern', description: 'Limited access for training and assisting on minor tas...', users: 5, status: 'Inactive' },
  ];

  const handleViewPermissions = (roleName) => {
    setSelectedRole(roleName);
    setShowPermissionMatrix(true);
  };

  const handleClosePermissionMatrix = () => {
    setShowPermissionMatrix(false);
    setSelectedRole('');
  };

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
                Description
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Users
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{role.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{role.description}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{role.users}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      role.status === 'Active' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 opacity-50 rounded-full ${
                        role.status === 'Active' ? 'bg-green-200' : 'bg-red-200'
                      }`}
                    ></span>
                    <span className="relative">{role.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleViewPermissions(role.name)}
                      className="text-blue-400 hover:text-blue-600 mr-4 font-semibold"
                    >
                      View Permissions
                    </button>
                    <button className="text-gray-400 hover:text-blue-500 mr-3">
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
                    <button className="text-gray-400 hover:text-red-500">
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
            ))}
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
