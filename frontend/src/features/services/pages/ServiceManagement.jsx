import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, FolderTree, 
  DollarSign, Search, Settings, FileText
} from 'lucide-react';
import ServiceForm from '../components/ServiceForm.jsx';
import { getServices, deleteService, getFolderStructureTemplates } from '../../../shared/services/apiClient';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [folderTemplates, setFolderTemplates] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, folderRes] = await Promise.all([
        getServices(),
        getFolderStructureTemplates()
      ]);
      setServices(serviceRes.data);
      setFolderTemplates(folderRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete service.");
    }
  };

  const handleSave = (savedService) => {
    if (editingServiceId) {
      setServices(prev => prev.map(s => s.id === savedService.id ? savedService : s));
    } else {
      setServices(prev => [...prev, savedService]);
    }
    setShowForm(false);
    setEditingServiceId(null);
  };

  const startEdit = (id) => {
    setEditingServiceId(id);
    setShowForm(true);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && services.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Service Catalog</h1>
          <p className="text-slate-400 mt-2 text-lg">Define your offerings and map them to production folder structures.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingServiceId(null); }}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
            showForm 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus size={20} /> Add New Service</>}
        </button>
      </div>

      {/* Stats */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <p className="text-slate-400 text-sm font-medium">Active Services</p>
            <p className="text-3xl font-bold text-white mt-1">{services.length}</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <p className="text-slate-400 text-sm font-medium">Mapped to NAS Folders</p>
            <p className="text-3xl font-bold text-purple-400 mt-1">
              {services.filter(s => s.folder_structure_template).length}
            </p>
          </div>
        </div>
      )}

      {/* Form Area */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="text-blue-500" size={20} />
              {editingServiceId ? 'Edit Service Configuration' : 'Configure New Service'}
            </h2>
            <ServiceForm 
              serviceId={editingServiceId} 
              onSave={handleSave} 
              onCancel={() => { setShowForm(false); setEditingServiceId(null); }} 
            />
          </div>
        </div>
      )}

      {/* List Area */}
      {!showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <h2 className="text-lg font-bold">Service List</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search services..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Service Details</th>
                  <th className="px-6 py-4">NAS Mapping</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredServices.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-16 text-slate-500 italic">No services found.</td></tr>
                ) : (
                  filteredServices.map((service) => {
                    const folder = folderTemplates.find(t => t.id === service.folder_structure_template);
                    
                    return (
                      <tr key={service.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {service.name}
                          </div>
                          <div className="text-sm text-slate-400 max-w-xs truncate mt-0.5">
                            {service.description || 'No description provided.'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs">
                            <FolderTree size={14} className={service.folder_structure_template ? 'text-purple-500' : 'text-slate-600'} />
                            <span className={service.folder_structure_template ? 'text-slate-200' : 'text-slate-500'}>
                              {service.folder_structure_template_name || 'No Folders'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-white font-mono font-bold">
                            <DollarSign size={14} className="text-slate-500" />
                            {service.base_price ? parseFloat(service.base_price).toFixed(2) : '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => startEdit(service.id)} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                              title="Edit Configuration"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(service.id)} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Service"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
