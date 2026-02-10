import React, { useState, useEffect } from 'react';
import { createProjectStageElementTemplateForStage, updateProjectStageElementTemplate } from '../../../shared/services/apiClient';

const ProjectStageElementTemplateForm = ({ stageId, initialElementTemplate, onClose, onElementSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultEstimatedHours, setDefaultEstimatedHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialElementTemplate) {
      setName(initialElementTemplate.name || '');
      setDescription(initialElementTemplate.description || '');
      setDefaultEstimatedHours(initialElementTemplate.default_estimated_hours || '');
    } else {
      setName('');
      setDescription('');
      setDefaultEstimatedHours('');
    }
  }, [initialElementTemplate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const elementData = {
      stage: stageId,
      name,
      description,
      default_estimated_hours: defaultEstimatedHours ? parseInt(defaultEstimatedHours, 10) : null,
    };

    try {
      if (initialElementTemplate && initialElementTemplate.id) {
        await updateProjectStageElementTemplate(stageId, initialElementTemplate.id, elementData);
        alert('Element template updated successfully!');
      } else {
        await createProjectStageElementTemplateForStage(stageId, elementData);
        alert('Element template added successfully!');
      }
      if (onElementSaved) onElementSaved();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to save element template:', err);
      if (err.response && err.response.data) {
        let errorMessages = [];
        for (const key in err.response.data) {
          if (Array.isArray(err.response.data[key])) {
            errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${err.response.data[key]}`);
          }
        }
        setError(`Failed to save element template: ${errorMessages.join('; ')}`);
      } else {
        setError('Failed to save element template. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-md mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          {initialElementTemplate ? 'Edit Element Template' : 'Add New Element Template'}
        </h2>
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
              rows="3"
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="default_estimated_hours" className="block text-sm font-medium text-gray-300">Default Estimated Hours</label>
            <input
              type="number"
              id="default_estimated_hours"
              name="default_estimated_hours"
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

export default ProjectStageElementTemplateForm;
