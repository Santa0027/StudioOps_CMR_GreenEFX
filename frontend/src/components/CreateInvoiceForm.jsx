import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mockClients = [
  { id: 'CLIENT-001', name: 'Client Company Inc.' },
  { id: 'CLIENT-002', name: 'Global Tech Solutions' },
  { id: 'CLIENT-003', name: 'Creative Marketing Agency' },
];

const mockProjects = [
  {
    id: 'PROJ-2025-001',
    name: 'CRM StudioOps Project',
    clientId: 'CLIENT-001',
    startDate: '2025-01-15',
    endDate: '2025-03-31',
    tasks: [
      { description: 'Frontend UI development for user management module', hours: 40, rate: 75 },
      { description: 'Backend API integration for client data', hours: 60, rate: 80 },
      { description: 'Database schema design and implementation', hours: 30, rate: 90 },
      { description: 'Testing and bug fixing for core functionalities', hours: 25, rate: 70 },
    ],
    budget: 15000, // Example budget
  },
  {
    id: 'PROJ-2025-002',
    name: 'Website Redesign',
    clientId: 'CLIENT-002',
    startDate: '2025-02-01',
    endDate: '2025-04-15',
    tasks: [
      { description: 'Homepage UI/UX overhaul', hours: 50, rate: 85 },
      { description: 'Backend content management system integration', hours: 70, rate: 90 },
      { description: 'Mobile responsiveness implementation', hours: 30, rate: 75 },
    ],
    budget: 20000, // Example budget
  },
  {
    id: 'PROJ-2025-003',
    name: 'Social Media Campaign',
    clientId: 'CLIENT-003',
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    tasks: [
      { description: 'Strategy development and planning', hours: 20, rate: 100 },
      { description: 'Content creation for various platforms', hours: 40, rate: 60 },
      { description: 'Campaign monitoring and analytics', hours: 15, rate: 70 },
    ],
    budget: 10000, // Example budget
  },
  {
    id: 'PROJ-2025-004',
    name: 'Mobile App Development',
    clientId: 'CLIENT-001',
    startDate: '2025-04-01',
    endDate: '2025-07-31',
    tasks: [
      { description: 'iOS app UI/UX design', hours: 50, rate: 95 },
      { description: 'Android app development', hours: 70, rate: 90 },
      { description: 'API integration and testing', hours: 40, rate: 85 },
    ],
    budget: 25000, // Example budget
  },
];

const CreateInvoiceForm = () => {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    clientId: '', // New state for selected client
    selectedProjectIds: [], // Changed to an array for multiple projects
    clientName: '', // Auto-filled client name
    startDate: '',
    endDate: '',
    totalBudget: 0, // New state for total budget
    notes: ''
  });
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectInsights, setSelectedProjectInsights] = useState(null);

  useEffect(() => {
    // Filter projects based on selected client
    if (invoiceData.clientId) {
      setAvailableProjects(mockProjects.filter(project => project.clientId === invoiceData.clientId));
    } else {
      setAvailableProjects([]);
    }
    // Clear project selection and insights when client changes
    setInvoiceData(prev => ({
      ...prev,
      selectedProjectIds: [],
      clientName: invoiceData.clientId ? mockClients.find(c => c.id === invoiceData.clientId)?.name : '',
      startDate: '',
      endDate: '',
      totalBudget: 0,
    }));
    setSelectedProjectInsights(null);
  }, [invoiceData.clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    setInvoiceData(prev => ({ ...prev, clientId }));
  };

  const handleProjectSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    const selectedProjects = mockProjects.filter(p => selectedOptions.includes(p.id));

    let totalBudget = 0;
    const projectWorks = [];
    let earliestStartDate = '';
    let latestEndDate = '';

    if (selectedProjects.length > 0) {
      selectedProjects.forEach(project => {
        totalBudget += project.budget;
        projectWorks.push({
          projectName: project.name,
          budget: project.budget,
          tasks: project.tasks.map(task => task.description)
        });

        if (!earliestStartDate || new Date(project.startDate) < new Date(earliestStartDate)) {
          earliestStartDate = project.startDate;
        }
        if (!latestEndDate || new Date(project.endDate) > new Date(latestEndDate)) {
          latestEndDate = project.endDate;
        }
      });
    }

    setInvoiceData(prev => ({
      ...prev,
      selectedProjectIds: selectedOptions,
      startDate: earliestStartDate,
      endDate: latestEndDate,
      totalBudget: totalBudget,
    }));

    setSelectedProjectInsights(selectedProjects.length > 0 ? {
      totalBudget,
      projectWorks,
    } : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Invoice Data Submitted:", invoiceData);
    // In a real application, you would send this data to a backend API
    // For now, redirect to the invoices list page
    navigate('/invoice');
  };

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Create New Invoice</h1>

      <form onSubmit={handleSubmit}>
        {/* Client and Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-300">Select Client</label>
              <select
                id="clientId"
                name="clientId"
                value={invoiceData.clientId}
                onChange={handleClientSelect}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">-- Select a Client --</option>
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">Client Name</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={invoiceData.clientName}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="selectedProjectIds" className="block text-sm font-medium text-gray-300">Select Projects to Invoice</label>
              <select
                id="selectedProjectIds"
                name="selectedProjectIds"
                multiple
                value={invoiceData.selectedProjectIds}
                onChange={handleProjectSelect}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                required
              >
                {availableProjects.length > 0 ? (
                  availableProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No projects available for this client</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Combined Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={invoiceData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">Combined End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={invoiceData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>
          </div>
          {selectedProjectInsights && (
            <div className="lg:col-span-1 p-4 bg-gray-800 rounded-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Project Insights:</h3>
              <p className="text-gray-300"><span className="font-medium">Total Project Budget:</span> ${selectedProjectInsights.totalBudget.toFixed(2)}</p>
              <p className="text-gray-300 mb-2 mt-4"><span className="font-medium">Project Breakdown:</span></p>
              <div className="space-y-2">
                {selectedProjectInsights.projectWorks.map((proj, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded-md">
                    <p className="text-gray-200 font-semibold">{proj.projectName} - <span className="text-green-400">${proj.budget.toFixed(2)}</span></p>
                    <ul className="list-disc list-inside text-gray-400 ml-4">
                      {proj.tasks.map((taskDesc, taskIdx) => (
                        <li key={taskIdx}>{taskDesc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Total Budget */}
        <div className="mb-6">
          <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-300">Total Invoice Amount (Project Budget)</label>
          <input
            type="text"
            id="totalBudget"
            name="totalBudget"
            value={`$${invoiceData.totalBudget.toFixed(2)}`}
            readOnly
            className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 font-bold text-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={invoiceData.notes}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow-lg transition-colors duration-200"
          >
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoiceForm;
