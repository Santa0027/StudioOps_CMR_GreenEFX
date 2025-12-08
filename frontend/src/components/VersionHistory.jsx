import React from 'react';

function VersionHistory({ projectName }) { // Accept projectName as a prop

  const versions = [
    {
      id: 'V3',
      status: 'Approved',
      description: 'Final lighting adjustments and color grading implemented. Ready for client delivery.',
      submittedBy: 'Alex Rivera',
      date: '24 July 2024 at 11:30 AM',
      avatar: 'https://i.pravatar.cc/150?img=6',
    },
    {
      id: 'V2',
      status: 'In Review',
      description: 'Added new neon sign assets and adjusted atmospheric fog effects.',
      submittedBy: 'Jane Doe',
      date: '23 July 2024 at 04:15 PM',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 'V1',
      status: 'Changes Requested',
      description: 'Initial scene blockout and primary asset placement. Awaiting feedback on composition.',
      submittedBy: 'Sam Lee',
      date: '22 July 2024 at 09:00 AM',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-600';
      case 'In Review':
        return 'bg-yellow-600';
      case 'Changes Requested':
        return 'bg-red-600';
      case 'Rejected':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="text-white"> {/* Removed min-h-screen bg-black p-6 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Version History for {decodeURIComponent(projectName)}</h2>
        {/* Buttons for Share and New Version, adjust as needed or remove if ProjectDetails handles them */}
        <div className="flex items-center space-x-4">
          <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.029 2.71m-6.029-2.71L12 9m6.029 2.71c.21.378.341.802.341 1.259h.001l.006.002.007.003h0a1 1 0 01.127.112l.024.028.027.03.031.035L21 15l-.29.356a1.002 1.002 0 01-1.353-.083L15.3 12m-3 0l6.029 2.71"
              />
            </svg>
            Share
          </button>
          {/* Removed "New Version" button as upload is handled in ProjectDetails */}
        </div>
      </div>

      {/* Filter Buttons (optional, could be removed if ProjectDetails handles filtering) */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          All
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Approved
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          In Review
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Changes Requested
        </button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Rejected
        </button>
      </div>

      {/* Version List */}
      <div className="space-y-8">
        {versions.map((version, index) => (
          <div key={index} className="flex relative pl-12">
            <div
              className={`absolute left-0 top-0 h-full w-2 flex flex-col items-center`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  version.status === 'Approved'
                    ? 'border-green-500 bg-green-500'
                    : version.status === 'In Review'
                    ? 'border-yellow-500 bg-yellow-500'
                    : 'border-red-500 bg-red-500'
                }`}
              ></div>
              {index < versions.length - 1 && (
                <div
                  className={`flex-grow border-l-2 ${
                    versions[index + 1].status === 'Approved'
                      ? 'border-green-500'
                      : versions[index + 1].status === 'In Review'
                      ? 'border-yellow-500'
                      : 'border-red-500'
                  }`}
                  style={{ marginLeft: '7px' }}
                ></div>
              )}
            </div>
            <div className="flex-grow bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold flex items-center">
                  {version.id}{' '}
                  <span
                    className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      version.status
                    )}`}
                  >
                    {version.status}
                  </span>
                </h3>
                <div className="flex space-x-4">
                  <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
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
                  <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{version.description}</p>
              <div className="flex items-center text-sm text-gray-400">
                <img
                  className="h-8 w-8 rounded-full mr-3"
                  src={version.avatar}
                  alt={version.submittedBy}
                />
                Submitted by <span className="font-semibold ml-1 text-white">{version.submittedBy}</span> on {version.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VersionHistory;
