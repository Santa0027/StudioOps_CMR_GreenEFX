import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, useNavigate } from 'react-router-dom';
import VersionHistory from './VersionHistory';
import { getProject } from '../api/api'; // NEW IMPORT

function ProjectDetails() {
  const { id } = useParams(); // Changed from projectName to id
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null); // State for fetched project data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [projectVersionFile, setProjectVersionFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await getProject(id); // Use id from useParams
        setProjectData(res.data);
      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Failed to fetch project details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]); // Depend on id

  const handleAssetUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newAssets = Array.from(files).map(file => ({
        name: file.webkitRelativePath || file.name, // Use webkitRelativePath for folder structure, fallback to name
        type: file.type,
        thumbnail: URL.createObjectURL(file), // Create a temporary URL for preview
      }));
      setUploadedAssets(prevAssets => [...prevAssets, ...newAssets]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-600'; // Using green for "In Progress" as per image
      default:
        return 'bg-gray-600';
    }
  };

  const handleVersionFileChange = (event) => {
    setProjectVersionFile(event.target.files[0]);
  };

  const handleUploadForApproval = async () => {
    if (projectVersionFile) {
      const formData = new FormData();
      formData.append('projectVersion', projectVersionFile);
      formData.append('projectName', projectData.name);

      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/projects/${encodeURIComponent(projectData.id)}/upload-version`, {
          method: 'POST',
          body: formData,
          // Depending on your backend, you might need to set headers like 'Content-Type': 'multipart/form-data'
          // However, fetch with FormData usually handles this automatically.
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Upload success:', result);
          alert('Project version uploaded successfully for approval!');
          setProjectVersionFile(null); // Clear selected file after upload
        } else {
          const errorText = await response.text();
          console.error('Upload error:', response.status, errorText);
          alert(`Failed to upload project version. Error: ${errorText}`);
        }
      } catch (error) {
        console.error('Network or other upload error:', error);
        alert('An error occurred during upload. Please try again.');
      }
    } else {
      alert('Please select a file to upload for approval.');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-6">Loading project details...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-6 text-red-500">Error: {error}</div>;
  if (!projectData) return <div className="min-h-screen bg-black text-white p-6">Project not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-4xl font-bold mr-4">{projectData.name}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              projectData.status
            )}`}
          >
            {projectData.status}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-800 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <button
            onClick={() => navigate(`/projects/${encodeURIComponent(projectData.id)}/version-history`)} // Using projectData.id
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
            title="View Version History"
          >
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
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </button>
          <button
            onClick={() => setShowUploadModal(true)} // Open modal on click
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            title="Upload for Approval"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a2 2 0 012 2v1l-1 1H9.5a1 1 0 00-.9.535l-.83 1.357a1 1 0 01-.9.535H6a1 1 0 01-1-1v-1a2 2 0 012-2h4a1 1 0 001-1V9a1 1 0 011-1h4a1 1 0 001-1v-.342a1 1 0 00-.342-.767L15 2l-.234-.234A1 1 0 0014 2h-4a1 1 0 00-1 1v1l-1 1H7a1 1 0 00-1 1v1a2 2 0 012 2h2m-7 6l2 2m0 0l2-2m-2 2v-6" />
            </svg>
            Upload for Approval
          </button>
        </div>
      </div>

      {/* Upload Project Version Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Upload Project Version</h2>
            <div className="mb-4">
              <label htmlFor="project-version-upload-modal" className="block text-gray-300 text-sm font-bold mb-2">
                Select File:
              </label>
              <input
                type="file"
                id="project-version-upload-modal"
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700 cursor-pointer"
                onChange={handleVersionFileChange}
              />
              {projectVersionFile && (
                <p className="mt-2 text-gray-300">Selected file: <span className="font-semibold">{projectVersionFile.name}</span></p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setProjectVersionFile(null); // Clear selected file when closing modal
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadForApproval}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${!projectVersionFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!projectVersionFile}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="text-gray-400 mb-6">
        <span>All Projects</span> / <span className="text-white">{projectData.name}</span>
      </div>

      <div className="relative"> {/* Changed to relative for floating element positioning */}
        {/* Main Content */}
        <div className="pr-[28rem] space-y-6"> {/* Adjusted right padding for aligned chat */}
          {/* Project Progress */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Project Progress</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600">
                    {projectData.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${projectData.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-200 mt-2">
              <span>Pre-production</span>
              <span>Production</span>
              <span>Post-production</span>
              <span>Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-gray-300 text-sm">Client Name</p>
                <p className="font-semibold">{projectData.client.name}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Start Date</p>
                <p className="font-semibold">{projectData.start_date}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Project Lead</p>
                <p className="font-semibold">{projectData.project_lead.username}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Deadline</p>
                <p className="font-semibold">{projectData.end_date}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            {/* Team Members */}
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
                <h2 className="text-2xl font-bold mb-4">Team Members</h2>
                <div className="space-y-4">
                  {projectData.assigned_users?.map((member, index) => (
                    <div key={index} className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full mr-4"
                        src={member.profile_picture || `https://i.pravatar.cc/150?img=${index + 1}`} // Assuming profile_picture exists or fallback
                        alt={member.username}
                      />
                      <div>
                        <p className="font-semibold">{member.username}</p>
                        {/* Assuming role might be part of the assignment or user model */}
                        {/* <p className="text-sm text-gray-400">{member.role}</p> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload for Approval Section */}
            <div className="w-full md:w-1/2 px-3">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
                <h2 className="text-2xl font-bold mb-4">Upload for Approval</h2>
                <div className="mb-4">
                  <label htmlFor="project-version-upload" className="block text-gray-300 text-sm font-bold mb-2">
                    Select File:
                  </label>
                  <input
                    type="file"
                    id="project-version-upload"
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-700 cursor-pointer"
                    onChange={handleVersionFileChange}
                  />
                  {projectVersionFile && (
                    <p className="mt-2 text-gray-300">Selected file: <span className="font-semibold">{projectVersionFile.name}</span></p>
                  )}
                </div>
                <button
                  onClick={handleUploadForApproval}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${!projectVersionFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!projectVersionFile}
                >
                  Upload Project Version
                </button>
              </div>
            </div>
          </div>

          {/* Initial Requirements */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Initial Requirements</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{projectData.description}</p>
          </div>

          {/* Reference Links */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Reference Links</h2>
            <p className="text-blue-400 break-all">{projectData.reference_links}</p>
          </div>

          {/* Attachments */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Attachments</h2>
            {projectData.attachments.length > 0 ? (
              <div className="space-y-2">
                {projectData.attachments.map((attachment, index) => (
                  <a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-4.507 4.507a2 2 0 11-2.828-2.828l.793-.793A4.001 4.001 0 0112 10.172v.001z"></path></svg>
                    {attachment.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No attachments.</p>
            )}
          </div>

          {/* Asset Library */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Asset Library</h2>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center mb-6">
              <label htmlFor="folder-upload" className="cursor-pointer block">
                <input
                  id="folder-upload"
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleAssetUpload}
                  className="hidden"
                />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a2 2 0 012 2v1l-1 1H9.5a1 1 0 00-.9.535l-.83 1.357a1 1 0 01-.9.535H6a1 1 0 01-1-1v-1a2 2 0 012-2h4a1 1 0 001-1V9a1 1 0 011-1h4a1 1 0 001-1v-.342a1 1 0 00-.342-.767L15 2l-.234-.234A1 1 0 0014 2h-4a1 1 0 00-1 1v1l-1 1H7a1 1 0 00-1 1v1a2 2 0 012 2h2m-7 6l2 2m0 0l2-2m-2 2v-6"
                  ></path>
                </svg>
                <p className="mt-2 text-gray-400">Click to upload folder or drag and drop</p>
                <p className="text-xs text-gray-500">FBX, OBJ, MP4, PNG, or JPG (or entire folders)</p>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {projectData.assets.map((asset, index) => (
                <div key={index} className="bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    className="w-full h-24 object-cover"
                    src={asset.thumbnail}
                    alt={asset.name}
                  />
                  <p className="p-2 text-sm truncate">{asset.name}</p>
                </div>
              ))}
              {uploadedAssets.map((asset, index) => (
                <div key={`uploaded-${index}`} className="bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    className="w-full h-24 object-cover"
                    src={asset.thumbnail}
                    alt={asset.name}
                  />
                  <p className="p-2 text-sm truncate">{asset.name}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Version History Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Project Versions</h2>
            <VersionHistory projectId={projectData.id} />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg fixed right-6 top-24 w-[29rem] h-[calc(100vh-12rem)] overflow-y-auto"> {/* Adjusted width for better alignment */}
          <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
          <div className="space-y-6">
            {projectData.activity_feed.map((activity, index) => (
              <div key={index} className="flex space-x-4">
                <img
                  className="h-10 w-10 rounded-full"
                  src={activity.avatar}
                  alt={activity.user}
                />
                <div>
                  <p>
                    <span className="font-semibold">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  {activity.assetName && (
                    <p className="text-blue-400 text-sm">{activity.assetName}</p>
                  )}
                  {activity.comment && (
                    <p className="text-gray-300 text-sm italic">{activity.comment}</p>
                  )}
                  {activity.task && (
                    <div className="flex items-center text-sm text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {activity.task}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="font-semibold mb-2">Add a comment...</h3>
            <div className="flex">
                <textarea
                    className="flex-grow bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Type your comment here..."
                ></textarea>
                <button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    >
                    <path
                        fillRule="evenodd"
                        d="M10.854 7.146a.5.5 0 010 .708L7.707 11.001l3.147 3.146a.5.5 0 01-.708.708l-3.5-3.5a.5.5 0 010-.708l3.5-3.5a.5.5 0 01.708 0z"
                        clipRule="evenodd"
                    />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
