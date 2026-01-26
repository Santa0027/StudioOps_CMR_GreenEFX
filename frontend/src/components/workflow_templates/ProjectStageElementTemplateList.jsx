import React from 'react';
import PropTypes from 'prop-types';

const ProjectStageElementTemplateList = ({ elementTemplates }) => { // Removed onEditElementTemplate, onDeleteElementTemplate
    return (
        <div className="overflow-x-auto">
            {elementTemplates.length === 0 ? (
                <p className="text-gray-400">No element templates for this stage yet.</p>
            ) : (
                <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg"> {/* Updated table styling */}
                    <thead>
                        <tr className="bg-gray-700 border-b border-gray-600"> {/* Updated header row styling */}
                            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider"> {/* Updated header text styling */}
                                Name
                            </th>
                            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Default Estimated Hours
                            </th>
                            {/* Actions column removed as editing is now inline in ProjectStageTemplateForm */}
                        </tr>
                    </thead>
                    <tbody className="bg-[#1C1C1E] divide-y divide-gray-700"> {/* Updated body styling */}
                        {elementTemplates.map((element) => (
                            <tr key={element.id} className="border-b border-gray-700 hover:bg-gray-800"> {/* Updated row styling */}
                                <td className="py-3 px-4 text-sm text-gray-200">{element.name}</td> {/* Updated text color */}
                                <td className="py-3 px-4 text-sm text-gray-400">{element.description || 'N/A'}</td> {/* Updated text color */}
                                <td className="py-3 px-4 text-sm text-gray-200">{element.default_estimated_hours || 'N/A'}</td> {/* Updated text color */}
                                {/* Removed action buttons */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

ProjectStageElementTemplateList.propTypes = {
    elementTemplates: PropTypes.array.isRequired,
    // Removed onEditElementTemplate, onDeleteElementTemplate
};

export default ProjectStageElementTemplateList;
