import React, { useState, useEffect } from 'react';
import { createUser, getRoles } from '../../../shared/services/apiClient';

const AddUserForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    is_staff: true,
    is_active: true,
    group_ids: [],
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'group_ids') {
      const roleId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        group_ids: checked 
          ? [...prev.group_ids, roleId]
          : prev.group_ids.filter(id => id !== roleId)
      }));
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createUser(formData);
      setSuccess('User created successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to create user:", err);
      const errorMessage = err.response?.data?.detail || 
                          (err.response?.data && Object.values(err.response.data)[0]) ||
                          'Failed to create user. Please try again.';
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-1";

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Add New User</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              placeholder="john@studioops.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className={labelClasses}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Assign Roles / Groups</label>
          <div className="grid grid-cols-2 gap-2 mt-2 p-4 bg-slate-900 rounded-xl border border-slate-700">
            {loadingRoles ? (
              <p className="text-slate-500 text-xs animate-pulse">Loading roles...</p>
            ) : (
              roles.map(role => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="group_ids"
                    value={role.id}
                    checked={formData.group_ids.includes(role.id)}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{role.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              name="is_staff"
              checked={formData.is_staff}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Is Staff</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Is Active</span>
          </label>
        </div>

        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating...
              </>
            ) : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
