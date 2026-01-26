import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProjectStageElementTemplateForm = ({ element, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: element?.id || null,
        name: element?.name || '',
        description: element?.description || '',
        default_estimated_hours: element?.default_estimated_hours || '',
    });

    useEffect(() => {
        setFormData({
            id: element?.id || null,
            name: element?.name || '',
            description: element?.description || '',
            default_estimated_hours: element?.default_estimated_hours || '',
        });
    }, [element]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Element Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
            </div>
            <div>
                <label htmlFor="default_estimated_hours" className="block text-sm font-medium text-gray-700">
                    Default Estimated Hours
                </label>
                <input
                    type="number"
                    name="default_estimated_hours"
                    id="default_estimated_hours"
                    value={formData.default_estimated_hours}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div className="flex justify-end space-x-3">
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
                    {formData.id ? 'Update Element' : 'Create Element'}
                </button>
            </div>
        </form>
    );
};

ProjectStageElementTemplateForm.propTypes = {
    element: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ProjectStageElementTemplateForm;
