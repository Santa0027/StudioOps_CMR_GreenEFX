import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Users, Building2, 
  CheckCircle, Pause, Archive, Search, LayoutGrid, List, ExternalLink
} from 'lucide-react';
import AddClientForm from '../components/AddClientForm';
import EditClientForm from '../components/EditClientForm';
import { getClients, deleteClient } from '../../../shared/services/apiClient';

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20", icon: CheckCircle },
  { value: "On Hold", label: "On Hold", color: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20", icon: Pause },
  { value: "Archived", label: "Archived", color: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20", icon: Archive },
];

function ClientManagement() {
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditClientForm, setShowEditClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }
    try {
      await deleteClient(id);
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client:", err);
      alert("Failed to delete client. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusObj.color}`}>
        <statusObj.icon size={12} />
        {statusObj.label}
      </span>
    );
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-red-400 text-lg">Error loading clients</p>
        <p className="text-slate-500 text-sm mt-2">{error.message}</p>
        <button onClick={fetchClients} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Management</h1>
          <p className="text-slate-400 mt-2 text-lg">Manage your client relationships and partnerships.</p>
        </div>
        <button
          onClick={() => setShowAddClientForm(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
        >
          <Plus size={20} />
          Add New Client
        </button>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-white mt-1">{clients.length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Clients</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{clients.filter(c => c.status === 'Active').length}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">On Hold</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{clients.filter(c => c.status === 'On Hold').length}</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Pause size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Archived</p>
              <p className="text-3xl font-bold text-slate-400 mt-1">{clients.filter(c => c.status === 'Archived').length}</p>
            </div>
            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-500">
              <Archive size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-600 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Clients Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 group hover:shadow-xl hover:shadow-slate-900/50"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt={`${client.client_name} logo`} className="object-cover w-full h-full" />
                      ) : (
                        <Building2 size={24} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{client.client_name}</h3>
                      {client.website && (
                        <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors">
                          {client.website}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Primary Contact</p>
                    <p className="text-slate-200 font-medium">{client.contact_person || 'Not specified'}</p>
                  </div>
                  {client.email && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-slate-300 text-sm">{client.email}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                  {getStatusBadge(client.status)}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setShowEditClientForm(true);
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                      title="Edit Client"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Client Card */}
          <div
            onClick={() => setShowAddClientForm(true)}
            className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] text-slate-400 hover:border-blue-500/50 hover:text-blue-400 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
              <Plus size={28} className="group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-base font-semibold">Add New Client</p>
            <p className="text-sm text-slate-500 mt-1">Click to create a new client</p>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredClients.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-16 text-slate-500 italic">No clients found.</td></tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {client.logo_url ? (
                              <img src={client.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Building2 size={18} className="text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{client.client_name}</div>
                            {client.website && (
                              <div className="text-sm text-slate-500">{client.website}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{client.contact_person || '-'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{client.email || '-'}</td>
                      <td className="px-6 py-4">{getStatusBadge(client.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setEditingClient(client);
                              setShowEditClientForm(true);
                            }}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" 
                            title="Edit Client"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id)} 
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" 
                            title="Delete Client"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <AddClientForm onClose={() => setShowAddClientForm(false)} onAddSuccess={fetchClients} />
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditClientForm && editingClient && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <EditClientForm
              client={editingClient}
              onClose={() => {
                setShowEditClientForm(false);
                setEditingClient(null);
              }}
              onEditSuccess={fetchClients}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientManagement;
