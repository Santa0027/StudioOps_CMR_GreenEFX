import React, { useState, useEffect } from 'react';
import {
  X, FolderKanban, Building2, Layers, Briefcase, Flag,
  Calendar, DollarSign, Clock, FileText, Link, Users, Save, Paperclip
} from 'lucide-react';
import { updateProject, getClients, getEmployees, getServices, getPackages, getFolderStructureTemplates } from '../api/api';

// Placeholder for base projects directory - ideally this comes from a global config or user settings
const BASE_PROJECTS_DIR = '/mnt/projects'; // Example path, adjust as needed

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-slate-700 text-slate-300' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'high', label: 'High', color: 'bg-rose-500/20 text-rose-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' },
];

const EditProjectForm = ({ project, onClose, onProjectUpdated }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    client: project.client || '',
    project_type: project.project_type || 'single_service',
    service: project.service || '', // Now stores service ID
    package: project.package || '', // Now stores package ID
    priority: project.priority || 'medium',
    start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    due_date: project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '',
    budget: project.budget || '',
    estimated_hours: project.estimated_hours || '',
    description: project.description || '',
    initial_requirements: project.initial_requirements || '',
    reference_links: project.reference_links || '',
    assigned_users: project.assigned_users ? project.assigned_users.map(user => user.id) : [],
    folder_structure_template: project.folder_structure_template || '', // New field
  });
  
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]); // New state for services
  const [packages, setPackages] = useState([]); // New state for packages
  const [folderStructureTemplates, setFolderStructureTemplates] = useState([]); // New state
  const [basePath, setBasePath] = useState(BASE_PROJECTS_DIR); // New state for base path
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [clientsRes, employeesRes, servicesRes, packagesRes, folderTemplatesRes] = await Promise.all([
          getClients(),
          getEmployees(),
          getServices(),
          getPackages(),
          getFolderStructureTemplates(), // Fetch folder structure templates
        ]);
        setClients(clientsRes.data);
        setEmployees(employeesRes.data);
        setServices(servicesRes.data);
        setPackages(packagesRes.data);
        setFolderStructureTemplates(folderTemplatesRes.data); // Set folder templates state
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setFormError('Failed to load clients, employees, services, packages or folder templates.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    setFormData({
      name: project.name || '',
      client: project.client || '',
      project_type: project.project_type || 'single_service',
      service: project.service || '',
      package: project.package || '',
      priority: project.priority || 'medium',
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      due_date: project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '',
      budget: project.budget || '',
      estimated_hours: project.estimated_hours || '',
      description: project.description || '',
      initial_requirements: project.initial_requirements || '',
      reference_links: project.reference_links || '',
      assigned_users: project.assigned_users ? project.assigned_users.map(user => user.id) : [],
      folder_structure_template: project.folder_structure_template || '', // New field
    });
    // Clear validation errors when project changes
    setValidationErrors({});
  }, [project]);

  // Effect to reset service or package when project_type changes
  useEffect(() => {
    setFormData(prev => {
      if (prev.project_type === 'single_service') {
        return { ...prev, package: '' }; // Clear package if single service
      } else if (prev.project_type === 'package') {
        return { ...prev, service: '' }; // Clear service if package
      }
      return prev;
    });
  }, [formData.project_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined })); // Clear validation error for this field
  };

  const handleSubmit = async () => {
    setFormError(null);
    setValidationErrors({}); // Clear previous validation errors

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    const projectData = {
        ...formData,
        folder_structure_template_id: formData.folder_structure_template,
        base_path: basePath,
    };

    try {
      await updateProject(project.id, projectData); // Pass projectData instead of formData
      if (onProjectUpdated) onProjectUpdated();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to update project:', err);
      if (err.response && err.response.data) {
        let errorMessages = [];
        for (const key in err.response.data) {
          if (Array.isArray(err.response.data[key])) {
            errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${err.response.data[key]}`);
          }
        }
        setFormError(`Failed to update project: ${errorMessages.join('; ')}`);
      } else {
        setFormError('Failed to update project. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to compare only dates

    // Project Name validation
    if (!data.name.trim()) {
      errors.name = 'Project name is required.';
    } else if (data.name.trim().length < 3) {
      errors.name = 'Project name must be at least 3 characters long.';
    } else if (data.name.trim().length > 100) {
      errors.name = 'Project name cannot exceed 100 characters.';
    }

    // Client validation
    if (!data.client) {
      errors.client = 'Client selection is required.';
    }

    // Service/Package validation
    if (data.project_type === 'single_service' && !data.service) {
      errors.service = 'Service selection is required for single service projects.';
    }
    if (data.project_type === 'package' && !data.package) {
      errors.package = 'Package selection is required for package projects.';
    }

    // Due Date validation
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (dueDate < today) {
        errors.due_date = 'Due date cannot be in the past.';
      }
      if (data.start_date) {
        const startDate = new Date(data.start_date);
        if (dueDate < startDate) {
          errors.due_date = 'Due date cannot be before the start date.';
        }
      }
    }

    // Reference Links validation (simple URL check)
    if (data.reference_links && !/^(ftp|http|https):\/\/[^ "]+$/.test(data.reference_links)) {
      errors.reference_links = 'Please enter a valid URL for reference links.';
    }

    return errors;
  };

  const handleTeamMemberChange = (employeeId) => {
    setFormData(prev => {
      const current = prev.assigned_users;
      if (current.includes(employeeId)) {
        return { ...prev, assigned_users: current.filter(id => id !== employeeId) };
      } else {
        return { ...prev, assigned_users: [...current, employeeId] };
      }
    });
  };

  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <FolderKanban size={24} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Edit Project</h2>
            <p className="text-sm text-slate-400">Modify project details below</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="mx-6 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
          {formError}
        </div>
      )}

      {/* Form */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <FolderKanban size={18} className="text-blue-500" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClasses}>
                <FileText size={14} />
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.name ? 'border-rose-500' : ''}`}
                placeholder="e.g., Q3 Brand Campaign"
                required
              />
              {validationErrors.name && <p className="text-rose-500 text-sm mt-1">{validationErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="client" className={labelClasses}>
                <Building2 size={14} />
                Client *
              </label>
              <select
                name="client"
                id="client"
                value={formData.client}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.client ? 'border-rose-500' : ''} cursor-pointer`}
                required
              >
                <option value="">Select a Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.client_name}</option>
                ))}
              </select>
              {validationErrors.client && <p className="text-rose-500 text-sm mt-1">{validationErrors.client}</p>}
            </div>
          </div>
        </div>

        {/* Project Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Layers size={18} className="text-purple-500" />
            Project Type
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="project_type"
                value="single_service"
                checked={formData.project_type === 'single_service'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-white">Single Service</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="project_type"
                value="package"
                checked={formData.project_type === 'package'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-white">Package</span>
            </label>
          </div>
        </div>

        {/* Service or Package Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Briefcase size={18} className="text-purple-500" />
            {formData.project_type === 'single_service' ? 'Select Service' : 'Select Package'}
          </h3>
          {formData.project_type === 'single_service' ? (
            <div>
              <label htmlFor="service" className={labelClasses}>
                Service *
              </label>
              <select
                name="service"
                id="service"
                value={formData.service}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.service ? 'border-rose-500' : ''} cursor-pointer`}
              >
                <option value="">Select a Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              {validationErrors.service && <p className="text-rose-500 text-sm mt-1">{validationErrors.service}</p>}
            </div>
          ) : (
            <div>
              <label htmlFor="package" className={labelClasses}>
                Package *
              </label>
              <select
                name="package"
                id="package"
                value={formData.package}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.package ? 'border-rose-500' : ''} cursor-pointer`}
              >
                <option value="">Select a Package</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} (${pkg.price})</option>
                ))}
              </select>
              {validationErrors.package && <p className="text-rose-500 text-sm mt-1">{validationErrors.package}</p>}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Flag size={18} className="text-amber-500" />
            Priority
          </h3>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.priority === option.value
                    ? 'ring-2 ring-blue-500 ' + option.color
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Calendar size={18} className="text-emerald-500" />
            Timeline & Budget
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="start_date" className={labelClasses}>
                <Calendar size={14} />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="due_date" className={labelClasses}>
                <Calendar size={14} />
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                id="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.due_date ? 'border-rose-500' : ''}`}
              />
              {validationErrors.due_date && <p className="text-rose-500 text-sm mt-1">{validationErrors.due_date}</p>}
            </div>
            <div>
              <label htmlFor="budget" className={labelClasses}>
                <DollarSign size={14} />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                id="budget"
                value={formData.budget}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label htmlFor="estimated_hours" className={labelClasses}>
                <Clock size={14} />
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimated_hours"
                id="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                className={inputClasses}
                placeholder="e.g., 120"
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Users size={18} className="text-violet-500" />
            Team Members
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-40 overflow-y-auto">
            {employees.map(employee => (
              <label key={employee.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.assigned_users.includes(employee.id)}
                  onChange={() => handleTeamMemberChange(employee.id)}
                  className="h-4 w-4 bg-slate-800 border-slate-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                  {employee.user?.name || employee.name || `Employee ${employee.id}`}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText size={18} className="text-slate-400" />
            Additional Details
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={inputClasses + " resize-none"}
                placeholder="Project description..."
              />
            </div>
            <div>
              <label htmlFor="initial_requirements" className={labelClasses}>Initial Requirements</label>
              <textarea
                name="initial_requirements"
                id="initial_requirements"
                value={formData.initial_requirements}
                onChange={handleChange}
                rows="3"
                className={inputClasses + " resize-none"}
                placeholder="Outline initial requirements..."
              />
            </div>
            <div>
              <label htmlFor="reference_links" className={labelClasses}>
                <Link size={14} />
                Reference Links
              </label>
              <input
                type="text"
                name="reference_links"
                id="reference_links"
                value={formData.reference_links}
                onChange={handleChange}
                className={`${inputClasses} ${validationErrors.reference_links ? 'border-rose-500' : ''}`}
                placeholder="Add relevant reference links..."
              />
              {validationErrors.reference_links && <p className="text-rose-500 text-sm mt-1">{validationErrors.reference_links}</p>}
            </div>
            <div>
              <label htmlFor="folder_structure_template" className={labelClasses}>
                <FolderKanban size={14} />
                Folder Structure Template
              </label>
              <select
                name="folder_structure_template"
                id="folder_structure_template"
                value={formData.folder_structure_template}
                onChange={handleChange}
                className={inputClasses + " cursor-pointer"}
              >
                <option value="">No Template Selected</option>
                {folderStructureTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="base_path" className={labelClasses}>
                <FolderKanban size={14} />
                Base Path for Folders
              </label>
              <input
                type="text"
                name="base_path"
                id="base_path"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                className={inputClasses}
                placeholder="/path/to/your/projects"
              />
            </div>
            <div>
              <label htmlFor="attachments" className={labelClasses}>
                <Paperclip size={14} />
                Attachments
              </label>
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleFileChange}
                className={inputClasses}
              />
              {attachments.length > 0 && (
                <p className="mt-2 text-sm text-slate-400">
                  Selected: {attachments.map(f => f.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

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
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProjectForm;