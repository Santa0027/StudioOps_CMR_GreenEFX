import React, { useState, useEffect } from 'react';
import { getProjectStageElementTemplatesForStage, createProjectStageElementTemplateForStage, updateProjectStageElementTemplate, deleteProjectStageElementTemplate } from '../../../shared/services/apiClient';

// Add/Edit Stage Element Template Form - Reusable
const StageElementTemplateForm = ({ stageTemplateId, initialElement, onClose, onElementSaved }) => {
  const [name, setName] = useState(initialElement ? initialElement.name : '');
  const [description, setDescription] = useState(initialElement ? initialElement.description : '');
  const [defaultEstimatedHours, setDefaultEstimatedHours] = useState(initialElement ? initialElement.default_estimated_hours : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialElement) {
      setName(initialElement.name || '');
      setDescription(initialElement.description || '');
      setDefaultEstimatedHours(initialElement.default_estimated_hours || '');
    }
  }, [initialElement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const elementData = {
      name,
      description,
      default_estimated_hours: parseInt(defaultEstimatedHours),
    };

    try {
      if (initialElement && initialElement.id) {
        await updateProjectStageElementTemplate(stageTemplateId, initialElement.id, elementData);
        alert('Stage Element Template updated successfully!');
      } else {
        await createProjectStageElementTemplateForStage(stageTemplateId, elementData);
        alert('Stage Element Template added successfully!');
      }
      if (onElementSaved) onElementSaved();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to save stage element template:', err);
      setError('Failed to save stage element template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-md mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">{initialElement ? 'Edit Stage Element Template' : 'Add New Stage Element Template'}</h2>
        {error && <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Element Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="defaultEstimatedHours" className="block text-sm font-medium text-gray-300">Default Estimated Hours</label>
            <input
              type="number"
              id="defaultEstimatedHours"
              name="defaultEstimatedHours"
              value={defaultEstimatedHours}
              onChange={(e) => setDefaultEstimatedHours(e.target.value)}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Element'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ProjectStageElementTemplateManagement = ({ stageTemplateId, stageTemplateName, onClose }) => {
  const [elementTemplates, setElementTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false); // For both add/edit
  const [editingElement, setEditingElement] = useState(null);

  const fetchElementTemplates = async () => {
    try {
      setLoading(true);
      const res = await getProjectStageElementTemplatesForStage(stageTemplateId);
      setElementTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch stage element templates:', err);
      setError('Failed to fetch stage element templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stageTemplateId) {
      fetchElementTemplates();
    }
  }, [stageTemplateId]);

  const handleAddElementClick = () => {
    setEditingElement(null); // Clear any previous editing state
    setShowItemForm(true);
  };

  const handleEditElementClick = (element) => {
    setEditingElement(element);
    setShowItemForm(true);
  };

  const handleDeleteElement = async (elementId) => {
    if (!window.confirm('Are you sure you want to delete this stage element template?')) {
      return;
    }
    try {
      await deleteProjectStageElementTemplate(stageTemplateId, elementId);
      alert('Stage Element Template deleted successfully!');
      fetchElementTemplates(); // Refresh list
    } catch (err) {
      console.error('Failed to delete stage element template:', err);
      setError('Failed to delete stage element template. Please try again.');
    }
  };

  if (loading) return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 text-white">Loading elements...</div>;
  if (error) return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100 max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Manage Elements for "{stageTemplateName}"</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddElementClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
          >
            Add New Element
          </button>
        </div>

        {/* Stage Element Templates List */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Existing Elements</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-700 border-b border-gray-600">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Default Estimated Hours</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {elementTemplates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-3 px-4 text-center text-sm text-gray-400">No elements found for this stage template.</td>
                </tr>
              ) : (
                elementTemplates.map(element => (
                  <tr key={element.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-200">{element.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-200">{element.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-200">{element.default_estimated_hours}</td>
                    <td className="py-3 px-4 text-center text-sm">
                      <button
                        onClick={() => handleEditElementClick(element)}
                        className="text-blue-400 hover:text-blue-300 mr-2"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteElement(element.id)} className="text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showItemForm && (
          <StageElementTemplateForm
            stageTemplateId={stageTemplateId}
            initialElement={editingElement}
            onClose={() => setShowItemForm(false)}
            onElementSaved={fetchElementTemplates}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectStageElementTemplateManagement;