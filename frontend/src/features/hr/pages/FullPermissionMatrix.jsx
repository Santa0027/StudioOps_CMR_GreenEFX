import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, updateRole, createRole, deleteRole } from '../../../shared/services/apiClient';
import { initialPermissionsStructure, parsePermissionName } from '../../../config/permissions.jsx';
import { 
  Shield, Info, Check, X, Search, ChevronRight, LayoutGrid, 
  Plus, Trash2, Edit3, Save, AlertCircle, Loader2, Slash
} from 'lucide-react';

const FullPermissionMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // stores {roleId, module, action}
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState(Object.keys(initialPermissionsStructure)[0]);
  
  // Create Role State
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  // Edit Role State
  const [editingRole, setEditingRole] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      setRoles(rolesRes.data || []);
      setPermissions(permsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch matrix data:", err);
      setError("Failed to load permission data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPermissionObject = (moduleName, actionName) => {
    return permissions.find(p => {
      const parsed = parsePermissionName(p.name);
      return parsed.module === moduleName && parsed.action === actionName;
    });
  };

  const hasPermission = (role, moduleName, actionName) => {
    if (!role.permissions) return false;
    const permObj = getPermissionObject(moduleName, actionName);
    return permObj && role.permissions.includes(permObj.id);
  };

  const handleTogglePermission = async (role, moduleName, actionName) => {
    const permObj = getPermissionObject(moduleName, actionName);
    if (!permObj) {
      // This should not happen now with the UI check, but kept for safety
      return;
    }

    const isAllowed = role.permissions.includes(permObj.id);
    let newPerms = [];
    
    if (isAllowed) {
      newPerms = role.permissions.filter(id => id !== permObj.id);
    } else {
      newPerms = [...role.permissions, permObj.id];
    }

    setUpdating({ roleId: role.id, module: moduleName, action: actionName });
    try {
      await updateRole(role.id, { permissions: newPerms });
      // Update local state
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: newPerms } : r));
    } catch (err) {
      console.error("Failed to update permission:", err);
      alert("Failed to update permission. Make sure you have administrative rights.");
    } finally {
      setUpdating(null);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setLoading(true);
    try {
      await createRole({ name: newRoleName, permissions: [] });
      setNewRoleName('');
      setShowAddRole(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Users assigned to this role may lose access.`)) return;
    setLoading(true);
    try {
      await deleteRole(id);
      await fetchData();
    } catch (err) {
      alert("Failed to delete role.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (role) => {
    setEditingRole(role.id);
    setEditName(role.name);
  };

  const handleSaveName = async (roleId) => {
    if (!editName.trim()) return;
    try {
      await updateRole(roleId, { name: editName });
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: editName } : r));
      setEditingRole(null);
    } catch (err) {
      alert("Failed to update role name.");
    }
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && roles.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const modules = Object.keys(initialPermissionsStructure);
  const actions = ['View', 'Create', 'Edit', 'Delete', 'Manage'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-blue-500" size={32} />
            Permission Matrix
          </h1>
          <p className="text-slate-400 mt-1">Manage functional access and role identities across the studio.</p>
        </div>
        <div className="flex items-center gap-3">
           {showAddRole ? (
             <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                <input 
                  autoFocus
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Role Name..."
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button onClick={handleCreateRole} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                  <Check size={20} />
                </button>
                <button onClick={() => setShowAddRole(false)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                  <X size={20} />
                </button>
             </div>
           ) : (
            <button
              onClick={() => setShowAddRole(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              <Plus size={20} />
              Add New Role
            </button>
           )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Module Sidebar */}
        <div className="lg:w-64 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Functional Modules</div>
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setActiveModule(mod)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeModule === mod 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={activeModule === mod ? 'text-white' : 'text-slate-500'}>
                  {initialPermissionsStructure[mod].icon}
                </div>
                <span className="font-semibold text-sm">{mod}</span>
              </div>
              <ChevronRight size={16} className={activeModule === mod ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="flex-grow space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  {initialPermissionsStructure[activeModule].icon}
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider text-sm">{activeModule} Matrix</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Filter roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-950/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-950/50 backdrop-blur-md z-10 w-64">
                      Studio Role
                    </th>
                    {actions.map(action => (
                      <th key={action} className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {action}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRoles.map(role => (
                    <tr key={role.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-slate-900 group-hover:bg-slate-800/30 transition-colors z-10 border-r border-slate-800/50">
                        {editingRole === role.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full"
                            />
                            <button onClick={() => handleSaveName(role.id)} className="text-emerald-500 hover:text-emerald-400">
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs border border-slate-700">
                              {role.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{role.name}</span>
                          </div>
                        )}
                      </td>
                      {actions.map(action => {
                        const permObj = getPermissionObject(activeModule, action);
                        const allowed = hasPermission(role, activeModule, action);
                        const isUpdating = updating?.roleId === role.id && updating?.module === activeModule && updating?.action === action;
                        
                        return (
                          <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              {permObj ? (
                                <button
                                  onClick={() => handleTogglePermission(role, activeModule, action)}
                                  disabled={!!updating}
                                  className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                                    allowed 
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20' 
                                      : 'bg-slate-800/50 border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500'
                                  } disabled:opacity-50`}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="animate-spin" size={18} />
                                  ) : allowed ? (
                                    <Check size={20} strokeWidth={3} />
                                  ) : (
                                    <X size={20} />
                                  )}
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 text-slate-800 flex items-center justify-center cursor-not-allowed group/na" title="Capability not defined in system">
                                  <Slash size={16} />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStartEdit(role)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteRole(role.id, role.name)} className="p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-sm text-white font-bold">Interactive Matrix Guide</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                • <Check className="inline text-emerald-500" size={12}/> : Permission **Granted**. Click to revoke.<br/>
                • <X className="inline text-slate-700" size={12}/> : Permission **Denied**. Click to grant.<br/>
                • <Slash className="inline text-slate-800" size={12}/> : **Not Applicable**. This functional capability is not defined in the backend for this module.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPermissionMatrix;
