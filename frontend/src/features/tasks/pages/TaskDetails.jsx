import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Upload, CheckCircle2, MessageSquare, Pause, Play,
  FileText, AlertTriangle, Image, Send, ThumbsUp, ThumbsDown, UserCheck, UserX, ExternalLink, StopCircle, RotateCcw, Info
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
  waiting_review: { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock }, 
  waiting_client_review: { color: 'bg-indigo-500/10 text-indigo-400', icon: Clock }, 
  completed: { color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
  rejected: { color: 'bg-rose-500/10 text-rose-400', icon: AlertTriangle },
  on_hold: { color: 'bg-amber-500/10 text-amber-400', icon: Pause },
  blocked: { color: 'bg-red-500/10 text-red-400', icon: StopCircle },
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
  const [actionError, setActionError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [initialNotes, setInitialNotes] = useState(''); 
  const [isEditingInitialNotes, setIsEditingInitialNotes] = useState(false); 
  const { user } = useAuth(); 

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assetType, setAssetType] = useState('');
  const [assetRole, setAssetRole] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [isClientReview, setIsClientReview] = useState(false); 
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); 

  const [isTimerRunning, setIsTimerRunning] = useState(false); 
  const timerIntervalRef = useRef(null); 
  const [timeSpentInSession, setTimeSpentInSession] = useState(0); 
  const timeSpentInSessionRef = useRef(timeSpentInSession);

  const [showManagerReworkModal, setShowManagerReworkModal] = useState(false);
  const [managerReworkNotes, setManagerReworkNotes] = useState('');
  const [showClientReworkModal, setShowClientReworkModal] = useState(false);
  const [clientReworkNotes, setClientReworkNotes] = useState('');

  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [statusActionNotes, setStatusActionNotes] = useState('');

  const fetchTaskAndComments = useCallback(async () => {
    try {
      setLoading(true);
      const [taskResponse, commentsResponse] = await Promise.all([
        getProjectStageElement(taskId),
        getTaskComments(taskId),
      ]);
      setTask(taskResponse.data);
      setComments(commentsResponse.data);
      setInitialNotes(taskResponse.data.initial_notes || ''); 
      if (taskResponse.data.assets && taskResponse.data.assets.length > 0) {
        setSelectedAsset(taskResponse.data.assets[0]);
      } else {
        setSelectedAsset(null);
      }
    } catch (err) {
      setError("Failed to fetch task details or comments.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId]); 

  useEffect(() => {
    fetchTaskAndComments();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [fetchTaskAndComments]);

  useEffect(() => {
    timeSpentInSessionRef.current = timeSpentInSession;
  }, [timeSpentInSession]);

  const startTimer = () => {
    if (task && !isTimerRunning) {
      setIsTimerRunning(true);
      timerIntervalRef.current = setInterval(() => {
        setTimeSpentInSession(prevTime => prevTime + 1);
      }, 1000);
      if (task.status !== 'in_progress') {
        handleStatusChange('in_progress');
      }
    }
  };

  const stopTimer = async () => {
    if (task && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      const latestTimeSpentInSession = timeSpentInSessionRef.current;
      const totalActualHours = Math.round((task.actual_hours || 0) + (latestTimeSpentInSession / 3600)); 

      try {
        await updateProjectStageElement(task.id, { actual_hours: totalActualHours });
        await fetchTaskAndComments();
      } catch (err) {
        console.error("Error updating task hours:", err);
      } finally {
        setTimeSpentInSession(0); 
      }
    }
  };

  const handleStatusChange = async (newStatus, notes = '') => {
    setActionError(null);
    try {
      await updateProjectStageElement(taskId, { 
        status: newStatus,
        status_notes: notes 
      });
      setStatusActionNotes('');
      await fetchTaskAndComments();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.status?.[0] || "Invalid status transition.";
      setActionError(msg);
      console.error("Status change error:", err);
    }
  };

  const formatHours = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) return '0s';
    totalSeconds = Math.floor(totalSeconds); 
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const displayedActualHours = ((task?.actual_hours || 0) * 3600) + (isTimerRunning ? timeSpentInSession : 0);

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
    handleStatusChange('completed');
  };

  const handleSaveInitialNotes = async () => {
    try {
      await updateProjectStageElement(taskId, { initial_notes: initialNotes });
      alert('Initial notes updated successfully!');
      setIsEditingInitialNotes(false);
      fetchTaskAndComments(); 
    } catch (err) {
      console.error("Error saving initial notes:", err);
      alert('Failed to save initial notes.');
    }
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
      formData.append('client_review', isClientReview);
      await uploadAssetForStageElement(taskId, formData);
      setShowUploadModal(false);
      await fetchTaskAndComments();
    } catch (err) {
      console.error("Error uploading work:", err);
      alert('Failed to upload work.');
    } finally {
      setUploading(false);
    }
  };

  const handleRequestManagerApproval = async () => {
    try {
      await requestManagerApproval(taskId);
      alert('Manager approval requested!');
      fetchTaskAndComments();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to request manager approval.";
      setActionError(msg);
    }
  };

  const handleApproveManagerReview = async () => {
    try {
      await approveManagerReview(taskId);
      alert('Manager review approved!');
      fetchTaskAndComments();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to approve manager review.";
      setActionError(msg);
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
      const msg = err.response?.data?.detail || "Failed to reject manager review.";
      setActionError(msg);
    }
  };

  const handleStageForClientReview = async () => {
    try {
      await stageForClientReview(taskId);
      alert('Task staged for client review!');
      fetchTaskAndComments();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to stage for client review.";
      setActionError(msg);
    }
  };

  const handleClientApprove = async () => {
    try {
      await clientApprove(taskId);
      alert('Client approved the task!');
      fetchTaskAndComments();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to get client approval.";
      setActionError(msg);
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
      const msg = err.response?.data?.detail || "Failed to get client rejection.";
      setActionError(msg);
    }
  };

  const renderAssetPreview = (asset) => {
    if (!asset) return <div className="flex items-center justify-center w-full h-full bg-slate-950 text-slate-500"><p>No asset available.</p></div>;
    if (asset.asset_type === 'image') return <img src={asset.file} alt="preview" className="w-full h-auto max-h-[500px] object-contain" />;
    if (asset.asset_type === 'video') return <video controls src={asset.file} className="w-full h-auto max-h-[500px]" />;
    return <div className="flex flex-col items-center justify-center p-12 text-slate-400"><FileText size={48} className="mb-2" /><p>Preview not supported for {asset.asset_type.toUpperCase()}</p><a href={asset.file} target="_blank" className="mt-4 text-blue-400 hover:underline flex items-center gap-1">Download File <ExternalLink size={14}/></a></div>;
  };

  const canComplete = task?.manager_approval_status === 'approved' && (task?.client_approval_status === 'approved' || task?.client_approval_status === 'not_applicable');

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><div className="text-center"><p className="text-red-400 text-lg">{error}</p></div></div>;
  if (!task) return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><p className="text-slate-400">Task not found.</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <p className="text-slate-400 text-sm">{task.project_name} &gt; {task.stage_name}</p>
          <h1 className="text-2xl font-bold text-white">{task.template_name}</h1>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
          <AlertTriangle size={20} />
          <p className="font-medium">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video">
            {renderAssetPreview(selectedAsset)}
          </div>

          {/* Input Assets from Previous Task */}
          {task.input_assets?.length > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <FileText size={18} />
                Input Work (From Previous Task)
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {task.input_assets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 hover:border-blue-500 cursor-pointer transition-all"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="h-16 flex items-center justify-center bg-slate-950 overflow-hidden">
                      {asset.asset_type === 'image' ? <img src={asset.file} className="w-full h-full object-cover" alt=""/> : <FileText size={20} className="text-slate-500" />}
                    </div>
                    <div className="p-1 bg-slate-800 text-[10px] text-center text-slate-400 truncate font-bold uppercase">{asset.asset_role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.assets?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Image size={18} className="text-emerald-500" /> All Assets ({task.assets.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {task.assets.map((asset) => (
                  <div key={asset.id} className={`bg-slate-800 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedAsset?.id === asset.id ? 'border-blue-500 scale-105' : 'border-slate-700 hover:border-slate-600'}`} onClick={() => setSelectedAsset(asset)}>
                    <div className="h-16 flex items-center justify-center bg-slate-950 overflow-hidden">
                      {asset.asset_type === 'image' ? <img src={asset.file} className="w-full h-full object-cover" alt=""/> : <FileText size={20} className="text-slate-500" />}
                    </div>
                    <div className="p-1 bg-slate-800 text-[10px] text-center text-slate-400 truncate">{asset.asset_role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Task Lifecycle</h2>
              {getStatusBadge(task.status)}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Time</p>
                  <p className="text-2xl font-bold text-white font-mono">{formatHours(displayedActualHours)}</p>
                </div>
                {task.status !== 'completed' && (
                  isTimerRunning ? (
                    <button onClick={stopTimer} className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-all"><Pause size={24} fill="currentColor" /></button>
                  ) : (
                    <button onClick={startTimer} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"><Play size={24} fill="currentColor" /></button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {task.status === 'in_progress' && (
                  <button 
                    onClick={handleRequestManagerApproval} 
                    disabled={!task.assets || task.assets.length === 0}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${(!task.assets || task.assets.length === 0) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'}`}
                    title={(!task.assets || task.assets.length === 0) ? "Upload at least one asset before requesting review" : ""}
                  >
                    <Send size={16} /> Request Review
                  </button>
                )}

                {task.status === 'waiting_review' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleApproveManagerReview} className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all">Approve</button>
                    <button onClick={() => setShowManagerReworkModal(true)} className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all">Reject</button>
                  </div>
                )}

                {task.manager_approval_status === 'approved' && !task.staged_for_client_review && task.status !== 'waiting_client_review' && (
                  <button onClick={handleStageForClientReview} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> Send to Client
                  </button>
                )}

                {task.status === 'waiting_client_review' && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                    <p className="text-indigo-400 text-xs font-bold mb-2 uppercase">Awaiting Client Approval</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={handleClientApprove} className="py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/20">Approve</button>
                      <button onClick={() => setShowClientReworkModal(true)} className="py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-rose-500/20">Rework</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={() => setShowHoldModal(true)} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all">Hold Task</button>
                  <button onClick={() => setShowBlockModal(true)} className="py-2 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 rounded-xl text-xs font-bold border border-slate-700 transition-all">Block Task</button>
                </div>

                <button 
                  onClick={handleCompleteTask}
                  disabled={!canComplete || task.status === 'completed'}
                  className={`w-full mt-2 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${canComplete && task.status !== 'completed' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                >
                  <CheckCircle2 size={18} />
                  {task.status === 'completed' ? 'Task Completed' : 'Complete Lifecycle'}
                </button>
                {!canComplete && task.status !== 'completed' && (
                  <p className="text-[10px] text-slate-500 text-center mt-1">Requires manager & client approval to complete.</p>
                )}
              </div>
            </div>

            {task.status !== 'completed' && (
              <div className="grid grid-cols-1 gap-3 mt-4">
                <button onClick={() => setShowUploadModal(true)} className="px-4 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all">
                  <Upload size={16} /> Upload Work
                </button>
              </div>
            )}
          </div>

          {(task.manager_rework_notes || task.client_rework_notes) && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider"><RotateCcw size={16} /> Rework Instructions</h3>
              {task.manager_rework_notes && <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">From Manager</p><div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-slate-300 text-sm whitespace-pre-wrap">{task.manager_rework_notes}</div></div>}
              {task.client_rework_notes && <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">From Client</p><div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-slate-300 text-sm whitespace-pre-wrap">{task.client_rework_notes}</div></div>}
            </div>
          )}

          {task.status_notes && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider"><Info size={16} /> Status Clarification</h3>
              <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-slate-300 text-sm whitespace-pre-wrap italic">
                "{task.status_notes}"
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500"/> Activity Feed</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar mb-4">
              {comments.map(c => (
                <div key={c.id} className="text-sm border-l-2 border-slate-800 pl-3 py-1">
                  <p className="text-slate-200">{c.comment}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{c.user_name} • {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add note..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" />
              <button onClick={handleAddComment} disabled={!newComment.trim()} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50"><Send size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Work Asset">
          <form onSubmit={(e) => { e.preventDefault(); handleUploadWork(); }} className="p-6 space-y-4">
            <div><label className="block text-slate-300 text-sm font-medium mb-2">Select File *</label><input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" required /></div>
            <div><label className="block text-slate-300 text-sm font-medium mb-2">Asset Type *</label><select value={assetType} onChange={(e) => setAssetType(e.target.value)} className={inputClasses + " cursor-pointer"} required><option value="">Select Type</option>{ASSET_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
            <div><label className="block text-slate-300 text-sm font-medium mb-2">Asset Role *</label><select value={assetRole} onChange={(e) => setAssetRole(e.target.value)} className={inputClasses + " cursor-pointer"} required><option value="">Select Role</option>{ASSET_ROLES.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}</select></div>
            <div><label className="block text-slate-300 text-sm font-medium mb-2">Description</label><textarea value={assetDescription} onChange={(e) => setAssetDescription(e.target.value)} className={inputClasses + " resize-none"} rows="3" placeholder="Optional description..." /></div>
            <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <input type="checkbox" id="clientReviewToggle" checked={isClientReview} onChange={(e) => setIsClientReview(e.target.checked)} className="h-4 w-4 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="clientReviewToggle" className="text-sm font-semibold text-indigo-300 cursor-pointer">Ready for Client Review</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">Cancel</button>
              <button type="submit" disabled={uploading} className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 flex items-center gap-2">{uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</> : 'Upload'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showManagerReworkModal && (
        <Modal isOpen={showManagerReworkModal} onClose={() => setShowManagerReworkModal(false)} title="Reject Manager Review">
          <div className="p-6 space-y-4">
            <p className="text-slate-300">Please provide notes for why the task is being rejected.</p>
            <textarea value={managerReworkNotes} onChange={(e) => setManagerReworkNotes(e.target.value)} className={inputClasses + " resize-none"} rows="4" placeholder="Enter rework notes..." />
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowManagerReworkModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">Cancel</button>
              <button type="button" onClick={handleRejectManagerReview} disabled={!managerReworkNotes.trim()} className="px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50">Reject Task</button>
            </div>
          </div>
        </Modal>
      )}

      {showClientReworkModal && (
        <Modal isOpen={showClientReworkModal} onClose={() => setShowClientReworkModal(false)} title="Reject Client Review">
          <div className="p-6 space-y-4">
            <p className="text-slate-300">Specify the client's feedback and required adjustments.</p>
            <textarea value={clientReworkNotes} onChange={(e) => setClientReworkNotes(e.target.value)} className={inputClasses + " resize-none"} rows="4" placeholder="Enter client rework notes..." />
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowClientReworkModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">Cancel</button>
              <button type="button" onClick={handleClientReject} disabled={!clientReworkNotes.trim()} className="px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50">Confirm Client Rejection</button>
            </div>
          </div>
        </Modal>
      )}

      {showHoldModal && (
        <Modal isOpen={showHoldModal} onClose={() => setShowHoldModal(false)} title="Put Task on Hold">
          <div className="p-6 space-y-4">
            <p className="text-slate-400 text-sm">Please provide a reason for putting this task on hold. This will be visible to the team.</p>
            <textarea value={statusActionNotes} onChange={(e) => setStatusActionNotes(e.target.value)} className={inputClasses + " min-h-[120px]"} placeholder="e.g., Waiting for additional reference files from client..." />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowHoldModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700">Cancel</button>
              <button onClick={() => { handleStatusChange('on_hold', statusActionNotes); setShowHoldModal(false); }} disabled={!statusActionNotes.trim()} className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50">Confirm Hold</button>
            </div>
          </div>
        </Modal>
      )}

      {showBlockModal && (
        <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Block Task">
          <div className="p-6 space-y-4">
            <p className="text-slate-400 text-sm text-rose-400/80 font-medium flex items-center gap-2"><AlertTriangle size={14} />Explain the critical issue blocking this task.</p>
            <textarea value={statusActionNotes} onChange={(e) => setStatusActionNotes(e.target.value)} className={inputClasses + " min-h-[120px] border-rose-500/20"} placeholder="e.g., Main workstation GPU failure, waiting for IT..." />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowBlockModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700">Cancel</button>
              <button onClick={() => { handleStatusChange('blocked', statusActionNotes); setShowBlockModal(false); }} disabled={!statusActionNotes.trim()} className="px-5 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50">Confirm Block</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TaskDetails;
