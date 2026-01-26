import React from 'react';
import PropTypes from 'prop-types';

const ProjectStageTemplateList = ({ stageTemplates, selectedStageTemplate, onSelectStageTemplate, onEditStageTemplate, onDeleteStageTemplate }) => {
    return (
        <div className="space-y-2">
            {stageTemplates.length === 0 ? (
                <p className="text-gray-400">{/* Adjusted text color */}No stage templates created yet.</p>
            ) : (
                stageTemplates.map((template) => (
                    <div
                        key={template.id}
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${selectedStageTemplate?.id === template.id ? 'bg-indigo-700 border-indigo-500 border-l-4 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                        onClick={() => onSelectStageTemplate(template)}
                    >
                        <span className="font-medium">{template.name}</span> {/* Text color handled by parent div */}
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditStageTemplate(template); }}
                                className="text-sm text-blue-400 hover:text-blue-200"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteStageTemplate(template.id); }}
                                className="text-sm text-red-400 hover:text-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

ProjectStageTemplateList.propTypes = {
    stageTemplates: PropTypes.array.isRequired,
    selectedStageTemplate: PropTypes.object,
    onSelectStageTemplate: PropTypes.func.isRequired,
    onEditStageTemplate: PropTypes.func.isRequired,
    onDeleteStageTemplate: PropTypes.func.isRequired,
};

export default ProjectStageTemplateList;
