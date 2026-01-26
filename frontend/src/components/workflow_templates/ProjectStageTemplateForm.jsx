import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProjectStageTemplateForm = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: template?.id || null,
        name: template?.name || '',
        description: template?.description || '',
    });
    // State to manage nested element templates
    const [elementTemplates, setElementTemplates] = useState(template?.task_templates || []);
    const [nextElementId, setNextElementId] = useState(0); // For unique keys for new elements

    useEffect(() => {
        setFormData({
            id: template?.id || null,
            name: template?.name || '',
            description: template?.description || '',
        });
        setElementTemplates(template?.task_templates || []);
        // Find the maximum ID to ensure new elements have unique temporary IDs
        if (template?.task_templates && template.task_templates.length > 0) {
            const maxId = Math.max(...template.task_templates.map(el => el.id || 0));
            setNextElementId(maxId + 1);
        } else {
            setNextElementId(0);
        }
    }, [template]);

    const handleStageTemplateChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddElement = () => {
        setElementTemplates((prevElements) => [
            ...prevElements,
            { id: `new-${nextElementId}`, name: '', description: '', default_estimated_hours: '', isNew: true }, // Add a temporary ID and isNew flag
        ]);
        setNextElementId(prevId => prevId + 1);
    };

    const handleElementChange = (index, e) => {
        const { name, value } = e.target;
        setElementTemplates((prevElements) =>
            prevElements.map((el, i) =>
                i === index ? { ...el, [name]: value } : el
            )
        );
    };

    const handleDeleteElement = (idToDelete) => {
        setElementTemplates((prevElements) =>
            prevElements.filter((el) => el.id !== idToDelete)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter out temporary 'id' and 'isNew' flags for new elements before sending to API
        const cleanedElementTemplates = elementTemplates.map((element) => {
            if (element.isNew) {
                // For new elements, exclude the temporary 'id' and 'isNew' flag entirely
                const { id, isNew, ...rest } = element;
                return rest;
            }
            // For existing elements, send all fields including the actual 'id'
            return element;
        });

        // Combine stage template data and element templates
        const dataToSave = {
            ...formData,
            task_templates: cleanedElementTemplates,
        };
        onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Stage Template Fields */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Template Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleStageTemplateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleStageTemplateChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
            </div>

            {/* Project Stage Element Templates Section */}
            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Element Templates</h3>
                <button
                    type="button"
                    onClick={handleAddElement}
                    className="mb-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-md text-sm"
                >
                    Add Element
                </button>

                {elementTemplates.length === 0 ? (
                    <p className="text-gray-500 text-sm">No elements added yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {elementTemplates.map((element, index) => (
                                    <tr key={element.id}>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="name"
                                                value={element.name}
                                                onChange={(e) => handleElementChange(index, e)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                                required
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input
                                                type="text"
                                                name="description"
                                                value={element.description}
                                                onChange={(e) => handleElementChange(index, e)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="default_estimated_hours"
                                                value={element.default_estimated_hours}
                                                onChange={(e) => handleElementChange(index, e)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteElement(element.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 border-t pt-4 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {formData.id ? 'Update Template' : 'Create Template'}
                </button>
            </div>
        </form>
    );
};

ProjectStageTemplateForm.propTypes = {
    template: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ProjectStageTemplateForm;
