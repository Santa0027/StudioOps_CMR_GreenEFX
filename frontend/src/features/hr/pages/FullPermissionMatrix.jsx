import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, updateRole, createRole, deleteRole } from '../../../shared/services/apiClient';
import { initialPermissionsStructure, permissionGroupIcons } from '../../../config/permissions.jsx';
import { 
  Shield, Info, Check, X, Search, ChevronRight, LayoutGrid, 
  Plus, Trash2, Edit3, Save, AlertCircle, Loader2, Slash,
  Eye, Zap, Settings2
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
  
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
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

  const hasPermission = (role, appLabel, modelCodename, action) => {
    if (!role.permissions) return false;
    const fullCodename = `${action}_${modelCodename}`;
    const permObj = permissions.find(p => p.codename === fullCodename && p.content_type_app_label === appLabel);
    return permObj && role.permissions.includes(permObj.id);
  };

  const handleTogglePermission = async (role, appLabel, modelCodename, action) => {
    const fullCodename = `${action}_${modelCodename}`;
    const permObj = permissions.find(p => p.codename === fullCodename && p.content_type_app_label === appLabel);
    if (!permObj) return;

    const isAllowed = role.permissions.includes(permObj.id);
    let newPerms = isAllowed 
      ? role.permissions.filter(id => id !== permObj.id)
      : [...role.permissions, permObj.id];

    setUpdating({ roleId: role.id, codename: fullCodename });
    try {
      await updateRole(role.id, { permissions: newPerms });
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: newPerms } : r));
    } catch (err) {
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
      alert("Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(r => {
    const isSystemRole = r.name.includes('_');
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return showSystemRoles ? matchesSearch : (!isSystemRole && matchesSearch);
  });

  if (loading && roles.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const groupConfig = initialPermissionsStructure[activeGroup];
  const actions = [
    { key: 'view', label: 'View', icon: <Eye size={14} />, color: 'text-blue-400' },
    { key: 'add', label: 'Create', icon: <Plus size={14} />, color: 'text-emerald-400' },
    { key: 'change', label: 'Edit', icon: <Edit3 size={14} />, color: 'text-amber-400' },
    { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-500" size={32} />
            Permission Matrix
          </h1>
          <p className="text-slate-400 mt-1">Direct Model-to-UI access control for all studio modules.</p>
        </div>
        <div className="flex items-center gap-3">
           <button
              onClick={() => setShowSystemRoles(!showSystemRoles)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 border ${
                showSystemRoles ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Settings2 size={18} />
              {showSystemRoles ? 'Hide System Roles' : 'Show System Roles'}
            </button>
            <button
              onClick={() => setShowAddRole(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
            >
              <Plus size={20} />
              Add Role
            </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-72 space-y-2">
          {Object.keys(initialPermissionsStructure).map(groupName => (
            <button
              key={groupName}
              onClick={() => setActiveGroup(groupName)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                activeGroup === groupName ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {permissionGroupIcons[groupName]}
                <span className="font-bold text-sm">{groupName}</span>
              </div>
              <ChevronRight size={16} className={activeGroup === groupName ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Matrix */}
        <div className="flex-grow space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">{activeGroup} Models</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Filter roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950/80">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-950 z-20 w-64">
                      Role / Model
                    </th>
                    {groupConfig.models.map(model => (
                      <th key={model.codename} colSpan={4} className="px-4 py-3 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest border-l border-slate-800 bg-slate-800/20">
                        {model.name}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-950/40">
                    <th className="sticky left-0 bg-slate-950 z-20 border-b border-slate-800"></th>
                    {groupConfig.models.map(model => (
                      <React.Fragment key={model.codename}>
                        {actions.map(action => (
                          <th key={action.key} className="px-2 py-2 text-center text-[8px] font-bold text-slate-500 uppercase border-b border-slate-800 border-l border-slate-800/30">
                            {action.label}
                          </th>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRoles.map(role => (
                    <tr key={role.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-slate-900 z-10 border-r border-slate-800/50">
                        <span className="font-bold text-white">{role.name}</span>
                      </td>
                      {groupConfig.models.map(model => (
                        <React.Fragment key={model.codename}>
                          {actions.map(action => {
                            const allowed = hasPermission(role, model.app, model.codename, action.key);
                            const isUpdating = updating?.roleId === role.id && updating?.codename === `${action.key}_${model.codename}`;
                            
                            return (
                              <td key={action.key} className="px-2 py-4 whitespace-nowrap text-center border-l border-slate-800/30">
                                <button
                                  onClick={() => handleTogglePermission(role, model.app, model.codename, action.key)}
                                  disabled={!!updating}
                                  className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${
                                    allowed 
                                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                      : 'bg-slate-800/50 border-slate-800 text-slate-700 hover:text-slate-500'
                                  }`}
                                >
                                  {isUpdating ? <Loader2 className="animate-spin" size={12} /> : allowed ? action.icon : <X size={12} />}
                                </button>
                              </td>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex items-center gap-4">
            <Info className="text-blue-400" size={20} />
            <p className="text-xs text-slate-400 italic">
              Note: The **View** permission for a primary model directly controls if that module appears in the user's sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPermissionMatrix;
