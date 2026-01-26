import React, { useState, useEffect } from 'react';
import { updateProject, getClients, getEmployees } from '../api/api'; // Import API functions

const mockPackages = [
  {
    id: 'PKG-001',
    name: 'Social Media Monthly Standard',
    description: 'Standard monthly package for social media content.',
    items: [
      { name: 'Static Posters', quantity: 4, unit: 'count' },
      { name: 'Short Video Reels', quantity: 1, unit: 'count' },
      { name: 'Motion Graphics', quantity: 1, unit: 'count' },
    ],
    price: 1500,
    frequency: 'Monthly',
  },
  {
    id: 'PKG-002',
    name: 'Website Launch Package',
    description: 'Comprehensive package for launching a new website.',
    items: [
      { name: 'Website Pages Design', quantity: 5, unit: 'count' },
      { name: 'Content Writing', quantity: 10, unit: 'pages' },
      { name: 'SEO Setup', quantity: 1, unit: 'project' },
    ],
    price: 5000,
    frequency: 'One-time',
  },
];

const EditProjectForm = ({ project, onClose, onProjectUpdated }) => {
  const [projectName, setProjectName] = useState(project.name || '');
  const [clientId, setClientId] = useState(project.client || '');
  const [priority, setPriority] = useState(project.priority || 'Medium');
  const [serviceType, setServiceType] = useState(project.service_type || '3D Animation');
  const [selectionMode, setSelectionMode] = useState('package'); // Assume default or determine from project data
  const [selectedPackage, setSelectedPackage] = useState(''); // Need to map project services to packages
  const [singleServiceName, setSingleServiceName] = useState(''); // Need to map project services to single service
  const [singleServiceBudget, setSingleServiceBudget] = useState('');
  const [singleServiceHours, setSingleServiceHours] = useState('');
  const [startDate, setStartDate] = useState(project.start_date || '');
  const [dueDate, setDueDate] = useState(project.due_date || '');
  const [budget, setBudget] = useState(project.budget || '');
  const [estimateHours, setEstimateHours] = useState(project.estimated_hours || '');
  const [teamMembers, setTeamMembers] = useState(project.assigned_users ? project.assigned_users.map(user => user.id) : []);
  const [description, setDescription] = useState(project.description || '');
  const [initialRequirements, setInitialRequirements] = useState(project.initial_requirements || '');
  const [referenceLinks, setReferenceLinks] = useState(project.reference_links || '');
  const [attachments, setAttachments] = useState([]); // Handle existing attachments if any, for now new only
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clientsRes = await getClients();
        setClients(clientsRes.data);
        const employeesRes = await getEmployees();
        setEmployees(employeesRes.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setFormError('Failed to load clients or employees.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    setProjectName(project.name || '');
    setClientId(project.client || '');
    setPriority(project.priority || 'Medium');
    setServiceType(project.service_type || '3D Animation');
    setStartDate(project.start_date || '');
    setDueDate(project.due_date || '');
    setBudget(project.budget || '');
    setEstimateHours(project.estimated_hours || '');
    setTeamMembers(project.assigned_users ? project.assigned_users.map(user => user.id) : []);
    setDescription(project.description || '');
    setInitialRequirements(project.initial_requirements || '');
    setReferenceLinks(project.reference_links || '');
    // Reset selection mode and package/single service fields if needed based on project data
  }, [project]);

  useEffect(() => {
    if (selectionMode === 'package') {
      if (selectedPackage) {
        const pkg = mockPackages.find(p => p.id === selectedPackage);
        if (pkg) {
          setBudget(pkg.price.toString());
          const totalHours = pkg.items.reduce((sum, item) => sum + (item.quantity * (item.unit === 'count' ? 8 : 1)), 0);
          setEstimateHours(totalHours.toString());
          setDescription(pkg.description);
          setInitialRequirements(pkg.items.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', '));
        }
      } else {
        // If no package selected, clear fields, but only if they weren't pre-filled by the project prop
        if (!project.budget && !project.estimated_hours) {
          setBudget('');
          setEstimateHours('');
          setDescription('');
          setInitialRequirements('');
        }
      }
    } else { // selectionMode === 'singleService'
      setBudget(singleServiceBudget);
      setEstimateHours(singleServiceHours);
      setDescription(`Single service: ${singleServiceName}`);
      setInitialRequirements(`Service: ${singleServiceName}, Budget: $${singleServiceBudget}, Estimated Hours: ${singleServiceHours}`);
    }
  }, [selectedPackage, selectionMode, singleServiceName, singleServiceBudget, singleServiceHours, project]);


  const handleSubmit = async () => {
    setLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', projectName);
    formData.append('client', clientId);
    formData.append('priority', priority);
    formData.append('service_type', serviceType);
    formData.append('start_date', startDate);
    formData.append('due_date', dueDate);
    formData.append('budget', budget);
    formData.append('estimated_hours', estimateHours);
    formData.append('description', description);
    formData.append('initial_requirements', initialRequirements);
    formData.append('reference_links', referenceLinks);

    teamMembers.forEach(memberId => {
      formData.append('assigned_users', memberId);
    });

    attachments.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      await updateProject(project.id, formData);
      alert('Project updated successfully!');
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
        alert(`Failed to update project: ${errorMessages.join('; ')}`);
      } else {
        setFormError('Failed to update project. Please check your input.');
        alert('Failed to update project. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setSelectionMode(mode);
    if (mode === 'package') {
      setSingleServiceName('');
      setSingleServiceBudget('');
      setSingleServiceHours('');
    } else {
      setSelectedPackage('');
    }
  };

  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  const handleTeamMemberChange = (e) => {
    const options = e.target.options;
    const selectedMembers = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selectedMembers.push(options[i].value);
      }
    }
    setTeamMembers(selectedMembers);
  };

  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const serviceTypeOptions = ['3D Animation', 'Graphic Design', 'Video Editing', 'Motion Graphics', 'VFX', 'Package'];

  return (
    <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Edit Project</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
      </div>

      {formError && (
        <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">
          {formError}
        </div>
      )}

      <p className="text-gray-400 mb-8">Modify the details below to update the project.</p>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="projectName" className="block text-gray-300 text-sm font-bold mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              placeholder="e.g. Q3 Brand Campaign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-gray-300 text-sm font-bold mb-2">
              Client
            </label>
            <div className="relative">
              <select
                id="client"
                className="block appearance-none w-full bg-gray-700 border border-gray-600 text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.client_name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Project Type</label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              className={`py-2 px-4 rounded ${
                selectionMode === 'package' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => handleModeChange('package')}
            >
              Select Package
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded ${
                selectionMode === 'singleService' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => handleModeChange('singleService')}
            >
              Single Service (One-time)
            </button>
          </div>

          {selectionMode === 'package' && (
            <div className="relative">
              <label htmlFor="package" className="block text-gray-300 text-sm font-bold mb-2">Select Package (Optional)</label>
              <select
                id="package"
                className="block appearance-none w-full bg-gray-700 border border-gray-600 text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
              >
                <option value="">-- No Package Selected --</option>
                {mockPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} (${pkg.price})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}

          {selectionMode === 'singleService' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="singleServiceName" className="block text-gray-300 text-sm font-bold mb-2">Service Name</label>
                <div className="relative">
                  <select
                    id="singleServiceName"
                    className="block appearance-none w-full bg-gray-700 border border-gray-600 text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                    value={singleServiceName}
                    onChange={(e) => setSingleServiceName(e.target.value)}
                    required={selectionMode === 'singleService'}
                  >
                    <option value="">Select a service</option>
                    {serviceTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="singleServiceBudget" className="block text-gray-300 text-sm font-bold mb-2">Service Budget</label>
                <input
                  type="number"
                  id="singleServiceBudget"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                  placeholder="e.g. 1000"
                  value={singleServiceBudget}
                  onChange={(e) => setSingleServiceBudget(e.target.value)}
                  required={selectionMode === 'singleService'}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="singleServiceHours" className="block text-gray-300 text-sm font-bold mb-2">Estimated Hours</label>
                <input
                  type="number"
                  id="singleServiceHours"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                  placeholder="e.g. 40"
                  value={singleServiceHours}
                  onChange={(e) => setSingleServiceHours(e.target.value)}
                  required={selectionMode === 'singleService'}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Priority</label>
          <div className="flex space-x-2">
            {priorityOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`py-2 px-4 rounded ${
                  priority === option ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setPriority(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Service Type</label>
          <div className="flex flex-wrap gap-2">
            {serviceTypeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`py-2 px-4 rounded ${
                  serviceType === option ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setServiceType(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-gray-300 text-sm font-bold mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="budget" className="block text-gray-300 text-sm font-bold mb-2">
              Budget
            </label>
            <input
              type="text"
              id="budget"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              placeholder="$ 5,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              readOnly={selectionMode === 'package' && !!selectedPackage || selectionMode === 'singleService'}
              required
            />
          </div>
          <div>
            <label htmlFor="estimateHours" className="block text-gray-300 text-sm font-bold mb-2">
              Estimate (Hours)
            </label>
            <input
              type="number"
              id="estimateHours"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
              placeholder="120"
              value={estimateHours}
              onChange={(e) => setEstimateHours(e.target.value)}
              readOnly={selectionMode === 'package' && !!selectedPackage || selectionMode === 'singleService'}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Assign Team Members</label>
          <div className="relative">
            <select
              multiple
              className="block appearance-none w-full bg-gray-700 border border-gray-600 text-gray-300 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline h-32"
              value={teamMembers}
              onChange={handleTeamMemberChange}
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.user.name} ({employee.user.email})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">
            Description / Notes
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-32"
            placeholder="Add any additional notes or details about the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            readOnly={selectionMode === 'package' && !!selectedPackage}
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="initialRequirements" className="block text-gray-300 text-sm font-bold mb-2">
            Initial Requirements
          </label>
          <textarea
            id="initialRequirements"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-32"
            placeholder="Outline initial requirements for the project..."
            value={initialRequirements}
            onChange={(e) => setInitialRequirements(e.target.value)}
            readOnly={selectionMode === 'package' && !!selectedPackage}
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="referenceLinks" className="block text-gray-300 text-sm font-bold mb-2">
            Reference Links
          </label>
          <input
            type="text"
            id="referenceLinks"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
            placeholder="Add relevant reference links (e.g., Figma, Trello, Confluence)"
            value={referenceLinks}
            onChange={(e) => setReferenceLinks(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="attachments" className="block text-gray-300 text-sm font-bold mb-2">
            Attachments
          </label>
          <input
            type="file"
            id="attachments"
            multiple
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
            onChange={handleFileChange}
          />
          {attachments.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              Selected files: {attachments.map(file => file.name).join(', ')}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectForm;