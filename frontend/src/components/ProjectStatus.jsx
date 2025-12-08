import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProjectStatus() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    // Mock data for projects
    const mockProjects = [
      { id: 'proj1', name: 'CyberCorp Animation', status: 'In Progress', progress: 65, clientName: 'CyberCorp', startDate: '2024-08-01', deadline: '2024-12-15' },
      { id: 'proj2', name: 'EcoConnect Website', status: 'Pending Approval', progress: 80, clientName: 'EcoConnect', startDate: '2024-07-10', deadline: '2024-11-30' },
      { id: 'proj3', name: 'Quantum AI Research', status: 'Completed', progress: 100, clientName: 'Quantum Innovations', startDate: '2024-05-20', deadline: '2024-09-10' },
      { id: 'proj4', name: 'Global Marketing Campaign', status: 'On Hold', progress: 30, clientName: 'Global Brands', startDate: '2024-09-01', deadline: '2025-01-31' },
      { id: 'proj5', name: 'Mobile App Development', status: 'In Progress', progress: 45, clientName: 'Appify Inc.', startDate: '2024-10-01', deadline: '2025-03-15' },
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let currentProjects = projects;

    // Filter by search term
    if (searchTerm) {
      currentProjects = currentProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      currentProjects = currentProjects.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(currentProjects);
  }, [searchTerm, filterStatus, projects]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-green-600';
      case 'Pending Approval': return 'bg-yellow-600';
      case 'Completed': return 'bg-blue-600';
      case 'On Hold': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Project Status Overview</h1>
      </div>

      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search projects by name or client..."
          className="flex-grow bg-gray-800 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="bg-gray-800 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div key={project.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <div className="mt-4">
                <p className="text-gray-300 text-sm">Client: <span className="font-semibold">{project.clientName}</span></p>
                <p className="text-gray-300 text-sm">Start Date: <span className="font-semibold">{project.startDate}</span></p>
                <p className="text-gray-300 text-sm">Deadline: <span className="font-semibold">{project.deadline}</span></p>
              </div>
              <div className="relative pt-1 mt-4">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-600">
                      {project.progress}% Progress
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                  <div
                    style={{ width: `${project.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No projects found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

export default ProjectStatus;
