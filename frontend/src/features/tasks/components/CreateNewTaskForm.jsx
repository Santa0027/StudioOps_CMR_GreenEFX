import React, { useState, useEffect } from 'react';
import { 
  X, ListTodo, FolderKanban, Layers, 
  Calendar, StickyNote, CheckCircle2, Percent, Clock
} from 'lucide-react';
import { getProjects, getProject, getProjectStageElementTemplatesForStage, createProjectStageElement } from '../../../shared/services/apiClient';

const CreateNewTaskForm = ({ onClose }) => {
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [initialNotes, setInitialNotes] = useState('');
  const [contributionPercentage, setContributionPercentage] = useState(100); 
  const [estimatedHours, setEstimatedHours] = useState(8); 

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
  
  const [formErrors, setFormErrors] = useState({}); // New state for form errors

  const [loading, setLoading] = useState(false);

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
    setStages([]);
    setElementTemplates([]);
    setSelectedStageId('');
    setSelectedElementTemplateId('');
    setEstimatedHours(8); // Reset estimated hours when project changes
    setFormErrors({}); // Clear errors

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
    setElementTemplates([]);
    setSelectedElementTemplateId('');
    setEstimatedHours(8); // Reset estimated hours when stage changes
    setFormErrors({}); // Clear errors

    if (stageId) {
      try {
        setLoadingElementTemplates(true);
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
    const templateId = e.target.value;
    setSelectedElementTemplateId(templateId);
    const selectedTemplate = elementTemplates.find(et => String(et.id) === templateId);
    if (selectedTemplate && selectedTemplate.default_estimated_hours) {
      setEstimatedHours(selectedTemplate.default_estimated_hours);
    } else {
      setEstimatedHours(8); // Default if template not found or no default hours
    }
    setFormErrors({}); // Clear errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors

    if (!selectedProjectId || !selectedStageId || !selectedElementTemplateId) {
      setFormErrors({ _general: "Please select a project, a stage, and an element template." });
      return;
    }
    if (contributionPercentage <= 0 || contributionPercentage > 100) {
      setFormErrors({ contribution_percentage: ["Contribution percentage must be between 1 and 100."] });
      return;
    }
    if (estimatedHours <= 0) {
      setFormErrors({ estimated_hours: ["Estimated hours must be greater than 0."] });
      return;
    }

    setLoading(true);

    const newTaskData = {
      stage: selectedStageId,
      template: selectedElementTemplateId,
      order: 0,
      contribution_percentage: contributionPercentage,
      estimated_hours: estimatedHours,
      status: status,
      initial_notes: initialNotes, // Now this will directly be the user's initial notes
      rejection_notes: "", 
    };

    try {
      await createProjectStageElement(newTaskData);
      onClose();
    } catch (apiError) {
      console.error("Error creating task:", apiError);
      if (apiError.response && apiError.response.data) {
        setFormErrors(apiError.response.data);
        if (apiError.response.data.detail) {
            alert(`Error: ${apiError.response.data.detail}`);
        } else if (apiError.response.data.non_field_errors) {
            alert(`Error: ${apiError.response.data.non_field_errors.join(', ')}`);
        }
      } else {
        alert('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-300 mb-2";

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-slate-500/10 text-slate-400' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500/10 text-blue-400' },
  ];

  if (errorProjects) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg mx-auto">
        <p className="text-rose-400 mb-4">{errorProjects}</p>
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ListTodo size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Task</h2>
            <p className="text-sm text-slate-400">Add a new task to a project</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {formErrors._general && <p className="text-red-500 text-sm mt-1">{formErrors._general}</p>}
        {formErrors.non_field_errors && <p className="text-red-500 text-sm mt-1">{formErrors.non_field_errors[0]}</p>}
        {/* Initial Notes */}
        <div>
          <label htmlFor="initialNotes" className={labelClasses}>
            <StickyNote size={14} />
            Notes (Optional)
          </label>
          <textarea
            id="initialNotes"
            value={initialNotes}
            onChange={(e) => setInitialNotes(e.target.value)}
            className={inputClasses + " resize-none"}
            rows="3"
            placeholder="Any initial notes for this task, or a description..."
          />
          {formErrors.initial_notes && <p className="text-red-500 text-sm mt-1">{formErrors.initial_notes[0]}</p>}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className={labelClasses}>
            <Calendar size={14} />
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClasses}
            required
          />
          {formErrors.due_date && <p className="text-red-500 text-sm mt-1">{formErrors.due_date[0]}</p>}
        </div>

        {/* Project Selection */}
        <div>
          <label htmlFor="project" className={labelClasses}>
            <FolderKanban size={14} />
            Project *
          </label>
          {loadingProjects ? (
            <p className="text-slate-500 text-sm">Loading projects...</p>
          ) : (
            <select
              id="project"
              value={selectedProjectId}
              onChange={handleProjectChange}
              className={inputClasses + " cursor-pointer"}
              required
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {formErrors.project && <p className="text-red-500 text-sm mt-1">{formErrors.project[0]}</p>}
        </div>

        {/* Stage Selection */}
        {selectedProjectId && (
          <div>
            <label htmlFor="stage" className={labelClasses}>
              <Layers size={14} />
              Stage *
            </label>
            {loadingStages ? (
              <p className="text-slate-500 text-sm">Loading stages...</p>
            ) : errorStages ? (
              <p className="text-rose-400 text-sm">{errorStages}</p>
            ) : (
              <select
                id="stage"
                value={selectedStageId}
                onChange={handleStageChange}
                className={inputClasses + " cursor-pointer"}
                required
              >
                <option value="">Select a Stage</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.template_name}</option>
                ))}
              </select>
            )}
            {formErrors.stage && <p className="text-red-500 text-sm mt-1">{formErrors.stage[0]}</p>}
          </div>
        )}

        {/* Task Template Selection */}
        {selectedStageId && (
          <div>
            <label htmlFor="elementTemplate" className={labelClasses}>
              <ListTodo size={14} />
              Task Template *
            </label>
            {loadingElementTemplates ? (
              <p className="text-slate-500 text-sm">Loading task templates...</p>
            ) : errorElementTemplates ? (
              <p className="text-rose-400 text-sm">{errorElementTemplates}</p>
            ) : (
              <select
                id="elementTemplate"
                value={selectedElementTemplateId}
                onChange={handleElementTemplateChange} // Use new handler
                className={inputClasses + " cursor-pointer"}
                required
              >
                <option value="">Select a Task Template</option>
                {elementTemplates.map((et) => (
                  <option key={et.id} value={et.id}>{et.name}</option>
                ))}
              </select>
            )}
            {formErrors.template && <p className="text-red-500 text-sm mt-1">{formErrors.template[0]}</p>}
          </div>
        )}

        {/* Contribution Percentage */}
        <div>
          <label htmlFor="contributionPercentage" className={labelClasses}>
            <Percent size={14} />
            Contribution Percentage (%) *
          </label>
          <input
            type="number"
            id="contributionPercentage"
            value={contributionPercentage}
            onChange={(e) => setContributionPercentage(Math.max(1, Math.min(100, Number(e.target.value))))} // Client-side range clamp
            className={inputClasses}
            min="1"
            max="100"
            required
          />
          {formErrors.contribution_percentage && <p className="text-red-500 text-sm mt-1">{formErrors.contribution_percentage[0]}</p>}
        </div>

        {/* Estimated Hours */}
        <div>
          <label htmlFor="estimatedHours" className={labelClasses}>
            <Clock size={14} />
            Estimated Hours *
          </label>
          <input
            type="number"
            id="estimatedHours"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Math.max(1, Number(e.target.value)))} // Client-side min clamp
            className={inputClasses}
            min="1"
            required
          />
          {formErrors.estimated_hours && <p className="text-red-500 text-sm mt-1">{formErrors.estimated_hours[0]}</p>}
        </div>

        {/* Status */}
        <div>
          <label className={labelClasses}>
            <CheckCircle2 size={14} />
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === option.value
                    ? 'ring-2 ring-blue-500 ' + option.color
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {formErrors.status && <p className="text-red-500 text-sm mt-1">{formErrors.status[0]}</p>}
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateNewTaskForm;