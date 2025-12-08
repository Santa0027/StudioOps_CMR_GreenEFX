import React from 'react';
import { useNavigate } from 'react-router-dom';

function ReworkRequests() {
  const reworkRequests = [
    {
      id: '#RW-1138',
      title: 'Adjust character lighting on Scene 5',
      project: 'Zenith',
      dueDate: '2024-10-28',
      status: 'In Progress',
      team: 2,
      borderColor: 'border-blue-500',
    },
    {
      id: '#RW-1139',
      title: 'Fix texture mapping on hero asset',
      project: 'Nova',
      dueDate: '2024-11-05',
      status: 'Pending Review',
      team: 2,
      borderColor: 'border-purple-500',
    },
    {
      id: '#RW-1132',
      title: 'Animate logo outro sequence',
      project: 'Apex',
      dueDate: '2024-10-15',
      status: 'Approved',
      team: 2,
      borderColor: 'border-green-500',
    },
    {
      id: '#RW-1140',
      title: 'Color grade final video edit',
      project: 'Zenith',
      dueDate: '2024-11-12',
      status: 'In Progress',
      team: 2,
      borderColor: 'border-cyan-500',
    },
    {
      id: '#RW-1135',
      title: 'Refine UI elements for mobile app',
      project: 'Apex',
      dueDate: '2024-10-22',
      status: 'Approved',
      team: 2,
      borderColor: 'border-lime-500',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-600';
      case 'Pending Review':
        return 'bg-purple-600';
      case 'Approved':
        return 'bg-green-600';
      case 'Rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const navigate = useNavigate();

  const handleViewDetails = (id) => {
    navigate(`/rework-requests/${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Rework Requests</h1>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
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
          New Rework Request
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-8">
        <div className="relative">
          <select className="bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer">
            <option>Status</option>
            <option>In Progress</option>
            <option>Pending Review</option>
            <option>Approved</option>
            <option>Rejected</option>
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
            <option>Project</option>
            <option>Zenith</option>
            <option>Nova</option>
            <option>Apex</option>
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
            <option>Date Range</option>
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

      {/* Rework Request List */}
      <div className="space-y-4">
        {reworkRequests.map((request, index) => (
          <div
            key={index}
            className={`bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 ${request.borderColor}`}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold">{request.id}</h3>
                <p className="text-gray-200">{request.title}</p>
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {Array.from({ length: request.team }).map((_, i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800"
                    src={`https://i.pravatar.cc/150?img=${i + 1}`}
                    alt=""
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <div>
                <p>Project: {request.project}</p>
                <p>Due: {request.dueDate}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
                <button
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                  onClick={() => handleViewDetails(request.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReworkRequests;
