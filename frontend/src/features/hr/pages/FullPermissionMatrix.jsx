import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, updateRole, createRole, deleteRole } from '../../../shared/services/apiClient';
import { initialPermissionsStructure, parsePermissionName, permissionGroupIcons } from '../../../config/permissions.jsx';
import { 
  Shield, Info, Check, X, Search, ChevronRight, LayoutGrid, 
  Plus, Trash2, Edit3, Save, AlertCircle, Loader2, Slash,
  Eye, Zap, Lock, Unlock, Settings2
} from 'lucide-react';

const FullPermissionMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // stores {roleId, codename}
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(Object.keys(initialPermissionsStructure)[0]);
  const [showSystemRoles, setShowSystemRoles] = useState(false);
  
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

  const hasPermission = (role, codename) => {
    if (!role.permissions) return false;
    const permObj = permissions.find(p => p.codename === codename);
    return permObj && role.permissions.includes(permObj.id);
  };

  const handleTogglePermission = async (role, codename) => {
    const permObj = permissions.find(p => p.codename === codename);
    if (!permObj) return;

    const isAllowed = role.permissions.includes(permObj.id);
    let newPerms = [];
    
    if (isAllowed) {
      newPerms = role.permissions.filter(id => id !== permObj.id);
    } else {
      newPerms = [...role.permissions, permObj.id];
    }

    setUpdating({ roleId: role.id, codename });
    try {
      await updateRole(role.id, { permissions: newPerms });
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: newPerms } : r));
    } catch (err) {
      console.error("Failed to update permission:", err);
      alert("Failed to update permission.");
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
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
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

  const filteredRoles = roles.filter(r => {
    const isSystemRole = r.name.includes('_');
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (showSystemRoles) return matchesSearch;
    return !isSystemRole && matchesSearch;
  });

  if (loading && roles.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const groupConfig = initialPermissionsStructure[activeGroup];
  const visualPerms = groupConfig.visual;
  const executionalPerms = groupConfig.executional;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-500" size={32} />
            Permission Matrix
          </h1>
          <p className="text-slate-400 mt-1">Organize studio access by project lifecycle and executional capabilities.</p>
        </div>
        <div className="flex items-center gap-3">
           <button
              onClick={() => setShowSystemRoles(!showSystemRoles)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 border ${
                showSystemRoles 
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings2 size={18} />
              {showSystemRoles ? 'Hide System Roles' : 'Show System Roles'}
            </button>

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
        {/* Project Lifecycle Sidebar */}
        <div className="lg:w-72 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Project Lifecycle</div>
          {Object.keys(initialPermissionsStructure).map(groupName => (
            <button
              key={groupName}
              onClick={() => setActiveGroup(groupName)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                activeGroup === groupName 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={activeGroup === groupName ? 'text-white' : 'text-slate-500'}>
                  {permissionGroupIcons[groupName]}
                </div>
                <span className="font-bold text-sm">{groupName}</span>
              </div>
              <ChevronRight size={16} className={activeGroup === groupName ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="flex-grow space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner">
                  {permissionGroupIcons[activeGroup]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{activeGroup}</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Functional Access Control</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Filter studio roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 backdrop-blur-md">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-950 z-20 border-b border-slate-800 w-64">
                      Studio Role
                    </th>
                    
                    {/* Visual Permissions Header Group */}
                    <th colSpan={visualPerms.length} className="px-6 py-3 text-center text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border-b border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-center justify-center gap-2">
                        <Eye size={12} />
                        Visual Access
                      </div>
                    </th>

                    {/* Executional Permissions Header Group */}
                    <th colSpan={executionalPerms.length} className="px-6 py-3 text-center text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center justify-center gap-2">
                        <Zap size={12} />
                        Executional Actions
                      </div>
                    </th>

                    <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      Actions
                    </th>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <th className="sticky left-0 bg-slate-950 z-20 border-b border-slate-800"></th>
                    {/* Visual Columns */}
                    {visualPerms.map(codename => (
                      <th key={codename} className="px-4 py-3 text-center text-[9px] font-bold text-slate-500 uppercase border-b border-slate-800">
                        {codename.replace('view_', '').replace(/_/g, ' ')}
                      </th>
                    ))}
                    {/* Executional Columns */}
                    {executionalPerms.map(codename => (
                      <th key={codename} className="px-4 py-3 text-center text-[9px] font-bold text-slate-500 uppercase border-b border-slate-800">
                        {codename.split('_')[0]} {codename.split('_').slice(1).join(' ')}
                      </th>
                    ))}
                    <th className="border-b border-slate-800"></th>
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shadow-inner ${role.name.includes('_') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-gradient-to-br from-slate-800 to-slate-950 text-blue-400 border-slate-700'}`}>
                              {role.name.charAt(0)}
                            </div>
                            <span className={`font-bold ${role.name.includes('_') ? 'text-amber-500/70 italic text-xs' : 'text-white group-hover:text-blue-400'} transition-colors`}>{role.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Visual Toggles */}
                      {visualPerms.map(codename => {
                        const allowed = hasPermission(role, codename);
                        const isUpdating = updating?.roleId === role.id && updating?.codename === codename;
                        const permExists = permissions.some(p => p.codename === codename);

                        return (
                          <td key={codename} className="px-4 py-4 whitespace-nowrap text-center bg-blue-500/[0.02]">
                            <div className="flex justify-center">
                              {permExists ? (
                                <button
                                  onClick={() => handleTogglePermission(role, codename)}
                                  disabled={!!updating}
                                  className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border-2 ${
                                    allowed 
                                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10' 
                                      : 'bg-slate-800/50 border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500'
                                  } disabled:opacity-50 hover:scale-110`}
                                >
                                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : allowed ? <Eye size={18} /> : <X size={18} />}
                                </button>
                              ) : <Slash size={14} className="text-slate-800" />}
                            </div>
                          </td>
                        );
                      })}

                      {/* Executional Toggles */}
                      {executionalPerms.map(codename => {
                        const allowed = hasPermission(role, codename);
                        const isUpdating = updating?.roleId === role.id && updating?.codename === codename;
                        const permExists = permissions.some(p => p.codename === codename);

                        return (
                          <td key={codename} className="px-4 py-4 whitespace-nowrap text-center bg-emerald-500/[0.02]">
                            <div className="flex justify-center">
                              {permExists ? (
                                <button
                                  onClick={() => handleTogglePermission(role, codename)}
                                  disabled={!!updating}
                                  className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border-2 ${
                                    allowed 
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                                      : 'bg-slate-800/50 border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500'
                                  } disabled:opacity-50 hover:scale-110`}
                                >
                                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : allowed ? <Zap size={18} /> : <X size={18} />}
                                </button>
                              ) : <Slash size={14} className="text-slate-800" />}
                            </div>
                          </td>
                        );
                      })}

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingRole(role.id); setEditName(role.name); }} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
              <Eye className="text-blue-400 shrink-0" size={24} />
              <div>
                <p className="text-sm text-white font-bold mb-1">Visual Permission Group</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Controls page visibility and sidebar navigation. Revoking these prevents the user from even seeing the module.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
              <Zap className="text-emerald-400 shrink-0" size={24} />
              <div>
                <p className="text-sm text-white font-bold mb-1">Executional Permission Group</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Controls data manipulation (Create, Edit, Delete). Users might see the page but won't be able to trigger these actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPermissionMatrix;
