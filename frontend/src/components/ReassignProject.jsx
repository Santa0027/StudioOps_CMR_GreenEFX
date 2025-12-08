import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ReassignProject() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [currentLead, setCurrentLead] = useState('');

  useEffect(() => {
    // Mock data for projects and users
    const mockProjects = [
      { id: 'proj1', name: 'CyberCorp Animation', currentLead: 'Alex Ray', status: 'In Progress' },
      { id: 'proj2', name: 'EcoConnect Website', currentLead: 'Maria Garcia', status: 'Pending Approval' },
      { id: 'proj3', name: 'Quantum AI Research', currentLead: 'Ken Tanaka', status: 'Completed' },
    ];
    const mockUsers = [
      { id: 'user1', name: 'Alex Ray', role: 'Project Lead' },
      { id: 'user2', name: 'Maria Garcia', role: '3D Modeler' },
      { id: 'user3', name: 'Ken Tanaka', role: 'Animator' },
      { id: 'user4', name: 'Chloe Kim', role: 'VFX Artist' },
    ];
    setProjects(mockProjects);
    setUsers(mockUsers);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      setCurrentLead(project ? project.currentLead : '');
    } else {
      setCurrentLead('');
    }
  }, [selectedProject, projects]);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProject && selectedUser) {
      alert(`Project "${projects.find(p => p.id === selectedProject)?.name}" reassigned to "${users.find(u => u.id === selectedUser)?.name}"`);
      // Here you would typically send this data to your backend API
      navigate('/projects'); // Navigate back to projects page or project details
    } else {
      alert('Please select a project and a new user.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Reassign Project User</h1>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project-select" className="block text-gray-300 text-sm font-bold mb-2">
              Select Project:
            </label>
            <select
              id="project-select"
              className="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedProject}
              onChange={handleProjectChange}
              required
            >
              <option value="">-- Select a Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
          </div>

          {currentLead && (
            <div className="mb-4">
              <p className="block text-gray-300 text-sm font-bold mb-2">Current Project Lead:</p>
              <p className="text-white text-lg font-semibold">{currentLead}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="user-select" className="block text-gray-300 text-sm font-bold mb-2">
              Reassign to New User:
            </label>
            <select
              id="user-select"
              className="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedUser}
              onChange={handleUserChange}
              required
            >
              <option value="">-- Select a User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Reassign Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReassignProject;
