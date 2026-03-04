import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PermissionMatrixPreview from './PermissionMatrixPreview.jsx';
import { Shield, Plus, Search, Trash2, Edit3, Eye, Info } from 'lucide-react';

import { getRoles, deleteRole } from '../../../shared/services/apiClient';

const Permissions = () => {
  const navigate = useNavigate();
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError(err.response?.data?.detail || err.message || "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRole(roleId);
      fetchRoles();
    } catch (err) {
      console.error('Failed to delete role:', err);
      alert(err.response?.data?.detail || err.message || 'Failed to delete role.');
    }
  };

  const filteredRoles = roles.filter(role => {
    const isSystemRole = role.name.includes('_');
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
    return !isSystemRole && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-500" size={32} />
            Roles & Permissions
          </h1>
          <p className="text-slate-400 mt-1">Configure studio access levels and functional permissions.</p>
        </div>
        <Link
          to="/roles/create"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
        >
          <Plus size={20} />
          Create New Role
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search roles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
            <Shield className="mx-auto text-slate-700 mb-4 opacity-20" size={48} />
            <p className="text-slate-500 font-medium italic">No roles matching your search.</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div key={role.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                  <Shield size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => navigate('/permissions/matrix')}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
                <Info size={14} />
                {role.permissions?.length || 0} Functional Permissions
              </div>

              <button
                onClick={() => handleViewPermissions(role.name)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                View Permission Matrix
              </button>
            </div>
          ))
        )}
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
