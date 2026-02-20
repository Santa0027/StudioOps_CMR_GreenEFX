import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Eye, FolderKanban, Clock, CheckCircle, 
  Pause, Search, Calendar, Users, TrendingUp, History, Upload
} from 'lucide-react';
import { getProjects, deleteProject } from '../../../shared/services/apiClient';
import CreateNewProject from '../components/CreateNewProject';
import EditProjectForm from '../components/EditProjectForm';

const STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20", icon: TrendingUp },
  { value: "review", label: "Review", color: "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20", icon: Eye },
  { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20", icon: CheckCircle },
  { value: "on_hold", label: "On Hold", color: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20", icon: Pause },
];

const PRIORITY_OPTIONS = [
  { value: "high", color: "text-rose-400" },
  { value: "medium", color: "text-amber-400" },
  { value: "low", color: "text-slate-400" },
];

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const StatusIcon = statusObj.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusObj.color}`}>
        <StatusIcon size={12} />
        {statusObj.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityObj = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[2];
    return (
      <span className={`text-xs font-bold uppercase ${priorityObj.color}`}>
        {priority}
      </span>
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-red-400 text-lg">Error loading projects</p>
        <p className="text-slate-500 text-sm mt-2">{error.message}</p>
        <button onClick={fetchProjects} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 mt-2 text-lg">Manage and track all your projects in one place.</p>
        </div>
        <button
          onClick={() => setShowCreateProjectForm(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <FolderKanban size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{projects.filter(p => p.status === 'in_progress').length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{projects.filter(p => p.status === 'completed').length}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">On Hold</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{projects.filter(p => p.status === 'on_hold').length}</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Pause size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-600 transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProjects.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-slate-500 italic">No projects found.</td></tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="font-semibold text-white group-hover:text-blue-400 transition-colors text-left"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{project.client_name || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                    <td className="px-6 py-4">{getPriorityBadge(project.priority)}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {project.assigned_users && project.assigned_users.slice(0, 4).map((user, i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center overflow-hidden"
                            title={user.name}
                          >
                            {user.profile_picture ? (
                              <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-slate-300">{user.name?.charAt(0) || 'U'}</span>
                            )}
                          </div>
                        ))}
                        {project.assigned_users && project.assigned_users.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-slate-300">
                            +{project.assigned_users.length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={14} />
                        {project.due_date || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(project.progress_percentage || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{Math.round(project.progress_percentage || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" 
                          title="View Project"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingProject(project);
                            setShowEditProjectForm(true);
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors" 
                          title="Edit Project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/projects/${project.id}/version-history`)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-colors" 
                          title="Version History"
                        >
                          <History size={16} />
                        </button>
                        <div className="h-4 w-px bg-slate-800 mx-1"></div>
                        <button 
                          onClick={() => handleDeleteProject(project.id)} 
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" 
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProjectForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CreateNewProject onClose={() => setShowCreateProjectForm(false)} onProjectAdded={fetchProjects} />
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectForm && editingProject && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <EditProjectForm
              project={editingProject}
              onClose={() => {
                setShowEditProjectForm(false);
                setEditingProject(null);
              }}
              onProjectUpdated={fetchProjects}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
