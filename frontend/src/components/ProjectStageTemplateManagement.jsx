import React, { useState, useEffect } from 'react';
import { getProjectStageTemplates, createProjectStageTemplate, updateProjectStageTemplate, deleteProjectStageTemplate } from '../api/api';
import ProjectStageElementTemplateManagement from './ProjectStageElementTemplateManagement'; // Import the new component

// Add/Edit Stage Template Form - Reusable
const StageTemplateForm = ({ initialTemplate, onClose, onTemplateSaved }) => {
  const [name, setName] = useState(initialTemplate ? initialTemplate.name : '');
  const [description, setDescription] = useState(initialTemplate ? initialTemplate.description : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name || '');
      setDescription(initialTemplate.description || '');
    }
  }, [initialTemplate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const templateData = {
      name,
      description,
    };

    try {
      if (initialTemplate && initialTemplate.id) {
        await updateProjectStageTemplate(initialTemplate.id, templateData);
        alert('Stage Template updated successfully!');
      } else {
        await createProjectStageTemplate(templateData);
        alert('Stage Template added successfully!');
      }
      if (onTemplateSaved) onTemplateSaved();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to save stage template:', err);
      setError('Failed to save stage template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-md mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">{initialTemplate ? 'Edit Stage Template' : 'Add New Stage Template'}</h2>
        {error && <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Template Name</label>
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
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ProjectStageTemplateManagement = () => {
  const [stageTemplates, setStageTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showElementManagementModal, setShowElementManagementModal] = useState(false);
  const [selectedStageTemplateForElements, setSelectedStageTemplateForElements] = useState(null);

  const fetchStageTemplates = async () => {
    try {
      setLoading(true);
      const res = await getProjectStageTemplates();
      setStageTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch stage templates:', err);
      setError('Failed to fetch stage templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStageTemplates();
  }, []);

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stage template?')) {
      return;
    }
    try {
      await deleteProjectStageTemplate(id);
      alert('Stage Template deleted successfully!');
      fetchStageTemplates(); // Refresh list
    } catch (err) {
      console.error('Failed to delete stage template:', err);
      setError('Failed to delete stage template. Please try again.');
    }
  };

  const handleManageElementsClick = (template) => {
    setSelectedStageTemplateForElements(template);
    setShowElementManagementModal(true);
  };

  if (loading) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-gray-100">Loading stage templates...</div>;
  if (error) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-red-400">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Project Stage Templates</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
        >
          Add New Stage Template
        </button>
      </div>

      {/* Existing Stage Templates List */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Existing Stage Templates</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stageTemplates.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-3 px-4 text-center text-sm text-gray-400">No stage templates found.</td>
              </tr>
            ) : (
              stageTemplates.map(template => (
                <tr key={template.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-200">{template.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{template.description}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowEditForm(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleManageElementsClick(template)}
                      className="text-green-400 hover:text-green-300 mr-2"
                      title="Manage Elements"
                    >
                      Manage Elements
                    </button>
                    <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <StageTemplateForm
          onClose={() => setShowAddForm(false)}
          onTemplateSaved={fetchStageTemplates}
        />
      )}

      {showEditForm && editingTemplate && (
        <StageTemplateForm
          initialTemplate={editingTemplate}
          onClose={() => {
            setShowEditForm(false);
            setEditingTemplate(null);
          }}
          onTemplateSaved={fetchStageTemplates}
        />
      )}

      {showElementManagementModal && selectedStageTemplateForElements && (
        <ProjectStageElementTemplateManagement
          stageTemplateId={selectedStageTemplateForElements.id}
          stageTemplateName={selectedStageTemplateForElements.name}
          onClose={() => {
            setShowElementManagementModal(false);
            setSelectedStageTemplateForElements(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectStageTemplateManagement;