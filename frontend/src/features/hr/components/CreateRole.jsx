import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([
    { id: 1, name: 'Alex Hartman', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 2, name: 'Ben Carter', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d951979?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ]);
  const [permissions, setPermissions] = useState({
    Dashboard: { View: false, Create: false, Edit: true, Delete: false, Manage: true },
    Users: { View: false, Create: true, Edit: true, Delete: false, Manage: true },
    'Projects / Tasks': { View: true, Create: true, Edit: false, Delete: false, Manage: false },
    'Finance & Billing': { View: true, Create: false, Edit: false, Delete: false, Manage: false },
  });

  const handlePermissionChange = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleRemoveUser = (userId) => {
    setAssignedUsers(assignedUsers.filter(user => user.id !== userId));
  };

  const handleSaveRole = () => {
    console.log({ roleName, description, assignedUsers, permissions });
    // Navigate back to permissions page or show success message
    navigate('/permissions');
  };

  const handleCancel = () => {
    navigate('/permissions');
  };

  const PermissionToggle = ({ isChecked, onToggle }) => (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
        isChecked ? 'bg-blue-500' : 'border border-gray-600'
      }`}
      onClick={onToggle}
    >
      {isChecked && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-6">
        <span className="text-gray-400">Admin / Roles & Permissions / </span>
        <span className="text-white font-semibold">Create Role</span>
      </div>
      <h1 className="text-4xl font-bold mb-8">Create Role</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Role Details</h2>
            <div className="mb-4">
              <label htmlFor="roleName" className="block text-gray-300 text-sm font-medium mb-2">
                Role Name
              </label>
              <input
                type="text"
                id="roleName"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="e.g., Art Director"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="A short description of the role's responsibilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Permissions</h2>
            <div className="grid grid-cols-5 text-gray-400 text-sm uppercase font-medium mb-4 ml-[120px]">
              <div>View</div>
              <div>Create</div>
              <div>Edit</div>
              <div>Delete</div>
              <div>Manage</div>
            </div>
            {Object.entries(permissions).map(([moduleName, actions]) => (
              <div key={moduleName} className="flex items-center mb-4 py-2 border-b border-gray-700 last:border-b-0">
                <div className="w-32 text-gray-300 font-medium">{moduleName}</div>
                <div className="flex-grow grid grid-cols-5 gap-4">
                  {Object.entries(actions).map(([actionName, isAllowed]) => (
                    <div key={actionName} className="flex justify-center">
                      <PermissionToggle
                        isChecked={isAllowed}
                        onToggle={() => handlePermissionChange(moduleName, actionName)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Assign Users</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Select users..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
            <div className="space-y-3">
              {assignedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                  <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                    <span className="text-white">{user.name}</span>
                  </div>
                  <button onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleSaveRole}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-semibold"
            >
              Save Role
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
