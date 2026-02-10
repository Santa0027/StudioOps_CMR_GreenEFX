import React from 'react';
import { useParams, Link } from 'react-router-dom';

function ReworkRequestDetails() {
  const { id } = useParams();

  // This is placeholder data for demonstration. In a real application,
  // you would fetch this data from an API based on the 'id' parameter.
  const allReworkRequests = [
    // {
    {
      id: '#RW-1138',
      title: 'Adjust character lighting on Scene 5',
      project: 'Zenith',
      dueDate: '2024-10-28',
      status: 'In Progress',
      team: 2,
      borderColor: 'border-blue-500',
      description: 'The lighting on characters in Scene 5 needs to be adjusted to match the mood of the scene more accurately. Focus on subtle shadows and highlights.',
      client: {
        name: 'QuantumLeap Innovations',
        requestDetails: 'Client requested character lighting adjustments to align with the new dramatic tone established in the latest script revision. Specifically, softer fill lights and more pronounced rim lighting are desired to create a starker contrast and emphasize character emotions. The existing setup is too bright and cheerful for the current narrative.',
        contactEmail: 'alina.petrova@quantumleap.com',
      },
      attachments: ['scene5_lighting_ref.jpg', 'scene5_notes.pdf'],
      comments: [
        { user: 'John Doe', text: 'Agreed, the current lighting is too flat.', date: '2024-10-25' },
        { user: 'Jane Smith', text: 'I\'ll start working on this today.', date: '2024-10-26' },
      ],
      history: [
        { action: 'Created', by: 'Admin', date: '2024-10-24' },
        { action: 'Assigned', by: 'Admin', to: 'Jane Smith', date: '2024-10-25' },
        { action: 'Status Change', by: 'Jane Smith', from: 'Pending', to: 'In Progress', date: '2024-10-26' },
      ],
    },
    {
      id: '#RW-1139',
      title: 'Fix texture mapping on hero asset',
      project: 'Nova',
      dueDate: '2024-11-05',
      status: 'Pending Review',
      team: 2,
      borderColor: 'border-purple-500',
      description: 'The main hero asset has visible seams and stretching in its textures. Needs proper UV unwrapping and re-texturing.',
      attachments: ['hero_asset_issue.png'],
      comments: [],
      history: [
        { action: 'Created', by: 'Admin', date: '2024-11-01' },
        { action: 'Status Change', by: 'Admin', from: 'Open', to: 'Pending Review', date: '2024-11-03' },
      ],
    },
    {
      id: '#RW-1132',
      title: 'Animate logo outro sequence',
      project: 'Apex',
      dueDate: '2024-10-15',
      status: 'Approved',
      team: 2,
      borderColor: 'border-green-500',
      description: 'Create a dynamic and engaging animation for the company logo at the end of all promotional videos.',
      attachments: ['logo_style_guide.pdf'],
      comments: [
        { user: 'Emily White', text: 'Looks great! Approved for final render.', date: '2024-10-14' },
      ],
      history: [
        { action: 'Created', by: 'Admin', date: '2024-10-10' },
        { action: 'Status Change', by: 'Admin', from: 'Open', to: 'Approved', date: '2024-10-14' },
      ],
    },
    {
      id: '#RW-1140',
      title: 'Color grade final video edit',
      project: 'Zenith',
      dueDate: '2024-11-12',
      status: 'In Progress',
      team: 2,
      borderColor: 'border-cyan-500',
      description: 'Apply consistent color grading across the entire final video edit to ensure a cohesive visual style.',
      attachments: ['color_grading_luts.zip'],
      comments: [],
      history: [
        { action: 'Created', by: 'Admin', date: '2024-11-08' },
        { action: 'Assigned', by: 'Admin', to: 'Sarah Green', date: '2024-11-09' },
      ],
    },
    {
      id: '#RW-1135',
      title: 'Refine UI elements for mobile app',
      project: 'Apex',
      dueDate: '2024-10-22',
      status: 'Approved',
      team: 2,
      borderColor: 'border-lime-500',
      description: 'Iterate on the mobile app UI elements, focusing on responsiveness and user experience on smaller screens.',
      attachments: ['mobile_ui_mockups.fig'],
      comments: [
        { user: 'Michael Brown', text: 'The latest mockups look solid, proceeding to implementation.', date: '2024-10-20' },
      ],
      history: [
        { action: 'Created', by: 'Admin', date: '2024-10-18' },
        { action: 'Status Change', by: 'Admin', from: 'Review', to: 'Approved', date: '2024-10-21' },
      ],
    },
  ];

  const reworkRequest = allReworkRequests.find(req => req.id === id);

  if (!reworkRequest) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Rework Request Not Found</h1>
        <Link to="/rework-requests" className="text-blue-400 hover:underline">
          Back to Rework Requests
        </Link>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Link to="/rework-requests" className="text-blue-400 hover:underline mb-4 block">
        &larr; Back to Rework Requests
      </Link>
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">{reworkRequest.title}</h1>
            <p className="text-gray-400 text-lg">Request ID: {reworkRequest.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              reworkRequest.status
            )}`}
          >
            {reworkRequest.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Project Details</h2>
            <p className="text-gray-300">Project: <span className="font-bold">{reworkRequest.project}</span></p>
            <p className="text-gray-300">Due Date: <span className="font-bold">{reworkRequest.dueDate}</span></p>
            <p className="text-gray-300">Assigned Team: </p>
            <div className="flex -space-x-2 overflow-hidden mt-2">
              {Array.from({ length: reworkRequest.team }).map((_, i) => (
                <img
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-900"
                  src={`https://i.pravatar.cc/150?img=${i + 1}`}
                  alt=""
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">{reworkRequest.description}</p>
          </div>
        </div>

        {reworkRequest.attachments && reworkRequest.attachments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Attachments</h2>
            <ul className="list-disc list-inside text-gray-300">
              {reworkRequest.attachments.map((attachment, index) => (
                <li key={index} className="text-blue-400 hover:underline cursor-pointer">
                  {attachment}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reworkRequest.comments && reworkRequest.comments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Comments</h2>
            <div className="space-y-4">
              {reworkRequest.comments.map((comment, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-md">
                  <p className="text-gray-200">
                    <span className="font-bold">{comment.user}</span> on {comment.date}:
                  </p>
                  <p className="text-gray-300 mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reworkRequest.history && reworkRequest.history.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-3">Activity History</h2>
            <ul className="space-y-2 text-gray-300">
              {reworkRequest.history.map((entry, index) => (
                <li key={index} className="flex items-center">
                  <span className="h-2 w-2 bg-gray-500 rounded-full mr-3"></span>
                  <span>
                    <span className="font-bold">{entry.by}</span>{' '}
                    {entry.action === 'Status Change'
                      ? `changed status from "${entry.from}" to "${entry.to}"`
                      : entry.action === 'Assigned'
                      ? `assigned this to ${entry.to}`
                      : entry.action}{' '}
                    on {entry.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReworkRequestDetails;
