import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNewTaskForm from '../components/CreateNewTaskForm';
import { getProjectStageElements, getProjects, getEmployees, createTaskAssignment } from '../api/api'; // Import the API functions
import Modal from '../components/Modal'; // Assuming a Modal component for error/loading

function TaskPage() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'rework', 'assigned'
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignableTask, setAssignableTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');

  const processTasks = (tasksData) => {
    const tasksByStage = tasksData.reduce((acc, task) => {
      const stageName = task.stage_name;
      if (!acc[stageName]) {
        acc[stageName] = [];
      }
      acc[stageName].push(task);
      return acc;
    }, {});

    let nextAssignableTask = null;
    for (const stageName in tasksByStage) {
      const stageTasks = tasksByStage[stageName].sort((a, b) => a.order - b.order);
      const firstPending = stageTasks.find(t => t.status !== 'completed');
      if (firstPending) {
        nextAssignableTask = firstPending;
        break; // Found the first assignable task
      }
    }
    setAssignableTask(nextAssignableTask);
  };

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  const handleOpenCreateTaskForm = () => setIsFormOpen(true);
  const handleCloseCreateTaskForm = () => {
    setIsFormOpen(false);
    // Optionally refetch tasks after closing the form if a task was created
    // fetchData(); 
  };

  const handleAssignTask = async (taskId, userId) => {
    try {
      await createTaskAssignment(taskId, { user: userId, role: 'Assignee' });
      const tasksResponse = await getProjectStageElements();
      setTasks(tasksResponse.data);
      processTasks(tasksResponse.data);
    } catch (error) {
      console.error("Failed to assign task", error);
    }
  };

  // Helper function to determine task type for filtering and display
  const getTaskType = (task) => {
    if (task.rejection_notes && task.rejection_notes.length > 0) {
      return 'rework';
    }
    if (task.id === assignableTask?.id) {
        return 'assignable';
    }
    if (task.status === 'in_progress') { // Example: consider in_progress as assigned
        return 'assigned';
    }
    return 'normal';
  };

  if (loading) {
    return (
      <Modal isOpen={loading} onClose={() => {}} title="Loading Data">
        <p>Loading data...</p>
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

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    const type = getTaskType(task);
    return type === currentFilter;
  });

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-4">
          <button
            onClick={handleOpenCreateTaskForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Task
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-2">{project.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{project.project_type}</p>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${project.overall_progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Team: {project.assigned_users.length} members</span>
                <span>Deadline: {new Date(project.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Task List</h2>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setCurrentFilter('all')}
            className={`px-4 py-2 ${currentFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700'} rounded-l-lg`}
          >
            All
          </button>
          <button
            onClick={() => setCurrentFilter('rework')}
            className={`px-4 py-2 ${currentFilter === 'rework' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            Rework ({tasks.filter(t => getTaskType(t) === 'rework').length})
          </button>
          <button
            onClick={() => setCurrentFilter('assigned')}
            className={`px-4 py-2 ${currentFilter === 'assigned' ? 'bg-green-600' : 'bg-gray-700'} rounded-r-lg`}
          >
            Assigned to Me ({tasks.filter(t => getTaskType(t) === 'assigned').length})
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          {filteredTasks.map((task) => {
            const isAssignable = task.id === assignableTask?.id;
            const isCompleted = task.status === 'completed';
            const isAssigned = task.assignments && task.assignments.length > 0; // New check

            return (
              <div
                key={task.id}
                className={`border-b border-gray-700 p-4 ${isAssignable ? 'bg-blue-800' : isCompleted ? 'bg-gray-900' : 'bg-gray-800'}`}
              >
                <div className="flex justify-between items-center">
                  <div onClick={() => navigate(`/tasks/${task.id}`)} className="cursor-pointer flex-grow">
                    <h3 className="font-bold">{task.element_name}</h3>
                    <p className="text-sm text-gray-400">
                      Project: {task.project_name} - Stage: {task.stage_name}
                    </p>
                    {/* New: Current Work Preview */}
                    {task.assets && task.assets.length > 0 && (
                      <div className="mt-2">
                        <img
                          src={task.assets[0].file}
                          alt="Current Work Preview"
                          className="w-24 h-24 object-cover rounded-md border border-gray-600"
                        />
                      </div>
                    )}
                    {/* New: Initial Notes */}
                    {task.initial_notes && (
                      <p className="text-sm text-gray-300 mt-2">
                        Notes: {task.initial_notes.substring(0, 100)}
                        {task.initial_notes.length > 100 ? '...' : ''}
                      </p>
                    )}
                    {/* New: Rework Notes */}
                    {task.rejection_notes && (
                      <p className="text-sm text-red-400 mt-1">
                        Rework: {task.rejection_notes.substring(0, 100)}
                        {task.rejection_notes.length > 100 ? '...' : ''}
                      </p>
                    )}
                    {/* New: Comment Count */}
                    {task.versions && task.versions.length > 0 && (
                      <p className="text-sm text-blue-400 mt-1">
                        {task.versions.length} Comments
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {isAssigned ? ( // Check if already assigned
                      <p className="text-sm text-green-500 font-semibold">Assigned</p>
                    ) : isAssignable ? (
                      <div className="flex items-center">
                        <select
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="bg-gray-700 text-white rounded-lg p-2"
                        >
                          <option value="">Select User</option>
                          {employees.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignTask(task.id, selectedUser)}
                          disabled={!selectedUser}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                        >
                          Assign
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm">Status: <span className={`font-semibold ${task.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{task.status}</span></p>
                    )}
                    <p className="text-xs text-gray-500">Last updated: {new Date(task.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={handleCloseCreateTaskForm} title="Create New Task">
          <CreateNewTaskForm onClose={handleCloseCreateTaskForm} />
        </Modal>
      )}
    </div>
  );
}

export default TaskPage;