import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderKanban, Save, XCircle, Info } from 'lucide-react';
import {
  getFolderStructureTemplates,
  createFolderStructureTemplate,
  updateFolderStructureTemplate,
  deleteFolderStructureTemplate
} from '../../../shared/services/apiClient'; // API functions for folder templates

// Basic JSON editor - can be replaced with a more advanced library if needed
const JsonEditor = ({ value, onChange, placeholder }) => {
  const [jsonString, setJsonString] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(null);

  useEffect(() => {
    setJsonString(JSON.stringify(value, null, 2));
  }, [value]);

  const handleJsonChange = (e) => {
    const raw = e.target.value;
    setJsonString(raw);
    try {
      const parsed = JSON.parse(raw);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="w-full">
      <textarea
        value={jsonString}
        onChange={handleJsonChange}
        placeholder={placeholder}
        rows="10"
        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm resize-y"
      />
      {error && <p className="text-rose-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

function FolderStructureTemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null); // For editing
  const [formData, setFormData] = useState({ name: '', description: '', structure: [] });
  const [validationErrors, setValidationErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getFolderStructureTemplates();
      setTemplates(res.data);
    } catch (err) {
      setError('Failed to fetch folder structure templates.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setCurrentTemplate(null);
    setFormData({ name: '', description: '', structure: [] });
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      structure: template.structure
    });
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleJsonStructureChange = (parsedJson) => {
    setFormData(prev => ({ ...prev, structure: parsedJson }));
    setValidationErrors(prev => ({ ...prev, structure: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Template name is required.';
    if (!formData.structure || formData.structure.length === 0) errors.structure = 'Folder structure cannot be empty.';
    // Basic JSON validation - more robust validation could check structure format
    try {
      JSON.stringify(formData.structure); // Just to catch any non-JSON serializable issues
    } catch (err) {
      errors.structure = 'Invalid JSON structure.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setFormLoading(true);
    try {
      if (currentTemplate) {
        await updateFolderStructureTemplate(currentTemplate.id, formData);
      } else {
        await createFolderStructureTemplate(formData);
      }
      fetchTemplates();
      handleCloseForm();
    } catch (err) {
      setError('Failed to save template. Please check the form and try again.');
      console.error(err.response?.data || err);
      if (err.response && err.response.data) {
        setValidationErrors(err.response.data);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this folder structure template?')) {
      try {
        await deleteFolderStructureTemplate(id);
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template.');
        console.error(err);
      }
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-300 mb-2";

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return <p className="text-rose-500 text-lg">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Folder Structure Templates</h1>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Template
        </button>
      </div>

      <p className="text-slate-400 mb-6 flex items-center gap-2">
        <Info size={18} className="text-blue-500" />
        Manage templates for standardizing project folder structures. The structure should be a JSON array representing folders and nested subfolders.
      </p>

      {templates.length === 0 ? (
        <p className="text-slate-500">No folder structure templates found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">{template.description || 'No description provided.'}</p>
              <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-300 max-h-40 overflow-auto custom-scrollbar">
                <pre>{JSON.stringify(template.structure, null, 2)}</pre>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleOpenEdit(template)}
                  className="p-2 rounded-lg text-blue-400 hover:bg-blue-900/50 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderKanban size={20} className="text-blue-500" />
                {currentTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label htmlFor="name" className={labelClasses}>Template Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClasses} ${validationErrors.name ? 'border-rose-500' : ''}`}
                  placeholder="e.g., Standard Project Structure"
                />
                {validationErrors.name && <p className="text-rose-500 text-sm mt-1">{validationErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="description" className={labelClasses}>Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={inputClasses + " resize-y"}
                  placeholder="A brief description of this template's use..."
                />
              </div>
              <div>
                <label htmlFor="structure" className={labelClasses}>Folder Structure (JSON) *</label>
                <JsonEditor
                  value={formData.structure}
                  onChange={handleJsonStructureChange}
                  placeholder={`[
  {
    "name": "01_Pre-production",
    "children": []
  },
  {
    "name": "02_Production",
    "children": [
      {
        "name": "Footage",
        "children": []
      },
      {
        "name": "Assets",
        "children": []
      }
    ]
  }
]`}
                />
                {validationErrors.structure && <p className="text-rose-500 text-sm mt-1">{validationErrors.structure}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FolderStructureTemplateManagement;