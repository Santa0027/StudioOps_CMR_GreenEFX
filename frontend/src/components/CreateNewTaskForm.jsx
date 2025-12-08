import React, { useState } from 'react';

const CreateNewTaskForm = ({ onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [status, setStatus] = useState('Pending');

  const projects = [
    { name: 'Project Nebula', status: 'In Progress', version: '1.2.0' },
    { name: 'Project Cygnus', status: 'Pending', version: '1.0.0' },
    { name: 'Project Orion', status: 'Completed', version: '2.1.0' },
    { name: 'Project Apollo', status: 'Blocked', version: '0.9.0' },
  ];

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProjectName(projectName);
    const projectDetail = projects.find(p => p.name === projectName);
    setSelectedProjectDetails(projectDetail);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend API
    console.log({ taskName, description, dueDate, selectedProjectName, selectedProjectDetails, status });
    alert('Task created successfully!');
    onClose(); // Close the form after submission
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-2xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="taskName" className="block text-white text-sm font-bold mb-2">Task Name:</label>
            <input
              type="text"
              id="taskName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-white text-sm font-bold mb-2">Description:</label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
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
              value={selectedProjectName}
              onChange={handleProjectChange}
              required
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedProjectDetails && (
              <div className="mt-2 text-sm text-gray-400">
                <p>Status: {selectedProjectDetails.status}</p>
                <p>Version: {selectedProjectDetails.version}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-white text-sm font-bold mb-2">Status:</label>
            <select
              id="status"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Blocked</option>
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
