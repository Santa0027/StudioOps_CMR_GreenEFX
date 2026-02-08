import React, { useState, useEffect } from 'react';
import { getFolderStructureTemplates, deleteFolderStructureTemplate } from '../api/api';
import { FaEdit, FaTrash, FaPlus, FaFolderPlus } from 'react-icons/fa';
import Modal from './Modal';
import FolderStructureTemplateForm from './FolderStructureTemplateForm';

const FolderStructureTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getFolderStructureTemplates();
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch folder structure templates.');
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteFolderStructureTemplate(templateId);
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template.');
        console.error('Error deleting template:', err);
      }
    }
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchTemplates();
  };

  if (isLoading) return <div className="text-center py-4">Loading templates...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Folder Structure Templates</h2>
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
        >
          <FaPlus className="mr-2" /> Create New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="text-center text-gray-600">No folder structure templates found. Create one to get started!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{template.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{template.description || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{new Date(template.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <button 
                      onClick={() => handleEdit(template)}
                      className="text-blue-600 hover:text-blue-800 mr-3 transition duration-300 ease-in-out"
                      title="Edit Template"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-800 transition duration-300 ease-in-out"
                      title="Delete Template"
                    >
                      <FaTrash />
                    </button>
                    {/* Potential future action: Generate folders directly from here? */}
                    {/* <button 
                      onClick={() => handleGenerateFolders(template.id)}
                      className="text-green-600 hover:text-green-800 ml-3"
                      title="Generate Folders"
                    >
                      <FaFolderPlus />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentTemplate ? 'Edit Folder Template' : 'Create Folder Template'}>
        <FolderStructureTemplateForm 
          template={currentTemplate} 
          onSaveSuccess={handleSaveSuccess} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default FolderStructureTemplateList;
