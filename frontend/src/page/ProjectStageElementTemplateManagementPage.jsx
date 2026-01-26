import React, { useState, useEffect } from 'react';
import {
  getProjectStageTemplates,
  getProjectStageElementTemplatesForStage,
  createProjectStageElementTemplateForStage,
  updateProjectStageElementTemplate,
  deleteProjectStageElementTemplate,
} from '../api/api';
import ProjectStageElementTemplateForm from '../components/ProjectStageElementTemplateForm';
import { Link } from 'react-router-dom'; // Import Link

const ProjectStageElementTemplateManagementPage = () => {
  const [stageTemplates, setStageTemplates] = useState([]);
  const [selectedStageTemplateId, setSelectedStageTemplateId] = useState('');
  const [elementTemplates, setElementTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingElementTemplate, setEditingElementTemplate] = useState(null);

  useEffect(() => {
    fetchStageTemplates();
  }, []);

  useEffect(() => {
    if (selectedStageTemplateId) {
      fetchElementTemplates(selectedStageTemplateId);
    } else {
      setElementTemplates([]);
    }
  }, [selectedStageTemplateId]);

  const fetchStageTemplates = async () => {
    try {
      const res = await getProjectStageTemplates();
      console.log('API Response (getProjectStageTemplates):', res.data); // Debug log
      setStageTemplates(res.data);
      if (res.data.length > 0) {
        setSelectedStageTemplateId(res.data[0].id); // Select the first stage by default
      }
    } catch (err) {
      console.error('Failed to fetch stage templates:', err);
      setError('Failed to fetch stage templates.');
    } finally {
      setLoading(false); // Ensure loading is set to false
    }
  };

  const fetchElementTemplates = async (stageId) => {
    setLoading(true);
    try {
      const res = await getProjectStageElementTemplatesForStage(stageId);
      console.log(`API Response (getProjectStageElementTemplatesForStage for stage ${stageId}):`, res.data); // Debug log
      setElementTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch element templates:', err);
      setError('Failed to fetch element templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddElementClick = () => {
    setEditingElementTemplate(null);
    setShowForm(true);
  };

  const handleEditElementClick = (element) => {
    setEditingElementTemplate(element);
    setShowForm(true);
  };

  const handleDeleteElement = async (elementId) => {
    if (!window.confirm('Are you sure you want to delete this element template?')) {
      return;
    }
    try {
      await deleteProjectStageElementTemplate(selectedStageTemplateId, elementId);
      alert('Element template deleted successfully!');
      fetchElementTemplates(selectedStageTemplateId); // Refresh list
    } catch (err) {
      console.error('Failed to delete element template:', err);
      setError('Failed to delete element template. Please try again.');
    }
  };

  const handleElementSaved = () => {
    setShowForm(false);
    fetchElementTemplates(selectedStageTemplateId); // Refresh list
  };

  // Restructured conditional rendering for loading and error
  if (error) {
    return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-red-400">Error: {error}</div>;
  }

  if (loading) {
    return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-gray-100">Loading stage templates...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Project Stage Element Templates</h1>

      <div className="mb-4">
        <label htmlFor="stage-select" className="block text-sm font-medium text-gray-300">
          Select Stage Template:
        </label>
        <select
          id="stage-select"
          value={selectedStageTemplateId}
          onChange={(e) => setSelectedStageTemplateId(e.target.value)}
          className="mt-1 block w-full md:w-1/2 bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {stageTemplates.length === 0 ? (
            <option value="">No Stage Templates Available</option>
          ) : (
            stageTemplates.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddElementClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
          disabled={!selectedStageTemplateId}
        >
          Add New Element Template
        </button>
      </div>

      {stageTemplates.length === 0 ? (
        <p className="text-gray-400">
          No Stage Templates found. Please <Link to="/master/stage-templates" className="text-blue-400 hover:underline">create one</Link> first.
        </p>
      ) : selectedStageTemplateId ? (
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
                  <td colSpan="4" className="py-3 px-4 text-center text-sm text-gray-400">
                    No element templates found for this stage.
                  </td>
                </tr>
              ) : (
                elementTemplates.map((element) => (
                  <tr key={element.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-200">{element.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-200">{element.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-200">{element.default_estimated_hours || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-sm">
                      <button
                        onClick={() => handleEditElementClick(element)}
                        className="text-blue-400 hover:text-blue-300 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteElement(element.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">Please select a Stage Template to view its element templates.</p>
      )}

      {showForm && (
        <ProjectStageElementTemplateForm
          stageId={selectedStageTemplateId}
          initialElementTemplate={editingElementTemplate}
          onClose={() => setShowForm(false)}
          onElementSaved={handleElementSaved}
        />
      )}
    </div>
  );
};

export default ProjectStageElementTemplateManagementPage;
