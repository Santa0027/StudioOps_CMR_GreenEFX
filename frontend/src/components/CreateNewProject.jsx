import React, { useState, useEffect } from 'react';

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

const CreateNewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [serviceType, setServiceType] = useState('3D Animation');
  const [selectionMode, setSelectionMode] = useState('package'); // 'package' or 'singleService'
  const [selectedPackage, setSelectedPackage] = useState('');
  const [singleServiceName, setSingleServiceName] = useState('');
  const [singleServiceBudget, setSingleServiceBudget] = useState('');
  const [singleServiceHours, setSingleServiceHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [initialRequirements, setInitialRequirements] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [attachments, setAttachments] = useState([]);

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
        setBudget('');
        setEstimateHours('');
        setDescription('');
        setInitialRequirements('');
      }
    } else { // selectionMode === 'singleService'
      setBudget(singleServiceBudget);
      setEstimateHours(singleServiceHours);
      setDescription(`Single service: ${singleServiceName}`);
      setInitialRequirements(`Service: ${singleServiceName}, Budget: $${singleServiceBudget}, Estimated Hours: ${singleServiceHours}`);
    }
  }, [selectedPackage, selectionMode, singleServiceName, singleServiceBudget, singleServiceHours]);

  const handleCreateProject = () => {
    // Logic to create a new project
    console.log({
      projectName,
      client,
      priority,
      serviceType,
      selectionMode,
      selectedPackage: selectionMode === 'package' ? selectedPackage : undefined,
      singleServiceName: selectionMode === 'singleService' ? singleServiceName : undefined,
      singleServiceBudget: selectionMode === 'singleService' ? singleServiceBudget : undefined,
      singleServiceHours: selectionMode === 'singleService' ? singleServiceHours : undefined,
      startDate,
      dueDate,
      budget, // This will reflect either package price or single service budget
      estimateHours, // This will reflect either package hours or single service hours
      teamMembers,
      description,
      initialRequirements,
      referenceLinks,
      attachments,
    });
    alert('Project creation functionality not yet implemented.');
  };

  const handleModeChange = (mode) => {
    setSelectionMode(mode);
    // Reset relevant fields when switching modes
    if (mode === 'package') {
      setSingleServiceName('');
      setSingleServiceBudget('');
      setSingleServiceHours('');
    } else { // mode === 'singleService'
      setSelectedPackage('');
    }
  };
  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const serviceTypeOptions = ['3D Animation', 'Graphic Design', 'Video Editing', 'Motion Graphics', 'VFX', 'Package'];

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Project
          </button>
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            {/* Notification Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            {/* User Avatar */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
        </div>
      </div>

      <p className="text-gray-400 mb-8">Fill in the details below to start a new project.</p>

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
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">Select a client</option>
                {/* Add client options here */}
                <option value="client1">Client A</option>
                <option value="client2">Client B</option>
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
              readOnly={selectionMode === 'package' ? !!selectedPackage : selectionMode === 'singleService'}
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
              readOnly={selectionMode === 'package' ? !!selectedPackage : selectionMode === 'singleService'}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">Assign Team Members</label>
          <div className="flex items-center space-x-2">
            {/* Example team members, replace with dynamic data */}
            <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center"></div>
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=JD" alt="User" className="rounded-full w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-300 flex items-center justify-center">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=AL" alt="User" className="rounded-full w-full h-full object-cover" />
            </div>
            <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 text-2xl hover:bg-gray-700">+</button>
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
            readOnly={selectionMode !== 'singleService' && !!selectedPackage}
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
            readOnly={selectionMode !== 'singleService' && !!selectedPackage}
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
          <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateProject}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};


export default CreateNewProject ;
