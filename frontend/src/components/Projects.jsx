import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();
  const [projectsData, setProjectsData] = useState([
    {
      name: 'Project Alpha - ACME Corp',
      status: 'In Progress',
      team: 2,
      dueDate: '2024-10-15',
      progress: 75,
    },
    {
      name: 'Project Beta - Stark Industries',
      status: 'Review',
      team: 3,
      dueDate: '2024-09-30',
      progress: 90,
    },
    {
      name: 'Project Gamma - Wayne Enterprises',
      status: 'Completed',
      team: 1,
      dueDate: '2024-08-20',
      progress: 100,
    },
    {
      name: 'Project Delta - Cyberdyne Systems',
      status: 'On Hold',
      team: 2,
      dueDate: '2024-11-05',
      progress: 20,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-600';
      case 'Review':
        return 'bg-purple-600';
      case 'Completed':
        return 'bg-green-600';
      case 'On Hold':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Projects</h1>
        <button
          onClick={() => navigate('/projects/create')}
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
          New Project
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative">
          <select className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer">
            <option>Status</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer">
            <option>Assignee</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer">
            <option>Client</option>
            <option>ACME Corp</option>
            <option>Stark Industries</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer">
            <option>Due Date</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Team
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projectsData.map((project, index) => (
              <tr key={index}>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  <button
                    onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {project.name}
                  </button>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold text-white leading-tight rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
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
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  {project.dueDate}
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs">{project.progress}%</span>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 bg-gray-800 text-sm">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-5.729 5.729L14.293 4.293 10 0 5.707 4.293l5.729 5.729z" />
                        <path
                          fillRule="evenodd"
                          d="M10 17a7 7 0 100-14 7 7 0 000 14zm-1-9a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zm-.707 5.707a1 1 0 011.414 0L10 14.121l.793.793a1 1 0 01-1.414 1.414L10 15.879l-.793.793a1 1 0 01-1.414-1.414L10 14.121l-.707-.707z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.661 10.334c2.81-4.757 7.002-6.52 9.339-6.52s6.529 1.763 9.339 6.52c-.742 1.256-1.745 2.373-2.99 3.327-.978.76-2.094 1.348-3.328 1.742-1.233.394-2.548.586-3.882.586-1.334 0-2.649-.192-3.882-.586C3.053 14.034 2.124 12.81 1.382 11.554A15.987 15.987 0 01.661 10.334zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}/version-history`)}
                      className="text-gray-400 hover:text-white"
                      title="View Version History"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => alert(`Staging new version for ${project.name}`)} // Placeholder for staging action
                      className="text-gray-400 hover:text-white"
                      title="Stage New Version"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Projects;
