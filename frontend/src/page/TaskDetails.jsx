import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Upload, CheckCircle2, MessageSquare, Pause, Play,
  FileText, AlertTriangle, Image, Send
} from 'lucide-react';
import { getProjectStageElement, getTaskComments, createTaskComment, uploadAssetForStageElement } from '../api/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

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
  completed: { color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
  rejected: { color: 'bg-rose-500/10 text-rose-400', icon: AlertTriangle },
};

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assetType, setAssetType] = useState('');
  const [assetRole, setAssetRole] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchTaskAndComments = useCallback(async () => {
    try {
      setLoading(true);
      const [taskResponse, commentsResponse] = await Promise.all([
        getProjectStageElement(taskId),
        getTaskComments(taskId),
      ]);
      setTask(taskResponse.data);
      setComments(commentsResponse.data);
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
    if (totalHours === null || totalHours === undefined) return '00:00:00';
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.color} ring-1 ring-current/20`}>
        <StatusIcon size={14} />
        {status?.toUpperCase()}
      </span>
    );
  };

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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <img
              src={task.assets?.length > 0 ? task.assets[0].file : 'https://via.placeholder.com/800x500?text=No+Asset'}
              alt={task.template_name}
              className="w-full h-auto max-h-[500px] object-contain bg-slate-950"
            />
          </div>

          {/* Asset Gallery */}
          {task.assets?.length > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Image size={18} className="text-emerald-500" />
                All Assets
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {task.assets.map((asset, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <img src={asset.file} alt={`Asset ${i + 1}`} className="w-full h-20 object-cover" />
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
              <p className="text-3xl font-bold text-white font-mono">{formatHours(task.actual_hours)}</p>
            </div>
            <button className="w-full mb-3 px-5 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all">
              <Pause size={16} />
              Pause Timer
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Upload size={16} />
                Upload
              </button>
              <button className="px-4 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={16} />
                Complete
              </button>
            </div>
          </div>

          {/* Rejection Notes */}
          {task.rejection_notes && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Rework Request
              </h3>
              <p className="text-rose-300 whitespace-pre-wrap">{task.rejection_notes}</p>
            </div>
          )}

          {/* Initial Notes */}
          {task.initial_notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Initial Notes
              </h3>
              <p className="text-slate-300 whitespace-pre-wrap">{task.initial_notes}</p>
            </div>
          )}

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
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={20} className="text-blue-500" />
                Upload Work Asset
              </h2>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetails;