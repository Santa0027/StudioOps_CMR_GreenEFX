import React, { useState, useEffect } from 'react';
import AddUserForm from '../components/AddUserForm';
import Attendance from '../../hr/components/Attendance';
import MonthlyAttendanceCalendar from '../../hr/components/MonthlyAttendanceCalendar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { getUsers, deleteUser } from '../../../shared/services/apiClient';

function UserManagement() {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [apiUsers, setApiUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setApiUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setShowAddUserForm(false);
    fetchUsers(); // Refresh the user list after adding a user
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);
      fetchUsers(); // Refresh the user list after deleting a user
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user. Please try again later.");
    }
  };

  const getStatusClasses = (isActive) => {
    return isActive ? 'text-green-500' : 'text-gray-500';
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <header className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button
          onClick={() => setShowAddUserForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition duration-200 ease-in-out"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add User
        </button>
      </header>

      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} px-4 py-2 rounded-md font-medium hover:bg-gray-600`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} px-4 py-2 rounded-md font-medium hover:bg-gray-600`}
        >
          Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('monthly-attendance')}
          className={`${activeTab === 'monthly-attendance' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} px-4 py-2 rounded-md font-medium hover:bg-gray-600`}
        >
          Monthly Attendance Calendar
        </button>
        <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 font-medium">Managers</button>
        <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 font-medium">Staff</button>
      </div>

      {loading && <div className="text-white">Loading users...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {activeTab === 'users' && !loading && !error && (
        <div className="overflow-x-auto bg-[#2a2a2a] rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {apiUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full mr-3" src={user.avatar || 'https://via.placeholder.com/30/808080/FFFFFF?text=U'} alt={`${user.name || user.email} avatar`} />
                      <span className="text-sm font-medium text-white">{user.name || user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(user.groups && user.groups.join(', ')) || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(user.is_active)}`}>
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/users/${user.id}`} className="text-gray-400 hover:text-white mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </Link>
                    <button className="text-gray-400 hover:text-white mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && <Attendance />}
      {activeTab === 'monthly-attendance' && <MonthlyAttendanceCalendar />}

      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <AddUserForm onClose={() => handleAddUser()} />
        </div>
      )}
    </div>
  );
}

export default UserManagement;