import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, useNavigate } from 'react-router-dom';
import VersionHistory from '../components/VersionHistory'
import { getProject, uploadProjectVersion } from '../api/api'; // NEW IMPORT and uploadProjectVersion

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
        console.log(res.data)
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
      case 'not_started':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'on_hold':
        return 'bg-yellow-600';
      case 'cancelled':
        return 'bg-red-600';
      case 'pending':
        return 'bg-orange-500';
      case 'active':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-700';
      default:
        return 'bg-gray-600';
    }
  };

  const getCompletionText = (status, progress) => {
    if (status === 'completed') {
      return `Completed`;
    } else if (status === 'pending' || status === 'not_started') {
      return `Pending`;
    } else if (status === 'in_progress' && progress > 0) {
      return `${Math.round(progress)}% In Progress`;
    } else if (status === 'in_progress' && progress === 0) {
      return `In Progress (0% complete)`;
    }
    return `Status: ${status.replace(/_/g, ' ')}`; // Fallback for other statuses
  };


  const handleVersionFileChange = (event) => {
    setProjectVersionFile(event.target.files[0]);
  };

  const handleUploadForApproval = async () => {
    if (projectVersionFile) {
      const formData = new FormData();
      formData.append('file', projectVersionFile); // Changed from projectVersion to file
      formData.append('project_name', projectData.name); // Keep project_name or remove if not needed by backend
      formData.append('description', `New version for ${projectData.name}`); // Add a default description
      formData.append('asset_role', 'final'); // Default asset_role, can be made dynamic
      formData.append('client_review', 'true'); // Default client_review, can be made dynamic

      try {
        const res = await uploadProjectVersion(projectData.id, formData); // Use the new API function
        console.log('Upload success:', res.data);
        alert('Project version uploaded successfully for approval!');
        setProjectVersionFile(null); // Clear selected file after upload
        setShowUploadModal(false); // Close modal on success
      } catch (err) {
        console.error('Upload error:', err.response ? err.response.data : err);
        alert(`Failed to upload project version. Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
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
        <div className="pr-0 space-y-6"> {/* Adjusted right padding for aligned chat */}
          {/* Project Progress */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Project Progress</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600">
                    {Math.round(projectData.overall_progress || 0)}%
                  </span>
                  <p className="text-sm text-gray-200 mt-1">Overall Project Completion</p>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${Math.round(projectData.overall_progress || 0)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-gray-300 text-sm">Client Name</p>
                <p className="font-semibold">{projectData.client_name}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Start Date</p>
                <p className="font-semibold">{projectData.start_date}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Project Lead</p>
                <p className="font-semibold">{projectData.created_by_details ? projectData.created_by_details.name : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Deadline</p>
                <p className="font-semibold">{projectData.end_date}</p>
              </div>
            </div>
          </div>

          {/* Project Workflow Section */}
          {projectData.stages && projectData.stages.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Project Workflow</h2>
              <div className="space-y-4">
                {projectData.stages.map((stage) => (
                  <div key={stage.id} className="bg-gray-700 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{stage.template_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                        {stage.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {/* Progress bar for each stage */}
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-500">
                                    {Math.round(stage.stage_progress || 0)}%
                                </span>
                                <p className="text-sm text-gray-300 mt-1">
                                  {getCompletionText(stage.status, stage.stage_progress || 0)}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-100">
                            <div
                                style={{ width: `${Math.round(stage.stage_progress || 0)}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400"
                            ></div>
                        </div>
                    </div>

                    {stage.elements && stage.elements.length > 0 ? (
                      <div className="space-y-3 mt-3"> {/* Changed ul to div for better styling control */}
                        {stage.elements.map((element) => (
                          <div key={element.id} className="bg-gray-600 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-md font-semibold">{element.template_name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(element.status)}`}>
                                {element.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {/* Progress bar for each element */}
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gradient-to-r from-green-500 to-teal-500">
                                            {Math.round(element.progress || 0)}% {/* Assuming element has a 'progress' field */}
                                        </span>
                                        <p className="text-sm text-gray-400 mt-1">
                                          {getCompletionText(element.status, element.progress || 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-0 text-xs flex rounded bg-teal-100">
                                    <div
                                        style={{ width: `${Math.round(element.progress || 0)}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400"
                                    ></div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No elements defined for this stage.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        src={member.profile_picture || `https://i.pravatar.cc/150?img=${member.id}`} // Assuming profile_picture exists or fallback
                        alt={member.name}
                        title={member.name}
                      />
                      <div>
                        <p className="font-semibold">{member.name}</p>
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
              {projectData.assets?.map((asset, index) => (
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
      </div>
    </div>
  );
}

export default ProjectDetails;
