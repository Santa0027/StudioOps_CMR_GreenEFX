import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNewTaskForm from './CreateNewTaskForm';
import AssignTaskForm from './AssignTaskForm';

function TaskPage() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'rework', 'assigned'

  const handleOpenCreateTaskForm = () => setIsFormOpen(true);
  const handleCloseCreateTaskForm = () => setIsFormOpen(false);

  const handleOpenAssignTaskForm = () => setIsAssignFormOpen(true);
  const handleCloseAssignTaskForm = () => setIsAssignFormOpen(false);

  const myTasks = [
    {
      id: 1,
      title: 'Character Rigging for "Project Nebula"',
      dueDate: 'Due in 2 days',
      project: 'Project Nebula',
      type: 'normal',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Animate Walk Cycle - Main Character (Rework)',
      dueDate: 'Due in 4 days',
      project: 'Project Cygnus',
      type: 'rework',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.854 7.146A.5.5 0 0111 7h.001v.001H11v-.001-.001h.001a.5.5 0 01.354.146l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708 0l-1-1a.5.5 0 010-.708L12.293 12H5a.5.5 0 01-.5-.5V11a.5.5 0 01.5-.5h7.293L9.146 8.854a.5.5 0 01.708-.708l1 1z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Concept Art for Alien Flora (Assigned)',
      dueDate: 'Due: Tomorrow',
      project: 'Project Orion',
      type: 'assigned',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m15.364 7.364l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Render Scene 24 Final Shots',
      dueDate: 'Due in 6 days',
      project: 'Project Cygnus',
      type: 'normal',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const activeProjects = [
    {
      name: 'Project Cygnus',
      type: 'Animated Short',
      progress: 75,
      deadline: 'Dec 15, 2024',
      team: 2,
    },
    {
      name: 'Project Nebula',
      type: 'VFX for Film',
      progress: 40,
      deadline: 'Feb 28, 2025',
      team: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, Alex!</h1>
          <p className="text-gray-400">Here's what's happening today.</p>
        </div>
        <div className="flex space-x-4"> {/* Container for buttons */}
          <button
            onClick={handleOpenCreateTaskForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Task
          </button>
          <button
            onClick={handleOpenAssignTaskForm}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.49 0-2.92.6-4 1.72V19h8v-3.28c-1.08-1.12-2.51-1.72-4-1.72z"
              />
            </svg>
            Assign Task
          </button>
        </div>
      </div>

      {isFormOpen && <CreateNewTaskForm onClose={handleCloseCreateTaskForm} />}
      {isAssignFormOpen && <AssignTaskForm onClose={handleCloseAssignTaskForm} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area (Task Management) */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6">My Tasks</h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCurrentFilter('all')}
              className={`${currentFilter === 'all' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setCurrentFilter('rework')}
              className={`${currentFilter === 'rework' ? 'bg-red-600' : 'bg-gray-800'} hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              Rework Requests
            </button>
            <button
              onClick={() => setCurrentFilter('assigned')}
              className={`${currentFilter === 'assigned' ? 'bg-yellow-600' : 'bg-gray-800'} hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              Assigned by User
            </button>
          </div>

          {/* My Tasks List */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            {myTasks
              .filter(task => currentFilter === 'all' ? true : task.type === currentFilter)
              .map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition-colors
                    ${task.type === 'rework' ? 'border-l-4 border-red-500' : ''}
                    ${task.type === 'assigned' ? 'border-l-4 border-yellow-500' : ''}
                  `}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    {task.icon}
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-400">{task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-500 text-sm">{task.project}</p>
                    {task.type === 'rework' && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Rework</span>
                    )}
                    {task.type === 'assigned' && (
                      <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Assigned</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Active Projects Section (Smaller Column) */}
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-bold mb-6">Active Projects</h2>
          <div className="space-y-6">
            {activeProjects.map((project, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <div className="flex -space-x-2 overflow-hidden">
                    {Array.from({ length: project.team }).map((_, i) => (
                      <img
                        key={i}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800"
                        src={`https://i.pravatar.cc/150?img=${i + 1}`}
                        alt=""
                      />
                    ))}
                  </div>
                </div>
                <p className="text-blue-400 text-sm mb-4">{project.type}</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Deadline: {project.deadline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskPage;
