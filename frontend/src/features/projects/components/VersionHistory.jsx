import React, { useState, useEffect } from 'react';
import { getProjectVersions } from '../../../shared/services/apiClient';

function VersionHistory({ projectId }) { // Accept projectId as a prop
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await getProjectVersions(projectId);
        setVersions(res.data);
      } catch (err) {
        console.error('Failed to fetch project versions:', err);
        setError('Failed to fetch project versions.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchVersions();
    }
  }, [projectId]);

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

  if (loading) return <div className="text-white">Loading version history...</div>;
  if (error) return <div className="text-white text-red-500">Error: {error}</div>;

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Version History for Project</h2>
      </div>

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
              </div>
              <p className="text-gray-300 mb-4">{version.description}</p>
              <div className="flex items-center text-sm text-gray-400">
                <img
                  className="h-8 w-8 rounded-full mr-3"
                  src={version.submitted_by.profile_picture || `https://i.pravatar.cc/150?img=${index + 1}`}
                  alt={version.submitted_by.username}
                />
                Submitted by <span className="font-semibold ml-1 text-white">{version.submitted_by.username}</span> on {new Date(version.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VersionHistory;
