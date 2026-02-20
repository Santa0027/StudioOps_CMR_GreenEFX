import React, { useEffect, useState } from 'react';
import { 
  createService, 
  getService, 
  updateService, 
  getFolderStructureTemplates 
} from '../../../shared/services/apiClient';
import { Save, X, FolderTree, DollarSign, FileText } from 'lucide-react';

const ServiceForm = ({ serviceId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        folder_structure_template: '',
    });
    const [folderTemplates, setFolderTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTemplates();
        if (serviceId) {
            fetchService(serviceId);
        }
    }, [serviceId]);

    const fetchTemplates = async () => {
        try {
            const folderRes = await getFolderStructureTemplates();
            setFolderTemplates(folderRes.data);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    };

    const fetchService = async (id) => {
        try {
            setLoading(true);
            const response = await getService(id);
            const data = response.data;
            setFormData({
                name: data.name || '',
                description: data.description || '',
                base_price: data.base_price || '',
                folder_structure_template: data.folder_structure_template || '',
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch service details.');
            console.error('Error fetching service:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const dataToSave = {
                ...formData,
                base_price: formData.base_price === '' ? null : parseFloat(formData.base_price),
                folder_structure_template: formData.folder_structure_template === '' ? null : parseInt(formData.folder_structure_template),
            };

            if (serviceId) {
                const res = await updateService(serviceId, dataToSave);
                onSave(res.data);
            } else {
                const res = await createService(dataToSave);
                onSave(res.data);
            }
        } catch (err) {
            setError('Failed to save service.');
            console.error('Error saving service:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !serviceId) return <div className="text-white text-center p-8">Loading form...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Service Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        required
                        placeholder="e.g. Video Editing"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                        placeholder="Describe what this service involves..."
                    />
                </div>

                <div>
                    <label htmlFor="base_price" className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <DollarSign size={16} /> Base Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input
                            type="number"
                            id="base_price"
                            name="base_price"
                            value={formData.base_price}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="folder_structure_template" className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <FolderTree size={16} /> Default Folder Structure (NAS)
                    </label>
                    <select
                        id="folder_structure_template"
                        name="folder_structure_template"
                        value={formData.folder_structure_template}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                        <option value="">None (Manual Folder)</option>
                        {folderTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-slate-400 hover:bg-slate-800 transition-all"
                    disabled={loading}
                >
                    <X size={18} /> Cancel
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    disabled={loading}
                >
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Service'}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;