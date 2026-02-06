import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams } from 'react-router-dom';
import { getProjectStageElement, getTaskComments, createTaskComment, uploadAssetForStageElement } from '../api/api'; // Added comment and upload functions
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const GraphicDesignReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">Graphic Design Review</h3>
    <p>Color Palette: {reviewData.colorPalette?.join(', ')}</p>
    <p>Style Guide: {reviewData.styleGuide}</p>
    {/* Add specific graphic design tools/views here */}
  </div>
);

const Animation3DReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">3D Animation Review</h3>
    <p>Key Rigging Areas: {reviewData.keyAreas?.join(', ')}</p>
    <p>Rig Complexity: {reviewData.rigComplexity}</p>
    {/* Add specific 3D animation tools/views here */}
  </div>
);

const VideoEditingReview = ({ reviewData }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">Video Editing Review</h3>
    <p>Timeline Segments: {reviewData.timelineSegments?.join(', ')}</p>
    <p>FPS: {reviewData.fps}</p>
    {/* Add specific video editing tools/views here */}
  </div>
);

const ASSET_TYPES = [
  { value: 'psd', label: 'Photoshop' },
  { value: 'ai', label: 'Illustrator' },
  { value: 'ae', label: 'After Effects' },
  { value: 'pr', label: 'Premiere Pro' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'other', label: 'Other' },
];

const ASSET_ROLES = [
  { value: 'source', label: 'Source File' },
  { value: 'preview', label: 'Preview Render' },
  { value: 'final', label: 'Final Deliverable' },
];

function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]); // New state for comments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth(); // Corrected usage

  // State for upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assetType, setAssetType] = useState('');
  const [assetRole, setAssetRole] = useState('');
  const [assetDescription, setAssetDescription] = useState('');

  const fetchTaskAndComments = useCallback(async () => { // Renamed and updated
    try {
      setLoading(true);
      const [taskResponse, commentsResponse] = await Promise.all([
        getProjectStageElement(taskId),
        getTaskComments(taskId),
      ]);
      setTask(taskResponse.data);
      setComments(commentsResponse.data);
      console.log(taskResponse.data);
      console.log(commentsResponse.data);
    } catch (err) {
      setError("Failed to fetch task details or comments.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskAndComments();
  }, [fetchTaskAndComments]);

  const formatHours = (totalHours) => {
    if (totalHours === null || totalHours === undefined) {
        return '00:00:00';
    }
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task && user) {
      try {
        setLoading(true);
        const commentData = {
          comment: newComment,
        };
        await createTaskComment(taskId, commentData);
        const commentsResponse = await getTaskComments(taskId); // Re-fetch comments
        setComments(commentsResponse.data);
        setNewComment('');
      } catch (err) {
        setError("Failed to add comment.");
        console.error("Error adding comment:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setAssetType('');
    setAssetRole('');
    setAssetDescription('');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadWork = async () => {
    if (!selectedFile || !assetType || !assetRole || !task || !user) {
      alert('Please select a file, asset type, and asset role.');
      return;
    }

    console.log('--- Uploading Work ---');
    console.log('Selected File:', selectedFile, 'Type:', typeof selectedFile);
    console.log('Asset Type:', assetType, 'Type:', typeof assetType);
    console.log('Asset Role:', assetRole, 'Type:', typeof assetRole);
    console.log('Asset Description:', assetDescription, 'Type:', typeof assetDescription);
    console.log('----------------------');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('asset_type', assetType);
      formData.append('asset_role', assetRole);
      formData.append('description', assetDescription);

      await uploadAssetForStageElement(taskId, formData);
      alert('Work uploaded successfully!');
      handleCloseUploadModal();
      await fetchTaskAndComments(); // Re-fetch task and comments to show the new asset
    } catch (err) {
      setError("Failed to upload work.");
      console.error("Error uploading work:", err);
      alert('Failed to upload work. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getReviewComponent = (workType, reviewData = {}) => {
    switch (workType) {
      case 'graphic_design':
        return <GraphicDesignReview reviewData={reviewData} />;
      case '3d_animation':
        return <Animation3DReview reviewData={reviewData} />;
      case 'video_editing':
        return <VideoEditingReview reviewData={reviewData} />;
      case 'motion_graphics':
        return <p className="text-gray-400">Motion Graphics Review area coming soon!</p>; // Placeholder
      default:
        return <p className="text-gray-400">No specialized review tools for this task type.</p>;
    }
  };

  const getNoteBorderColor = (type) => {
    switch (type) {
      case 'rejected':
        return 'border-red-500';
      case 'approved':
        return 'border-green-500';
      default:
        return 'border-blue-500';
    }
  };

  if (loading) {
    return (
      <Modal isOpen={loading} onClose={() => {}} title="Loading Task">
        <p>Loading task details...</p>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={!!error} onClose={() => setError(null)} title="Error">
        <p>{error}</p>
      </Modal>
    );
  }

  if (!task) {
    return <div className="min-h-screen bg-black text-white p-6">Task not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Breadcrumbs */}
      <div className="text-gray-400 mb-6">
        <span>{task.project_name}</span> &gt; <span>{task.template_name}</span> ({task.stage?.project?.service_type?.replace('_', ' ').toUpperCase()})
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{task.template_name}</h1>
        <div className="flex items-center space-x-4">
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
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
            <img className="h-full w-full rounded-full" src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 bg-gray-800 rounded-lg shadow-lg relative p-6"> {/* Added p-6 here */}
          <img src={task.assets.length > 0 ? task.assets[0].file : 'https://via.placeholder.com/600x400?text=No+Asset'} alt={task.template_name} className="w-full h-auto rounded-lg mb-4" /> {/* Added mb-4 */}
          {/* Specialized Review Area */}
          {getReviewComponent(task.stage?.project?.service_type, {})}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-900 bg-opacity-75 p-3 rounded-full">
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10v11l6-3 6 3 6-3V3l-6 3-6-3-6 3z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m0 0h-3" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zm7-9v5a1 1 0 11-2 0v-5m-4 1a1 1 0 100 2h.01a1 1 0 100-2H11zm-4 4a1 1 0 100 2h.01a1 1 0 100-2H7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Actions */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Actions</h2>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                {task.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Time Tracked</p>
            <p className="text-3xl font-bold mb-4">{formatHours(task.actual_hours)}</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H11a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1z"
                  clipRule="evenodd"
              />
              </svg>
              Pause Timer
            </button>
            <div className="flex space-x-4">
              <button
                onClick={handleOpenUploadModal} // Hook up to open modal
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Upload Work
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                Mark as Complete
              </button>
            </div>
          </div>

          {/* Notes / Feedback */}
          {task.assignments.initial_notes && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Initial Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{task.initial_notes}</p>
            </div>
          )}
          {/* New: Rejection Notes */}
          {task.rejection_notes && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-red-500">
              <h2 className="text-xl font-bold mb-4 text-red-400">Rework Request / Rejection Notes</h2>
              <p className="text-red-300 whitespace-pre-wrap">{task.rejection_notes}</p>
            </div>
          )}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            <div className="space-y-6">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white text-xs font-bold">
                    {comment.user_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{comment.user_name} <span className="text-gray-500 text-xs ml-2">{new Date(comment.created_at).toLocaleString()}</span></p>
                    <p className="text-gray-300 text-sm">{comment.comment}</p>
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
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  onClick={handleAddComment}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
                >
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

      {/* Upload Asset Modal */}
      <Modal isOpen={showUploadModal} onClose={handleCloseUploadModal} title="Upload Work Asset">
        <form onSubmit={(e) => { e.preventDefault(); handleUploadWork(); }}>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-white text-sm font-bold mb-2">Select File:</label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600 cursor-pointer"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="asset-type" className="block text-white text-sm font-bold mb-2">Asset Type:</label>
            <select
              id="asset-type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              required
            >
              <option value="">Select Type</option>
              {ASSET_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="asset-role" className="block text-white text-sm font-bold mb-2">Asset Role:</label>
            <select
              id="asset-role"
              value={assetRole}
              onChange={(e) => setAssetRole(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              required
            >
              <option value="">Select Role</option>
              {ASSET_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="asset-description" className="block text-white text-sm font-bold mb-2">Description (Optional):</label>
            <textarea
              id="asset-description"
              value={assetDescription}
              onChange={(e) => setAssetDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              rows="3"
            ></textarea>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Upload
            </button>
            <button
              type="button"
              onClick={handleCloseUploadModal}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TaskDetails;