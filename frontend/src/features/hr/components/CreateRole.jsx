import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { getPermissions, createRole, getUsers } from '../../../shared/services/apiClient';

const CreateRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getPermissions();
        setAllPermissions(response.data);
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        setError("Failed to load permissions list.");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handlePermissionToggle = (permId) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name.");
      return;
    }

    setSubmitting(true);
    try {
      await createRole({
        name: roleName,
        permissions: selectedPermissionIds
      });
      alert("Role created successfully!");
      navigate('/permissions');
    } catch (err) {
      console.error("Failed to create role:", err);
      setError(err.response?.data?.detail || "Failed to create role.");
    } finally {
      setSubmitting(false);
    }
  };

  // Group permissions by content type or module if possible
  // For now, we'll just show them in a grid
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/permissions')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create New Role</h1>
            <p className="text-slate-400 mt-1">Define access levels and functional capabilities.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/permissions')}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveRole}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield size={18} className="text-blue-500" />
              Role Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Role Identity</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Editor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                The role name will be used to categorize team members and apply shared security policies.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Select Capabilities
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {selectedPermissionIds.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {allPermissions.map((perm) => (
                <label 
                  key={perm.id} 
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedPermissionIds.includes(perm.id)
                      ? 'bg-blue-600/10 border-blue-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissionIds.includes(perm.id)}
                    onChange={() => handlePermissionToggle(perm.id)}
                    className="mt-1 h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className={`text-sm font-bold transition-colors ${
                      selectedPermissionIds.includes(perm.id) ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {perm.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{perm.codename}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
