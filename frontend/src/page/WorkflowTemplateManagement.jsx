import React, { useState, useEffect } from 'react';
import { getProjectStageTemplates, createProjectStageTemplate, updateProjectStageTemplate, deleteProjectStageTemplate } from '../api/api'; // Removed element-specific API calls
import Modal from '../components/Modal';
import ProjectStageTemplateList from '../components/workflow_templates/ProjectStageTemplateList'; // Updated path
import ProjectStageElementTemplateList from '../components/workflow_templates/ProjectStageElementTemplateList'; // Updated path
import ProjectStageTemplateForm from '../components/workflow_templates/ProjectStageTemplateForm'; // Updated path
// Removed import for ProjectStageElementTemplateForm as it's no longer used directly

const WorkflowTemplateManagement = () => {
    const [stageTemplates, setStageTemplates] = useState([]);
    const [selectedStageTemplate, setSelectedStageTemplate] = useState(null);
    // Removed elementTemplates state as it's now managed within ProjectStageTemplateForm when editing
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    // Removed isElementModalOpen state
    const [currentStageTemplate, setCurrentStageTemplate] = useState(null); // For editing stage template
    // Removed currentElementTemplate state

    useEffect(() => {
        fetchStageTemplates();
    }, []);

    const fetchStageTemplates = async () => {
        try {
            const response = await getProjectStageTemplates();
            setStageTemplates(response.data);
        } catch (error) {
            console.error("Error fetching stage templates:", error);
        }
    };

    // Removed fetchElementTemplates as elements are now nested in stage template fetch
    // Removed handleAddElementTemplate, handleEditElementTemplate, handleDeleteElementTemplate, handleSaveElementTemplate

    const handleSelectStageTemplate = (template) => {
        setSelectedStageTemplate(template);
        // If template has nested task_templates, they will be available here
    };

    // Stage Template Handlers
    const handleAddStageTemplate = () => {
        setCurrentStageTemplate(null);
        setIsStageModalOpen(true);
    };

    const handleEditStageTemplate = (template) => {
        setCurrentStageTemplate(template);
        setIsStageModalOpen(true);
    };

    const handleDeleteStageTemplate = async (id) => {
        if (window.confirm("Are you sure you want to delete this stage template and all its associated elements?")) {
            try {
                await deleteProjectStageTemplate(id);
                fetchStageTemplates();
                setSelectedStageTemplate(null); // Deselect if deleted
            } catch (error) {
                console.error("Error deleting stage template:", error);
            }
        }
    };

    const handleSaveStageTemplate = async (formData) => {
        try {
            if (formData.id) {
                // When updating, if task_templates are sent, the backend handles nested updates
                await updateProjectStageTemplate(formData.id, formData);
            } else {
                // When creating, if task_templates are sent, the backend handles nested creation
                await createProjectStageTemplate(formData);
            }
            fetchStageTemplates();
            setIsStageModalOpen(false);
        } catch (error) {
            console.error("Error saving stage template:", error);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-white">Manage Workflow Templates</h1>

            <div className="flex justify-end mb-6">
                <button
                    onClick={handleAddStageTemplate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
                >
                    Add New Stage Template
                </button>
            </div>

            <div className="flex h-full">
                {/* Left Column: Stage Templates */}
                <div className="w-1/3 border-r border-gray-700 p-4 overflow-y-auto"> {/* Added border-gray-700 for dark theme */}
                    <h2 className="text-2xl font-semibold mb-4 text-gray-200">Existing Workflow Templates</h2> {/* Adjusted heading */}
                    <ProjectStageTemplateList
                        stageTemplates={stageTemplates}
                        selectedStageTemplate={selectedStageTemplate}
                        onSelectStageTemplate={handleSelectStageTemplate}
                        onEditStageTemplate={handleEditStageTemplate}
                        onDeleteStageTemplate={handleDeleteStageTemplate}
                    />
                </div>

                {/* Right Column: Element Templates */}
                <div className="w-2/3 p-4 overflow-y-auto">
                    {selectedStageTemplate ? (
                        <>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
                                Elements for: {selectedStageTemplate.name}
                            </h2>
                            <ProjectStageElementTemplateList
                                elementTemplates={selectedStageTemplate.task_templates || []}
                            />
                            <p className="text-gray-400 mt-4 text-sm">
                                To add, edit, or delete elements, please edit the "{selectedStageTemplate.name}" workflow template.
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-400">Select a Workflow Template to view its elements.</p>
                    )}
                </div>

                {/* Modals for Forms */}
                <Modal isOpen={isStageModalOpen} onClose={() => setIsStageModalOpen(false)} title={currentStageTemplate ? "Edit Workflow Template" : "Create Workflow Template"}>
                    <ProjectStageTemplateForm
                        template={currentStageTemplate}
                        onSave={handleSaveStageTemplate}
                        onCancel={() => setIsStageModalOpen(false)}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default WorkflowTemplateManagement;
