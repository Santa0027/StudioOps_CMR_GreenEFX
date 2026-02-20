import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, History, Upload, Users, Calendar, Clock, Link, 
  FileText, Image, ArrowLeft, CheckCircle2, XCircle, Pause, Layers, X, Circle, Settings, RefreshCw
} from 'lucide-react';
import VersionHistory from '../components/VersionHistory';
import { getProject, uploadProjectVersion, updateProject, getProjectStageTemplates } from '../../../shared/services/apiClient';

const STATUS_CONFIG = {
  not_started: { color: 'bg-slate-600', ringColor: 'ring-slate-500', textColor: 'text-slate-400', bgLight: 'bg-slate-500/20' },
  in_progress: { color: 'bg-blue-500', ringColor: 'ring-blue-500', textColor: 'text-blue-400', bgLight: 'bg-blue-500/20' },
  completed: { color: 'bg-emerald-500', ringColor: 'ring-emerald-500', textColor: 'text-emerald-400', bgLight: 'bg-emerald-500/20' },
  on_hold: { color: 'bg-amber-500', ringColor: 'ring-amber-500', textColor: 'text-amber-400', bgLight: 'bg-amber-500/20' },
  cancelled: { color: 'bg-rose-500', ringColor: 'ring-rose-500', textColor: 'text-rose-400', bgLight: 'bg-rose-500/20' },
  pending: { color: 'bg-orange-500', ringColor: 'ring-orange-500', textColor: 'text-orange-400', bgLight: 'bg-orange-500/20' },
  active: { color: 'bg-blue-500', ringColor: 'ring-blue-500', textColor: 'text-blue-400', bgLight: 'bg-blue-500/20' },
  rejected: { color: 'bg-rose-500', ringColor: 'ring-rose-500', textColor: 'text-rose-400', bgLight: 'bg-rose-500/20' },
};

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [projectVersionFile, setProjectVersionFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [assetUploadError, setAssetUploadError] = useState(null);
  
  // Workflow Template state
  const [workflowTemplates, setWorkflowTemplates] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [isUpdatingWorkflow, setIsUpdatingWorkflow] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await getProject(id);
      setProjectData(res.data);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      setError('Failed to fetch project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await getProjectStageTemplates();
      setWorkflowTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTemplates();
    }
  }, [id]);

  const handleApplyWorkflow = async () => {
    if (selectedTemplateIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to add ${selectedTemplateIds.length} workflow stage(s) to the project?`)) return;

    try {
      setIsUpdatingWorkflow(true);
      await updateProject(id, {
        workflow_template_ids: selectedTemplateIds.map(id => parseInt(id))
      });
      alert("Workflow stages added successfully!");
      setSelectedTemplateIds([]);
      fetchProject(); 
    } catch (err) {
      console.error("Workflow update error:", err);
      alert("Failed to update workflow.");
    } finally {
      setIsUpdatingWorkflow(false);
    }
  };

  const handleAssetUpload = (event) => {
    setAssetUploadError(null); 
    const files = Array.from(event.target.files);
    
    const MAX_ASSET_FILE_SIZE = 50 * 1024 * 1024; 
    const ALLOWED_ASSET_MIME_TYPES = [
      'model/fbx', 
      'application/octet-stream', 
      'video/mp4',
      'image/jpeg',
      'image/png',
    ];

    let newValidAssets = [];
    let hasError = false;
    let errorMessages = [];

    files.forEach(file => {
      const fileNameLower = file.name.toLowerCase();
      const isObj = fileNameLower.endsWith('.obj');
      const isFbx = fileNameLower.endsWith('.fbx');

      const isAllowedType = ALLOWED_ASSET_MIME_TYPES.includes(file.type) || isObj || isFbx;

      if (file.size > MAX_ASSET_FILE_SIZE) {
        errorMessages.push(`${file.name}: Exceeds 50MB limit.`);
        hasError = true;
      } else if (!isAllowedType) {
        errorMessages.push(`${file.name}: Unsupported file type. Allowed: FBX, OBJ, MP4, PNG, JPG.`);
        hasError = true;
      } else {
        newValidAssets.push({
          name: file.webkitRelativePath || file.name,
          type: file.type,
          thumbnail: URL.createObjectURL(file),
        });
      }
    });

    if (hasError) {
      setAssetUploadError(errorMessages.join(' '));
    }
    
    if (newValidAssets.length > 0) {
      setUploadedAssets(prevAssets => [...prevAssets, ...newValidAssets]);
    }
  };

  const handleVersionFileChange = (event) => {
    setUploadError(null); 
    const file = event.target.files[0];

    if (!file) {
      setProjectVersionFile(null);
      return;
    }

    const MAX_FILE_SIZE = 200 * 1024 * 1024; 
    const ALLOWED_MIME_TYPES = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'application/zip', 'application/x-rar-compressed', 
    ];

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 200MB limit.');
      setProjectVersionFile(null);
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Allowed: MP4, MOV, AVI, JPG, PNG, GIF, WebP, ZIP, RAR.');
      setProjectVersionFile(null);
      return;
    }

    setProjectVersionFile(file);
  };

  const handleUploadForApproval = async () => {
    if (uploadError) { 
      alert(uploadError);
      return;
    }
    if (!projectVersionFile) {
      setUploadError('Please select a file to upload for approval.');
      alert(uploadError);
      return;
    }

    const formData = new FormData();
    formData.append('file', projectVersionFile);
    formData.append('project_name', projectData.name);
    formData.append('description', `New version for ${projectData.name}`);
    formData.append('asset_role', 'final');
    formData.append('client_review', 'true');

    try {
      await uploadProjectVersion(projectData.id, formData);
      alert('Project version uploaded successfully for approval!');
      setProjectVersionFile(null);
      setShowUploadModal(false);
      setUploadError(null); 
    } catch (err) {
      console.error('Upload error:', err.response ? err.response.data : err);
      const errorMessage = err.response?.data?.detail || 'Failed to upload project version.';
      setUploadError(errorMessage);
      alert(errorMessage);
    }
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.not_started;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-red-400 text-lg">Error loading project</p>
        <p className="text-slate-500 text-sm mt-2">{error}</p>
      </div>
    </div>
  );

  if (!projectData) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <p className="text-slate-400">Project not found.</p>
    </div>
  );

  const stages = projectData.stages || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{projectData.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getStatusConfig(projectData.status).bgLight} ${getStatusConfig(projectData.status).textColor}`}>
                {projectData.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-slate-400">
              <span className="hover:text-white cursor-pointer" onClick={() => navigate('/projects')}>All Projects</span>
              <span className="mx-2">/</span>
              <span className="text-white">{projectData.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectData.id}/version-history`)}
            className="p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
            title="View Version History"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-200"
          >
            <Upload size={18} />
            Upload for Approval
          </button>
        </div>
      </div>

      {/* Progress Card with Inline Timeline */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Project Progress</h2>
          <span className="px-4 py-1.5 rounded-full text-lg font-bold bg-white/20 text-white">
            {Math.round(projectData.overall_progress || 0)}%
          </span>
        </div>

        {/* Inline Timeline */}
        {stages.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute top-5 left-0 right-0 h-1 bg-white/20 rounded-full" />
            <div 
              className="absolute top-5 left-0 h-1 bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.round(projectData.overall_progress || 0)}%` }}
            />
            <div className="relative flex justify-between">
              {stages.map((stage, index) => {
                const isCompleted = stage.status === 'completed';
                const isInProgress = stage.status === 'active' || stage.status === 'in_progress';
                const stageProgress = stage.stage_progress || 0;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className="flex flex-col items-center group cursor-pointer"
                    style={{ width: `${100 / stages.length}%` }}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center 
                      transition-all duration-300 group-hover:scale-110 z-10
                      ${isCompleted 
                        ? 'bg-emerald-400 ring-4 ring-emerald-400/30' 
                        : isInProgress 
                          ? 'bg-blue-400 ring-4 ring-blue-400/30 animate-pulse' 
                          : 'bg-white/30 ring-4 ring-white/10'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : isInProgress ? (
                        <span className="text-white text-xs font-bold">{Math.round(stageProgress)}%</span>
                      ) : (
                        <Circle size={16} className="text-white/60" />
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-white text-center px-1 truncate max-w-full group-hover:text-white/80">
                      {stage.template_name}
                    </p>
                    <p className={`text-xs mt-1 ${isCompleted ? 'text-emerald-300' : isInProgress ? 'text-blue-300' : 'text-white/50'}`}>
                      {isCompleted ? 'Done' : isInProgress ? `${Math.round(stageProgress)}%` : 'Pending'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Client</p>
            <p className="text-white font-semibold mt-1">{projectData.client_name}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Start Date</p>
            <p className="text-white font-semibold mt-1">{projectData.start_date || '-'}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Project Lead</p>
            <p className="text-white font-semibold mt-1">{projectData.created_by_details?.name || 'N/A'}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Deadline</p>
            <p className="text-white font-semibold mt-1">{projectData.end_date || projectData.due_date || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Template Assignment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              Project Workflow
            </h2>
            <button
              onClick={handleApplyWorkflow}
              disabled={selectedTemplateIds.length === 0 || isUpdatingWorkflow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all text-sm shadow-lg shadow-blue-500/20"
            >
              {isUpdatingWorkflow ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Initialize Stages
            </button>
          </div>
          
          <p className="text-slate-400 text-sm mb-4">Select workflow templates to initialize new production stages and tasks for this project.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-slate-950 border border-slate-800 rounded-xl custom-scrollbar">
            {workflowTemplates.map(template => (
              <label key={template.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTemplateIds.includes(template.id)}
                  onChange={(e) => {
                    const id = template.id;
                    setSelectedTemplateIds(prev => 
                      e.target.checked ? [...prev, id] : prev.filter(item => item !== id)
                    );
                  }}
                  className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {template.name}
                </span>
              </label>
            ))}
            {workflowTemplates.length === 0 && (
              <p className="text-slate-600 text-sm italic col-span-2 text-center py-4">No templates available.</p>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            Team Members
          </h2>
          <div className="space-y-3">
            {projectData.assigned_users?.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={member.profile_picture || `https://i.pravatar.cc/150?img=${member.id}`}
                  alt={member.name}
                />
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-slate-400">{member.email || 'Team Member'}</p>
                </div>
              </div>
            ))}
            {(!projectData.assigned_users || projectData.assigned_users.length === 0) && (
              <p className="text-slate-500 text-sm">No team members assigned.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload for Approval */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Upload size={20} className="text-purple-500" />
            Upload for Approval
          </h2>
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">Select File:</label>
            <input
              type="file"
              onChange={handleVersionFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
            {projectVersionFile && (
              <p className="mt-2 text-slate-300 text-sm">Selected: <span className="font-semibold">{projectVersionFile.name}</span></p>
            )}
          </div>
          <button
            onClick={handleUploadForApproval}
            disabled={!projectVersionFile}
            className={`w-full px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              projectVersionFile
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Upload Project Version
          </button>
        </div>

        {/* Reference Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Link size={20} className="text-blue-400" />
            Reference Links
          </h2>
          <p className="text-blue-400 break-all">{projectData.reference_links || 'No reference links provided.'}</p>
        </div>
      </div>

      {/* Initial Requirements */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={20} className="text-slate-400" />
          Initial Requirements
        </h2>
        <p className="text-slate-300 whitespace-pre-wrap">{projectData.description || 'No requirements specified.'}</p>
      </div>

      {/* Asset Library */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Image size={20} className="text-emerald-500" />
          Asset Library
        </h2>
        <label className="block border-2 border-dashed border-slate-700 rounded-xl p-8 text-center mb-6 cursor-pointer hover:border-slate-600 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleAssetUpload}
            className="hidden"
          />
          <Upload className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <p className="text-slate-400">Click to upload files or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">FBX, OBJ, MP4, PNG, or JPG</p>
        </label>
        {assetUploadError && (
          <p className="text-rose-500 text-sm mt-2 mb-4">{assetUploadError}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projectData.assets?.map((asset, index) => (
            <div key={index} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <img className="w-full h-24 object-cover" src={asset.thumbnail} alt={asset.name} />
              <p className="p-2 text-sm text-slate-300 truncate">{asset.name}</p>
            </div>
          ))}
          {uploadedAssets.map((asset, index) => (
            <div key={`uploaded-${index}`} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <img className="w-full h-24 object-cover" src={asset.thumbnail} alt={asset.name} />
              <p className="p-2 text-sm text-slate-300 truncate">{asset.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Version History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <History size={20} className="text-violet-500" />
          Project Versions
        </h2>
        <VersionHistory projectId={projectData.id} />
      </div>

      {/* Stage Details Modal */}
      {selectedStage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusConfig(selectedStage.status).bgLight}`}>
                  <Layers size={24} className={getStatusConfig(selectedStage.status).textColor} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedStage.template_name}</h2>
                  <p className="text-sm text-slate-400">Stage Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Stage Progress</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getStatusConfig(selectedStage.status).bgLight} ${getStatusConfig(selectedStage.status).textColor}`}>
                    {selectedStage.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusConfig(selectedStage.status).color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.round(selectedStage.stage_progress || 0)}%` }}
                  />
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">{Math.round(selectedStage.stage_progress || 0)}% Complete</p>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Tasks in this Stage</h3>
              {selectedStage.elements && selectedStage.elements.length > 0 ? (
                <div className="space-y-3">
                  {selectedStage.elements.map((element) => (
                    <div key={element.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{element.template_name}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusConfig(element.status).bgLight} ${getStatusConfig(element.status).textColor}`}>
                          {element.status === 'completed' && <CheckCircle2 size={12} />}
                          {element.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full">
                          <div
                            className={`h-full ${getStatusConfig(element.status).color} rounded-full`}
                            style={{ width: `${Math.round(element.progress || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-10">{Math.round(element.progress || 0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No tasks defined for this stage.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Upload Project Version</h2>
            {uploadError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                {uploadError}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">Select File:</label>
              <input
                type="file"
                onChange={handleVersionFileChange}
                className={`block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer ${uploadError ? 'border-rose-500' : ''}`}
              />
              {projectVersionFile && (
                <p className="mt-2 text-slate-300 text-sm">Selected: <span className="font-semibold">{projectVersionFile.name}</span></p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowUploadModal(false); setProjectVersionFile(null); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadForApproval}
                disabled={!projectVersionFile}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  projectVersionFile
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
