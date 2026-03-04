import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Save, X, UserPlus, CheckCircle2, Eye, Zap, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { getPermissions, createRole, getRole, updateRole } from '../../../shared/services/apiClient';
import { initialPermissionsStructure, permissionGroupIcons } from '../../../config/permissions.jsx';

const CreateRole = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isEditMode = !!roleId;

  const [roleName, setRoleName] = useState('');
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(Object.keys(initialPermissionsStructure)[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const permsRes = await getPermissions();
        // DEBUG LOGGING
        console.log("CreateRole: Loaded Permissions:", permsRes.data);
        if (permsRes.data && permsRes.data.length > 0) {
            console.log("CreateRole: Sample Permission:", permsRes.data[0]);
        } else {
            console.warn("CreateRole: No permissions loaded!");
        }

        setAllPermissions(permsRes.data || []);

        if (isEditMode) {
          const roleRes = await getRole(roleId);
          setRoleName(roleRes.data.name);
          setSelectedPermissionIds(roleRes.data.permissions || []);
        }
      } catch (err) {
        console.error("Failed to fetch role data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId, isEditMode]);

  const handlePermissionToggle = (appLabel, modelCodename, action) => {
    const fullCodename = `${action}_${modelCodename}`;
    console.log(`Toggling: ${appLabel}.${fullCodename}`);
    
    // Case-insensitive check
    const perm = allPermissions.find(p => 
      p.codename === fullCodename && 
      p.content_type_app_label &&
      p.content_type_app_label.toLowerCase() === appLabel.toLowerCase()
    );
    
    if (!perm) {
      console.error(`Permission NOT FOUND: ${appLabel}.${fullCodename}`);
      return;
    }

    console.log(`Found Perm ID: ${perm.id}. Current selected count: ${selectedPermissionIds.length}`);

    setSelectedPermissionIds(prev => {
      const isSelected = prev.includes(perm.id);
      const next = isSelected 
        ? prev.filter(id => id !== perm.id) 
        : [...prev, perm.id];
      console.log(`Next selected count: ${next.length}`);
      return next;
    });
  };

  const handleSelectGroupAll = (groupName) => {
    const models = initialPermissionsStructure[groupName].models;
    const actions = ['view', 'add', 'change', 'delete'];
    
    const groupPermIds = allPermissions
      .filter(p => {
        return models.some(m => 
          p.content_type_app_label &&
          p.content_type_app_label.toLowerCase() === m.app.toLowerCase() && 
          actions.some(a => p.codename === `${a}_${m.codename}`)
        );
      })
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
      if (isEditMode) {
        await updateRole(roleId, {
          name: roleName,
          permissions: selectedPermissionIds
        });
        alert("Role updated successfully!");
      } else {
        await createRole({
          name: roleName,
          permissions: selectedPermissionIds
        });
        alert("Role created successfully!");
      }
      navigate('/permissions');
    } catch (err) {
      alert("Failed to save role.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/permissions')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{isEditMode ? 'Edit Role' : 'Create Role'}</h1>
            <p className="text-slate-400 mt-1">Select functional capabilities and submit to save.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/permissions')} className="px-6 py-2.5 rounded-xl font-bold text-slate-400">Cancel</button>
          <button
            onClick={handleSaveRole}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Role Name */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl sticky top-6">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Role Name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Lead Editor"
            />
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                <span>Selected Permissions</span>
                <span className="text-blue-400">{selectedPermissionIds.length}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (selectedPermissionIds.length / allPermissions.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Permission Selection */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50">
              {Object.keys(initialPermissionsStructure).map(groupName => (
                <button
                  key={groupName}
                  onClick={() => setActiveTab(groupName)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === groupName ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {permissionGroupIcons[groupName]}
                  <span className="text-sm font-bold">{groupName}</span>
                </button>
              ))}
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {permissionGroupIcons[activeTab]}
                  {activeTab} Permissions
                </h3>
                <button 
                  onClick={() => handleSelectGroupAll(activeTab)}
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider"
                >
                  Toggle Module All
                </button>
              </div>

              <div className="space-y-10">
                {initialPermissionsStructure[activeTab].models.map(model => (
                  <div key={model.codename} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-8 bg-blue-500/30 rounded-full" />
                      <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest">{model.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {['view', 'add', 'change', 'delete'].map(action => {
                        const fullCodename = `${action}_${model.codename}`;
                        // Make appLabel check case-insensitive
                        const perm = allPermissions.find(p => 
                            p.codename === fullCodename && 
                            p.content_type_app_label && // Ensure property exists
                            p.content_type_app_label.toLowerCase() === model.app.toLowerCase()
                        );
                        
                        // If perm is not found, don't render anything to avoid confusion
                        if (!perm) return null;

                        const isSelected = selectedPermissionIds.includes(perm.id);
                        
                        return (
                          <label 
                            key={action}
                            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePermissionToggle(model.app, model.codename, action)}
                              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold uppercase">{action === 'change' ? 'Edit' : action === 'add' ? 'Create' : action}</span>
                              <span className="text-[10px] opacity-50 font-medium">Can {action} {model.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
