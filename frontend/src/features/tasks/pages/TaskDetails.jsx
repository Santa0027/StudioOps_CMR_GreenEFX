import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Upload, CheckCircle2, MessageSquare, Pause, Play,
  FileText, AlertTriangle, Image, Send, ThumbsUp, ThumbsDown, UserCheck, UserX, ExternalLink
} from 'lucide-react';
import { 
  getProjectStageElement, getTaskComments, createTaskComment, uploadAssetForStageElement, 
  updateProjectStageElement, requestManagerApproval, approveManagerReview, rejectManagerReview,
  stageForClientReview, clientApprove, clientReject
} from '../../../shared/services/apiClient';
import Modal from '../../../shared/components/Modal';
import { useAuth } from '../../../shared/context/AuthContext';

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

const STATUS_CONFIG = {
  pending: { color: 'bg-slate-500/10 text-slate-400', icon: Clock },
  in_progress: { color: 'bg-blue-500/10 text-blue-400', icon: Play },
  waiting_review: { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock }, // For Manager Review
  waiting_client_review: { color: 'bg-indigo-500/10 text-indigo-400', icon: Clock }, // For Client Review
  completed: { color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
  rejected: { color: 'bg-rose-500/10 text-rose-400', icon: AlertTriangle },
  on_hold: { color: 'bg-orange-500/10 text-orange-400', icon: Pause },
  blocked: { color: 'bg-red-500/10 text-red-400', icon: AlertTriangle },
};

const APPROVAL_STATUS_CONFIG = {
  pending: { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  approved: { color: 'bg-emerald-500/10 text-emerald-400', icon: ThumbsUp },
  rejected: { color: 'bg-rose-500/10 text-rose-400', icon: ThumbsDown },
  not_applicable: { color: 'bg-slate-500/10 text-slate-400', icon: FileText },
  requested: { color: 'bg-indigo-500/10 text-indigo-400', icon: Send },
};

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [initialNotes, setInitialNotes] = useState(''); // State for initial notes
  const [isEditingInitialNotes, setIsEditingInitialNotes] = useState(false); // State for editing mode
  const { user } = useAuth(); // Assuming user object contains role information (e.g., is_internal, is_client)

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assetType, setAssetType] = useState('');
  const [assetRole, setAssetRole] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); // New state for selected asset

  const [isTimerRunning, setIsTimerRunning] = useState(false); // State for timer status
  const timerIntervalRef = useRef(null); // Ref to store interval ID
  const [timeSpentInSession, setTimeSpentInSession] = useState(0); // Time spent in current session (in seconds)
  const timeSpentInSessionRef = useRef(timeSpentInSession);

  // State for Manager Rework Modal
  const [showManagerReworkModal, setShowManagerReworkModal] = useState(false);
  const [managerReworkNotes, setManagerReworkNotes] = useState('');

  // State for Client Rework Modal
  const [showClientReworkModal, setShowClientReworkModal] = useState(false);
  const [clientReworkNotes, setClientReworkNotes] = useState('');

  console.log(user)
  const fetchTaskAndComments = useCallback(async () => {
    try {
      setLoading(true);
      const [taskResponse, commentsResponse] = await Promise.all([
        getProjectStageElement(taskId),
        getTaskComments(taskId),
      ]);
      setTask(taskResponse.data);
      setComments(commentsResponse.data);
      setInitialNotes(taskResponse.data.initial_notes || ''); // Initialize initialNotes here
      // Initialize selectedAsset with the first asset if available
      if (taskResponse.data.assets && taskResponse.data.assets.length > 0) {
        setSelectedAsset(taskResponse.data.assets[0]);
      } else {
        setSelectedAsset(null);
      }

      // If task is in_progress, ensure timer is started (e.g., if page refreshed)
      // This is a basic example; a more robust solution would involve backend timestamping
      if (taskResponse.data.status === 'in_progress' && !isTimerRunning) {
        // This won't actually "start" the timer from where it left off without a backend timestamp
        // For now, we'll just indicate it's running visually and allow interaction
        // setIsTimerRunning(true); // Don't auto-start on fetch to avoid accidental logs
      } else if (taskResponse.data.status !== 'in_progress' && isTimerRunning) {
        // If task is no longer in_progress, but timer is somehow running, stop it
        // stopTimer(); // Ensure this doesn't create a new log if already stopped
      }

    } catch (err) {
      setError("Failed to fetch task details or comments.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId]); // Removed isTimerRunning from dependencies

  useEffect(() => {
    fetchTaskAndComments();

    // Cleanup function for useEffect
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [fetchTaskAndComments]);

  // Keep ref updated with latest timeSpentInSession state
  useEffect(() => {
    timeSpentInSessionRef.current = timeSpentInSession;
  }, [timeSpentInSession]);

  const startTimer = () => {
    if (task && !isTimerRunning) {
      setIsTimerRunning(true);
      // Start interval to update timeSpentInSession every second
      timerIntervalRef.current = setInterval(() => {
        setTimeSpentInSession(prevTime => prevTime + 1);
      }, 1000);
      // Optionally update task status to 'in_progress' if it's not already
      if (task.status !== 'in_progress') {
        updateProjectStageElement(task.id, { status: 'in_progress' }).then(fetchTaskAndComments);
      }
      // TODO: API call to log timer start in backend if desired for more granular tracking
    }
  };

  const stopTimer = async () => {
    if (task && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Calculate total actual hours including session time using the ref
      const latestTimeSpentInSession = timeSpentInSessionRef.current;
      const totalActualHours = Math.round((task.actual_hours || 0) + (latestTimeSpentInSession / 3600)); // Convert seconds to hours and round to integer

      try {
        // Update task with new actual_hours and potentially status (e.g., back to 'pending' or 'on_hold')
        // For now, only updating hours, leaving status to manual change or specific rules
        await updateProjectStageElement(task.id, { actual_hours: totalActualHours });
        // Re-fetch task to update UI with new actual_hours from backend
        await fetchTaskAndComments();
        alert(`Timer stopped. ${formatHours(latestTimeSpentInSession)} added to actual hours.`);
      } catch (err) {
        console.error("Error stopping timer or updating task:", err);
        alert('Failed to stop timer or update task hours.');
      } finally {
        setTimeSpentInSession(0); // Reset session timer
      }
    }
  };


  const formatHours = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) return '0s';
    
    totalSeconds = Math.floor(totalSeconds); // Ensure we are working with whole seconds

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let parts = [];
    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (seconds > 0 || parts.length === 0) { // Always show seconds if no other parts, or if seconds > 0
      parts.push(`${seconds}s`);
    }
    
    return parts.join(' ');
  };

  const displayedActualHours = ((task?.actual_hours || 0) * 3600) + (isTimerRunning ? timeSpentInSession : 0);

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    </div>
  );

  if (!task) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <p className="text-slate-400">Task not found.</p>
    </div>
  );

  const isCompleteButtonEnabled = task  &&
    task.status !== 'completed' &&
    task.status !== 'rejected' &&
    task.status !== 'blocked';

  // Helper for status badges
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.color} ring-1 ring-current/20`}>
        <StatusIcon size={14} />
        {status?.toUpperCase().replace(/_/g, ' ')}
      </span>
    );
  };

  // Helper for approval status badges
  const getApprovalStatusBadge = (status) => {
    const config = APPROVAL_STATUS_CONFIG[status] || APPROVAL_STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color} ring-1 ring-current/20`}>
        <StatusIcon size={12} />
        {status?.toUpperCase().replace(/_/g, ' ')}
      </span>
    );
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task && user) {
      try {
        await createTaskComment(taskId, { comment: newComment });
        const commentsResponse = await getTaskComments(taskId);
        setComments(commentsResponse.data);
        setNewComment('');
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    try {
      await updateProjectStageElement(task.id, { status: 'completed' });
      await fetchTaskAndComments();
      alert('Task marked as completed!');
    } catch (err) {
      console.error("Error completing task:", err);
      alert('Failed to complete task.');
    }
  };

  const handleSaveInitialNotes = async () => {
    try {
      await updateProjectStageElement(taskId, { initial_notes: initialNotes });
      alert('Initial notes updated successfully!');
      setIsEditingInitialNotes(false);
      fetchTaskAndComments(); // Re-fetch to update the task object
    } catch (err) {
      console.error("Error saving initial notes:", err);
      alert('Failed to save initial notes.');
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setAssetType('');
    setAssetRole('');
    setAssetDescription('');
  };

  const handleUploadWork = async () => {
    if (!selectedFile || !assetType || !assetRole) {
      alert('Please select a file, asset type, and asset role.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('asset_type', assetType);
      formData.append('asset_role', assetRole);
      formData.append('description', assetDescription);

      await uploadAssetForStageElement(taskId, formData);
      handleCloseUploadModal();
      await fetchTaskAndComments();
    } catch (err) {
      console.error("Error uploading work:", err);
      alert('Failed to upload work.');
    } finally {
      setUploading(false);
    }
  };

  // Manager Actions Handlers
  const handleRequestManagerApproval = async () => {
    try {
      await requestManagerApproval(taskId);
      alert('Manager approval requested!');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error requesting manager approval:", err);
      alert('Failed to request manager approval.');
    }
  };

  const handleApproveManagerReview = async () => {
    try {
      await approveManagerReview(taskId);
      alert('Manager review approved!');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error approving manager review:", err);
      alert('Failed to approve manager review.');
    }
  };

  const handleRejectManagerReview = async () => {
    try {
      if (!managerReworkNotes.trim()) {
        alert('Please provide rework notes.');
        return;
      }
      await rejectManagerReview(taskId, managerReworkNotes);
      alert('Manager review rejected with notes.');
      setShowManagerReworkModal(false);
      setManagerReworkNotes('');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error rejecting manager review:", err);
      alert('Failed to reject manager review.');
    }
  };

  // Client Actions Handlers
  const handleStageForClientReview = async () => {
    try {
      await stageForClientReview(taskId);
      alert('Task staged for client review!');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error staging for client review:", err);
      alert('Failed to stage for client review.');
    }
  };

  const handleClientApprove = async () => {
    try {
      await clientApprove(taskId);
      alert('Client approved the task!');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error during client approval:", err);
      alert('Failed to get client approval.');
    }
  };

  const handleClientReject = async () => {
    try {
      if (!clientReworkNotes.trim()) {
        alert('Please provide rework notes for the client.');
        return;
      }
      await clientReject(taskId, clientReworkNotes);
      alert('Client rejected the task with notes.');
      setShowClientReworkModal(false);
      setClientReworkNotes('');
      fetchTaskAndComments();
    } catch (err) {
      console.error("Error during client rejection:", err);
      alert('Failed to get client rejection.');
    }
  };


  const renderAssetPreview = (asset) => {
    if (!asset) {
      return (
        <div className="flex items-center justify-center w-full h-full max-h-[500px] bg-slate-950 text-slate-500">
          <p>No asset selected or available.</p>
        </div>
      );
    }

    switch (asset.asset_type) {
      case 'image':
        return <img src={asset.file} alt={asset.description || 'Task asset'} className="w-full h-auto max-h-[500px] object-contain bg-slate-950" />;
      case 'video':
        return <video controls src={asset.file} className="w-full h-auto max-h-[500px] object-contain bg-slate-950" />;
      case 'audio':
        return (
          <audio controls src={asset.file} className="w-full max-h-[500px] bg-slate-950 p-4">
            Your browser does not support the audio element.
          </audio>
        );
      case 'pdf': // Assuming 'pdf' asset type might be added or 'other' could cover it
        return (
          <iframe src={asset.file} className="w-full h-full max-h-[500px] bg-slate-950" title={asset.description || 'PDF Document'}>
            This browser does not support PDFs. Please <a href={asset.file}>download the PDF</a> to view it.
          </iframe>
        );
      default: // Handles 'psd', 'ai', 'ae', 'pr', 'other'
        return (
          <div className="flex flex-col items-center justify-center w-full h-full max-h-[500px] bg-slate-950 p-4 text-slate-400">
            <FileText size={48} className="mb-3" />
            <p className="text-lg font-semibold">Cannot preview {asset.asset_type.toUpperCase()} files.</p>
            {asset.file && (
              <a href={asset.file} target="_blank" rel="noopener noreferrer" className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">
                Download File
              </a>
            )}
            <p className="text-sm mt-2">{asset.description}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumbs & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-slate-400 text-sm">
            {task.project_name} &gt; {task.stage_name}
          </p>
          <h1 className="text-2xl font-bold text-white">{task.template_name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video">
            {renderAssetPreview(selectedAsset)}
          </div>

          {/* Asset Details */}
          {selectedAsset && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-2">Selected Asset Details</h3>
              <p className="text-slate-300 text-sm">
                Type: <span className="font-semibold">{selectedAsset.asset_type?.toUpperCase()}</span>
              </p>
              <p className="text-slate-300 text-sm">
                Role: <span className="font-semibold">{selectedAsset.asset_role?.toUpperCase()}</span>
              </p>
              {selectedAsset.description && (
                <p className="text-slate-300 text-sm">
                  Description: <span className="italic">{selectedAsset.description}</span>
                </p>
              )}
              <p className="text-slate-300 text-sm">
                Uploaded by: <span className="font-semibold">{selectedAsset.uploaded_by_name}</span> at{" "}
                {new Date(selectedAsset.created_at).toLocaleString()}
              </p>
              <p className="text-slate-300 text-sm">
                Version: <span className="font-semibold">{selectedAsset.version_number}</span>
              </p>
            </div>
          )}


          {/* Asset Gallery */}
          {task.assets?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Image size={18} className="text-emerald-500" />
                All Assets ({task.assets.length})
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {task.assets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className={`bg-slate-800 rounded-lg overflow-hidden border-2 cursor-pointer
                      ${selectedAsset?.id === asset.id ? 'border-blue-500' : 'border-slate-700 hover:border-blue-700'}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {asset.asset_type === 'image' && (
                      <img src={asset.file} alt={asset.description || 'Asset thumbnail'} className="w-full h-20 object-cover" />
                    )}
                    {(asset.asset_type === 'video' || asset.asset_type === 'audio') && (
                      <div className="relative w-full h-20 flex items-center justify-center bg-slate-950">
                        {asset.asset_type === 'video' ? (
                          <video src={asset.file} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-400">AUDIO</div>
                        )}
                        <Play size={24} className="absolute text-white/80" />
                      </div>
                    )}
                    {(asset.asset_type !== 'image' && asset.asset_type !== 'video' && asset.asset_type !== 'audio') && (
                      <div className="w-full h-20 flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
                        {asset.asset_type.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Actions</h2>
              {getStatusBadge(task.status)}
            </div>
            <div className="mb-5">
              <p className="text-slate-400 text-sm mb-1">Time Tracked</p>
              <p className="text-3xl font-bold text-white font-mono">{formatHours(displayedActualHours)}</p>
            </div>
            {isTimerRunning ? (
              <button
                onClick={stopTimer}
                className="w-full mb-3 px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-500 text-white border border-red-700 flex items-center justify-center gap-2 transition-all"
              >
                <Pause size={16} />
                Pause Timer
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="w-full mb-3 px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white border border-blue-700 flex items-center justify-center gap-2 transition-all"
              >
                <Play size={16} />
                Start Timer
              </button>
            )}

            {/* Manager Approval Action Buttons */}
            {user && (
              <div className="flex flex-col gap-3 mt-4">
                {/* Request Manager Approval */}
                {(task.status === 'in_progress' && (task.manager_approval_status === 'pending' || task.manager_approval_status === 'rejected')) && (
                  <button
                    onClick={handleRequestManagerApproval}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Send size={16} />
                    Request Manager Approval
                  </button>
                )}

                {/* Approve Manager Review */}
                {(task.status === 'waiting_review' && task.manager_approval_status === 'pending') && (
                  <button
                    onClick={handleApproveManagerReview}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <UserCheck size={16} />
                    Approve Manager Review
                  </button>
                )}

                {/* Reject Manager Review */}
                {(task.status === 'waiting_review' && task.manager_approval_status === 'pending') && (
                  <button
                    onClick={() => setShowManagerReworkModal(true)}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <UserX size={16} />
                    Reject Manager Review
                  </button>
                )}

                {/* Stage for Client Review */}
                {(task.manager_approval_status === 'approved' && !task.staged_for_client_review && task.status !== 'waiting_client_review') && (
                  <button
                    onClick={handleStageForClientReview}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink size={16} />
                    Stage for Client Review
                  </button>
                )}
              </div>
            )}
            
            {/* Client Approval Action Buttons */}
            {user?.is_client && task.status === 'waiting_client_review' && task.client_approval_status === 'requested' && (
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={handleClientApprove}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all"
                >
                  <ThumbsUp size={16} />
                  Approve Task
                </button>
                <button
                  onClick={() => setShowClientReworkModal(true)}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition-all"
                >
                  <ThumbsDown size={16} />
                  Request Rework
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Upload size={16} />
                Upload
              </button>
              <button
                onClick={handleCompleteTask} // Added onClick handler
                disabled={!isCompleteButtonEnabled}
                className={`px-4 py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg 
                            ${isCompleteButtonEnabled ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-700 cursor-not-allowed'}`}
              >
                <CheckCircle2 size={16} />
                Complete
              </button>
            </div>
          </div>

          {/* Manager Approval Status */}
          {task.manager_approval_status && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Manager Approval
              </h3>
              <p className="text-slate-300 text-sm mb-1">Status: {getApprovalStatusBadge(task.manager_approval_status)}</p>
              {task.manager_approved_by_name && (
                <p className="text-slate-300 text-sm mb-1">Approved By: <span className="font-semibold">{task.manager_approved_by_name}</span></p>
              )}
              {task.manager_approved_at && (
                <p className="text-slate-300 text-sm">Approved At: {new Date(task.manager_approved_at).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Manager Rework Notes */}
          {task.manager_rework_notes && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Manager Rework Request
              </h3>
              <p className="text-rose-300 whitespace-pre-wrap">{task.manager_rework_notes}</p>
            </div>
          )}

          {/* Client Approval Status */}
          {task.client_approval_status && (task.client_approval_status !== "not_applicable") && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Client Approval
              </h3>
              <p className="text-slate-300 text-sm mb-1">Status: {getApprovalStatusBadge(task.client_approval_status)}</p>
              {task.client_approved_by_name && (
                <p className="text-slate-300 text-sm mb-1">Approved By: <span className="font-semibold">{task.client_approved_by_name}</span></p>
              )}
              {task.client_approved_at && (
                <p className="text-slate-300 text-sm">Approved At: {new Date(task.client_approved_at).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Client Rework Notes */}
          {task.client_rework_notes && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Client Rework Request
              </h3>
              <p className="text-rose-300 whitespace-pre-wrap">{task.client_rework_notes}</p>
            </div>
          )}

          {/* Existing Rejection Notes */}
          {task.rejection_notes && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Task Rejection Notes
              </h3>
              <p className="text-rose-300 whitespace-pre-wrap">{task.rejection_notes}</p>
            </div>
          )}

          {/* Initial Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Initial Notes
              </h3>
              {user && !isEditingInitialNotes && (
                <button
                  onClick={() => setIsEditingInitialNotes(true)}
                  className="px-3 py-1 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingInitialNotes ? (
              <div className="space-y-3">
                <textarea
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  className={inputClasses + " resize-y"}
                  rows="6"
                  placeholder="Add any initial notes for this task..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setInitialNotes(task.initial_notes || ''); // Revert to original
                      setIsEditingInitialNotes(false);
                    }}
                    className="px-4 py-2 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInitialNotes}
                    disabled={initialNotes === (task.initial_notes || '')} // Disable if no change
                    className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 whitespace-pre-wrap">
                {task.initial_notes || 'No initial notes available.'}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-purple-500" />
              Comments ({comments.length})
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <p className="text-slate-500 text-sm">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-800 rounded-lg p-3 border-l-2 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {comment.user_name?.charAt(0)}
                      </div>
                      <span className="font-semibold text-white text-sm">{comment.user_name}</span>
                      <span className="text-slate-500 text-xs">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                rows="2"
                placeholder="Add a comment..."
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          title="Upload Work Asset"
          icon={<Upload size={20} className="text-blue-500" />}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleUploadWork(); }} className="p-6 space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Select File *</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Asset Type *</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className={inputClasses + " cursor-pointer"}
                required
              >
                <option value="">Select Type</option>
                {ASSET_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Asset Role *</label>
              <select
                value={assetRole}
                onChange={(e) => setAssetRole(e.target.value)}
                className={inputClasses + " cursor-pointer"}
                required
              >
                <option value="">Select Role</option>
                {ASSET_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                className={inputClasses + " resize-none"}
                rows="3"
                placeholder="Optional description..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseUploadModal}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manager Rework Notes Modal */}
      {showManagerReworkModal && (
        <Modal
          isOpen={showManagerReworkModal}
          onClose={() => setShowManagerReworkModal(false)}
          title="Reject Manager Review"
          icon={<UserX size={20} className="text-rose-500" />}
        >
          <div className="p-6 space-y-4">
            <p className="text-slate-300">Please provide notes for why the task is being rejected. These notes will be visible to the assigned user.</p>
            <textarea
              value={managerReworkNotes}
              onChange={(e) => setManagerReworkNotes(e.target.value)}
              className={inputClasses + " resize-none"}
              rows="4"
              placeholder="Enter rework notes..."
            />
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowManagerReworkModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectManagerReview}
                disabled={!managerReworkNotes.trim()}
                className="px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50"
              >
                Reject Task
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Client Rework Notes Modal */}
      {showClientReworkModal && (
        <Modal
          isOpen={showClientReworkModal}
          onClose={() => setShowClientReworkModal(false)}
          title="Reject Client Review"
          icon={<UserX size={20} className="text-rose-500" />}
        >
          <div className="p-6 space-y-4">
            <p className="text-slate-300">Please provide notes for why the task is being rejected by the client. These notes will be visible to the internal team.</p>
            <textarea
              value={clientReworkNotes}
              onChange={(e) => setClientReworkNotes(e.target.value)}
              className={inputClasses + " resize-none"}
              rows="4"
              placeholder="Enter client rework notes..."
            />
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowClientReworkModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClientReject}
                disabled={!clientReworkNotes.trim()}
                className="px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50"
              >
                Reject Task
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TaskDetails;