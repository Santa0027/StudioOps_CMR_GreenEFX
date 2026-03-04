import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, X, UserPlus, CheckCircle2, Eye, Zap, ChevronRight } from 'lucide-react';
import { getPermissions, createRole } from '../../../shared/services/apiClient';
import { initialPermissionsStructure, parsePermissionName, permissionGroupIcons } from '../../../config/permissions.jsx';

const CreateRole = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(Object.keys(initialPermissionsStructure)[0]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getPermissions();
        setAllPermissions(response.data || []);
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

  const handleSelectGroupAll = (groupName, type) => {
    const groupConfig = initialPermissionsStructure[groupName];
    const codenames = groupConfig[type];
    const groupPermIds = allPermissions
      .filter(p => codenames.includes(p.codename))
      .map(p => p.id);
    
    const allSelected = groupPermIds.every(id => selectedPermissionIds.includes(id));
    
    if (allSelected) {
      setSelectedPermissionIds(prev => prev.filter(id => !groupPermIds.includes(id)));
    } else {
      setSelectedPermissionIds(prev => [...new Set([...prev, ...groupPermIds])]);
    }
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/permissions')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Define New Role</h1>
            <p className="text-slate-400 mt-1">Map functional capabilities to project lifecycle stages.</p>
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
            {submitting ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Col: Role Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider text-sm">Role Identity</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production Lead"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  Roles act as access templates. Changing permissions here will instantly affect all users assigned to this role.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  <span>Selection Summary</span>
                  <span className="text-blue-400">{selectedPermissionIds.length} Active</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (selectedPermissionIds.length / allPermissions.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Grouped Capabilities */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 scrollbar-hide">
              {Object.keys(initialPermissionsStructure).map(groupName => (
                <button
                  key={groupName}
                  onClick={() => setActiveTab(groupName)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === groupName 
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 font-medium'
                  }`}
                >
                  {permissionGroupIcons[groupName]}
                  <span className="text-sm">{groupName}</span>
                </button>
              ))}
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Visual Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Eye size={18} />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em]">Visual Access</h3>
                    </div>
                    <button 
                      onClick={() => handleSelectGroupAll(activeTab, 'visual')}
                      className="text-[10px] font-bold text-slate-500 hover:text-blue-400 uppercase transition-colors"
                    >
                      Toggle All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {initialPermissionsStructure[activeTab].visual.map(codename => {
                      const perm = allPermissions.find(p => p.codename === codename);
                      if (!perm) return null;
                      return (
                        <label 
                          key={perm.id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                            selectedPermissionIds.includes(perm.id)
                              ? 'bg-blue-500/10 border-blue-500/30'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.includes(perm.id)}
                              onChange={() => handlePermissionToggle(perm.id)}
                              className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm font-bold ${selectedPermissionIds.includes(perm.id) ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                              {codename.replace('view_', '').replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">READ ONLY</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Executional Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap size={18} />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em]">Executional Actions</h3>
                    </div>
                    <button 
                      onClick={() => handleSelectGroupAll(activeTab, 'executional')}
                      className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 uppercase transition-colors"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {initialPermissionsStructure[activeTab].executional.map(codename => {
                      const perm = allPermissions.find(p => p.codename === codename);
                      if (!perm) return null;
                      return (
                        <label 
                          key={perm.id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                            selectedPermissionIds.includes(perm.id)
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.includes(perm.id)}
                              onChange={() => handlePermissionToggle(perm.id)}
                              className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className={`text-sm font-bold ${selectedPermissionIds.includes(perm.id) ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                              {codename.split('_')[0]} {codename.split('_').slice(1).join(' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 tracking-tighter">ACTION</div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 border-dashed p-6 rounded-3xl flex items-center justify-center gap-4 text-slate-500">
            <CheckCircle2 size={24} className="opacity-20" />
            <p className="text-sm italic font-medium">Tip: Use the sidebar tabs to navigate through different project modules.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
