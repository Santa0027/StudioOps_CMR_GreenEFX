import React, { useState, useEffect } from 'react';
import { X, UserPlus, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getEmployees, createTaskAssignment } from '../../../shared/services/apiClient';

const AssignTaskForm = ({ onClose, task, onAssigned }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('Assignee');
  const [notes, setNotes] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersRes = await getEmployees();
        setUsers(usersRes.data);
      } catch (err) {
        setErrorUsers('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setError(null);
    setSuccess(null);

    if (!task || !selectedUser || !role) {
      setError('Please select a user and provide a role.');
      return;
    }

    setSubmitting(true);

    const assignmentData = {
      user: selectedUser,
      role: role,
      initial_notes: notes,
    };

    try {
      await createTaskAssignment(task.id, assignmentData);
      setSuccess('Task assigned successfully!');
      if (onAssigned) onAssigned();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error assigning task:", err);
      const errorMessage = err.response?.data?.detail || 
                          (err.response?.data && Object.values(err.response.data)[0]) ||
                          'Failed to assign task. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-slate-400 mb-2";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Assign Task</h2>
              <p className="text-xs text-slate-400 mt-0.5">Initialize task production</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Summary Card */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Info size={12} />
              Current Task
            </div>
            <h3 className="text-white font-bold">{task?.element_name}</h3>
            <p className="text-xs text-slate-500 mt-1">{task?.project_name} • {task?.stage_name}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-in shake-in duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userSelect" className={labelClasses}>Select Team Member</label>
              <select
                id="userSelect"
                className={inputClasses}
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                disabled={loadingUsers || submitting}
              >
                <option value="">-- Choose User --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {loadingUsers && <p className="text-[10px] text-slate-500 mt-1 animate-pulse">Loading available members...</p>}
            </div>

            <div>
              <label htmlFor="role" className={labelClasses}>Production Role</label>
              <input
                type="text"
                id="role"
                className={inputClasses}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Lead Animator, Editor"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="notes" className={labelClasses}>Initial Notes / Instructions</label>
              <textarea
                id="notes"
                className={`${inputClasses} min-h-[100px] resize-none`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add specific instructions for this task..."
                disabled={submitting}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !selectedUser || loadingUsers}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Confirm Assignment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskForm;
