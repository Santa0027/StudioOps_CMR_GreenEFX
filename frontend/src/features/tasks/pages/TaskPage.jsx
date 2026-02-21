import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ListTodo, CheckCircle2, RotateCcw, User2, 
  FolderKanban, Calendar, Clock, MessageSquare, Image, AlertTriangle, UserPlus
} from 'lucide-react';
import { getProjectStageElements, getProjects, getEmployees } from '../../../shared/services/apiClient';
import CreateNewTaskForm from '../components/CreateNewTaskForm';
import AssignTaskForm from '../components/AssignTaskForm';
import Modal from '../../../shared/components/Modal';

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20" },
  { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  { value: "rework", label: "Rework", color: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20" },
];

function TaskPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignableTask, setAssignableTask] = useState(null);
  const [taskToAssign, setTaskToAssign] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse, employeesResponse] = await Promise.all([
        getProjectStageElements(),
        getProjects(),
        getEmployees(),
      ]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setEmployees(employeesResponse.data);
      processTasks(tasksResponse.data);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const processTasks = (tasksData) => {
    const tasksByStage = tasksData.reduce((acc, task) => {
      const stageName = task.stage_name;
      if (!acc[stageName]) acc[stageName] = [];
      acc[stageName].push(task);
      return acc;
    }, {});

    let nextAssignableTask = null;
    for (const stageName in tasksByStage) {
      const stageTasks = tasksByStage[stageName].sort((a, b) => a.order - b.order);
      const firstPending = stageTasks.find(t => t.status !== 'completed');
      if (firstPending) {
        nextAssignableTask = firstPending;
        break;
      }
    }
    setAssignableTask(nextAssignableTask);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenAssignModal = (task) => {
    setTaskToAssign(task);
    setIsAssignModalOpen(true);
  };

  const handleTaskAssigned = () => {
    fetchAllData();
  };

  const getTaskType = (task) => {
    if (task.rejection_notes && task.rejection_notes.length > 0) return 'rework';
    if (task.id === assignableTask?.id) return 'assignable';
    if (task.status === 'in_progress' || (task.assignments && task.assignments.length > 0)) return 'assigned';
    return 'normal';
  };

  const getStatusBadge = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusObj.color}`}>
        {statusObj.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-red-400 text-lg">Error loading tasks</p>
        <p className="text-slate-500 text-sm mt-2">{error}</p>
      </div>
    </div>
  );

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    return getTaskType(task) === currentFilter;
  });

  const reworkCount = tasks.filter(t => getTaskType(t) === 'rework').length;
  const assignedCount = tasks.filter(t => getTaskType(t) === 'assigned').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-2 text-lg">Track and manage all your project tasks.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
        >
          <Plus size={20} />
          Create New Task
        </button>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <ListTodo size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{completedCount}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Rework</p>
              <p className="text-3xl font-bold text-rose-400 mt-1">{reworkCount}</p>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <RotateCcw size={20} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Assigned</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{assignedCount}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <User2 size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderKanban size={20} className="text-blue-500" />
          Active Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project) => (
            <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white">{project.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">{project.project_type}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{project.overall_progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.overall_progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <User2 size={14} />
                  {project.assigned_user_details?.length || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No date'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Task List</h2>
          
          {/* Filter Tabs */}
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setCurrentFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCurrentFilter('rework')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentFilter === 'rework' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw size={14} />
              Rework
              {reworkCount > 0 && (
                <span className="bg-rose-500/30 text-rose-200 text-xs px-1.5 py-0.5 rounded-full">{reworkCount}</span>
              )}
            </button>
            <button
              onClick={() => setCurrentFilter('assigned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentFilter === 'assigned' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User2 size={14} />
              Assigned
              {assignedCount > 0 && (
                <span className="bg-emerald-500/30 text-emerald-200 text-xs px-1.5 py-0.5 rounded-full">{assignedCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Task Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-500 italic">No tasks found.</div>
          ) : (
            filteredTasks.map((task) => {
              const isAssignable = task.id === assignableTask?.id || (!task.assignments || task.assignments.length === 0);
              const isCompleted = task.status === 'completed';
              const isAssigned = task.assignments && task.assignments.length > 0;
              const isRework = task.rejection_notes && task.rejection_notes.length > 0;

              return (
                <div
                  key={task.id}
                  className={`p-5 transition-colors ${
                    isAssignable && !isAssigned ? 'bg-blue-500/5' : 
                    isRework ? 'bg-rose-500/5' : 
                    isCompleted ? 'bg-emerald-500/5' : ''
                  } hover:bg-slate-800/50`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div className="flex items-start gap-3">
                        <div className="flex-grow">
                          <h3 className="font-bold text-white hover:text-blue-400 transition-colors">{task.element_name || task.template_name}</h3>
                          <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                            <FolderKanban size={14} />
                            {task.project_name}
                            <span className="text-slate-600">•</span>
                            Stage: {task.stage_name || task.template_name}
                          </p>
                          
                          {/* Notes Preview */}
                          {task.initial_notes && (
                            <p className="text-sm text-slate-400 mt-2 line-clamp-1 italic text-blue-300/70">
                              "{task.initial_notes}"
                            </p>
                          )}
                          
                          {/* Rework Warning */}
                          {isRework && (
                            <div className="flex items-center gap-2 mt-2 text-rose-400 text-sm font-medium">
                              <RotateCcw size={14} />
                              <span className="line-clamp-1">{task.rejection_notes}</span>
                            </div>
                          )}
                          
                          {/* Meta Info */}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              ID: #{task.id}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={12} />
                              Updated: {new Date(task.updated_at || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {isAssigned ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                            <CheckCircle2 size={12} />
                            Assigned
                          </span>
                          {task.assignments && task.assignments.map(a => (
                            <span key={a.id} className="text-[10px] text-slate-500 font-medium">
                              {a.user_name} ({a.role})
                            </span>
                          ))}
                        </div>
                      ) : isAssignable ? (
                        <button
                          onClick={() => handleOpenAssignModal(task)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20"
                        >
                          <UserPlus size={16} />
                          Assign Now
                        </button>
                      ) : (
                        getStatusBadge(task.status)
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Task">
          <CreateNewTaskForm onClose={() => setIsCreateModalOpen(false)} />
        </Modal>
      )}

      {/* Assign Task Modal */}
      {isAssignModalOpen && taskToAssign && (
        <AssignTaskForm 
          task={taskToAssign} 
          onClose={() => {
            setIsAssignModalOpen(false);
            setTaskToAssign(null);
          }} 
          onAssigned={handleTaskAssigned}
        />
      )}
    </div>
  );
}

export default TaskPage;
