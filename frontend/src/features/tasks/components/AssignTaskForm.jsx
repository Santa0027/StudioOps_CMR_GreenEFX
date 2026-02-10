import React, { useState, useEffect } from 'react';
import { getEmployees, createTaskAssignment } from '../../../shared/services/apiClient';

const AssignTaskForm = ({ onClose, task }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersRes = await getEmployees();
        setUsers(usersRes.data);
      } catch (err) {
        setErrorUsers('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!task || !selectedUser || !role) {
      setError('Please select a user and provide a role.');
      return;
    }

    const assignmentData = {
      user: selectedUser,
      role: role,
    };

    try {
      await createTaskAssignment(task.id, assignmentData);
      setSuccess('Task assigned successfully!');
      setTimeout(() => {
        onClose(); // Close the modal on success
      }, 1000);
    } catch (err) {
      setError('Failed to assign task.');
      console.error(err);
    }
  };

  if (loadingUsers) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-white">
        <p>Loading users...</p>
      </div>
    );
  }

  if (errorUsers) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-white">
        <p className="text-red-500">{errorUsers}</p>
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-white">
        <h2 className="text-2xl font-semibold mb-4">Assign Task</h2>
        <p className="text-lg mb-4">Task: <span className="font-bold">{task.element_name}</span></p>
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-500 text-white p-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userSelect" className="block text-white text-sm font-bold mb-2">Select User:</label>
            <select
              id="userSelect"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">-- Select a User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-white text-sm font-bold mb-2">Role:</label>
            <input
              type="text"
              id="role"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Animator, Rigger"
              required
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskForm;
