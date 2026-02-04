import React, { useState, useEffect } from 'react';
import { getProjects, getProject, getProjectStageElementTemplatesForStage, createProjectStageElement } from '../api/api';

const CreateNewTaskForm = ({ onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorProjects, setErrorProjects] = useState(null);

  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [loadingStages, setLoadingStages] = useState(false);
  const [errorStages, setErrorStages] = useState(null);

  const [elementTemplates, setElementTemplates] = useState([]);
  const [selectedElementTemplateId, setSelectedElementTemplateId] = useState('');
  const [loadingElementTemplates, setLoadingElementTemplates] = useState(false);
  const [errorElementTemplates, setErrorElementTemplates] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await getProjects();
        setProjects(response.data);
      } catch (err) {
        setErrorProjects("Failed to load projects. Please try again.");
        console.error("Error fetching projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    setStages([]); // Clear stages
    setElementTemplates([]); // Clear element templates
    setSelectedStageId(''); // Clear selected stage
    setSelectedElementTemplateId(''); // Clear selected element template

    if (projectId) {
      try {
        setLoadingStages(true);
        const response = await getProject(projectId);
        setStages(response.data.stages);
      } catch (err) {
        setErrorStages("Failed to load stages for the selected project.");
        console.error("Error fetching project stages:", err);
      } finally {
        setLoadingStages(false);
      }
    }
  };

  const handleStageChange = async (e) => {
    const stageId = e.target.value;
    setSelectedStageId(stageId);
    setElementTemplates([]); // Clear element templates
    setSelectedElementTemplateId(''); // Clear selected element template

    if (stageId) {
      try {
        setLoadingElementTemplates(true);
        // Find the selected stage to get its template ID
        const selectedStage = stages.find(s => String(s.id) === stageId);
        if (selectedStage && selectedStage.template) {
          const response = await getProjectStageElementTemplatesForStage(selectedStage.template);
          setElementTemplates(response.data);
        } else {
          setElementTemplates([]);
        }
      } catch (err) {
        setErrorElementTemplates("Failed to load element templates for the selected stage.");
        console.error("Error fetching project stage element templates:", err);
      } finally {
        setLoadingElementTemplates(false);
      }
    }
  };

  const handleElementTemplateChange = (e) => {
    setSelectedElementTemplateId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProjectId || !selectedStageId || !selectedElementTemplateId) {
      alert("Please select a project, a stage, and an element template.");
      return;
    }

    // You might need to derive estimated_hours from dueDate or provide a separate input.
    // For now, let's use a placeholder and ignore the dueDate for API submission.
    const estimatedHours = 8; // Placeholder

    const newTaskData = {
      stage: selectedStageId,
      template: selectedElementTemplateId,
      order: 0, // Placeholder, will likely be handled by backend
      contribution_percentage: 100, // Placeholder, default
      estimated_hours: estimatedHours,
      status: status,
      rejection_notes: "",
      // taskName and description are associated with the template, not directly the ProjectStageElement
      // If the backend allows updating template details through ProjectStageElement creation/update,
      // you might include them here. Otherwise, they are for display/selection of template.
    };

    try {
      await createProjectStageElement(newTaskData);
      alert('Task created successfully!');
      onClose(); // Close the form after submission
    } catch (apiError) {
      console.error("Error creating task:", apiError);
      alert('Failed to create task. Check console for details.');
    }
  };



  if (errorProjects) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max_w_md text-white">
          <p className="text-red-500">{errorProjects}</p>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font_bold py-2 px-4 rounded mt-4">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-2xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="taskName" className="block text-white text-sm font-bold mb-2">Task Name (for reference):</label>
            <input
              type="text"
              id="taskName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-white text-sm font-bold mb-2">Description (for reference):</label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-white text-sm font-bold mb-2">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="project" className="block text-white text-sm font-bold mb-2">Project:</label>
            <select
              id="project"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={selectedProjectId}
              onChange={handleProjectChange}
              required
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {selectedProjectId && (
            <div className="mb-4">
              <label htmlFor="stage" className="block text-white text-sm font-bold mb-2">Stage:</label>
              {loadingStages ? (
                <p className="text-gray-400">Loading stages...</p>
              ) : errorStages ? (
                <p className="text-red-500">{errorStages}</p>
              ) : (
                <select
                  id="stage"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                  value={selectedStageId}
                  onChange={handleStageChange}
                  required
                >
                  <option value="">Select a Stage</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.template_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {selectedStageId && (
            <div className="mb-4">
              <label htmlFor="elementTemplate" className="block text-white text-sm font-bold mb-2">Task Template:</label>
              {loadingElementTemplates ? (
                <p className="text-gray-400">Loading task templates...</p>
              ) : errorElementTemplates ? (
                <p className="text-red-500">{errorElementTemplates}</p>
              ) : (
                <select
                  id="elementTemplate"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                  value={selectedElementTemplateId}
                  onChange={handleElementTemplateChange}
                  required
                >
                  <option value="">Select a Task Template</option>
                  {elementTemplates.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="status" className="block text-white text-sm font-bold mb-2">Status:</label>
            <select
              id="status"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewTaskForm;