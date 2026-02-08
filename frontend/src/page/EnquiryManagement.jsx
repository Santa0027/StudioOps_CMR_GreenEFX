import React, { useEffect, useState } from "react";
import AddEnquiryForm from "../components/Enquirypage/AddEnquiryForm";
import EditEnquiryForm from "../components/Enquirypage/EditEnquiryForm";
import FollowUpModal from "../components/FollowUpModal.jsx";
import { useAuth } from '../context/AuthContext';

import {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEmployees,
} from "../api/api";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const EnquiryManagement = () => {
  const { user } = useAuth();
  const currentUserId = user ? user.user_id : null;

  const [enquiries, setEnquiries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await getEnquiries();
      setEnquiries(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const res = await getEmployees();
      if (Array.isArray(res.data)) {
        setStaffUsers(res.data);
      } else {
        setStaffUsers([]);
      }
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchStaffUsers();
  }, []);

  const handleAddEnquiry = async (data) => {
    try {
      const dataWithDefaults = { ...data, status: "new", assigned_to: null };
      const res = await createEnquiry(dataWithDefaults);
      setEnquiries((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) {
      setError(err);
    }
  };

  const handleEditEnquiry = async (data) => {
    try {
      const res = await updateEnquiry(data.id, data);
      setEnquiries((prev) => prev.map((e) => (e.id === data.id ? res.data : e)));
      setShowEditForm(false);
      setEditingEnquiry(null);
    } catch (err) {
      setError(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const statusLabel = STATUS_OPTIONS.find(s => s.value === newStatus)?.label || newStatus;
    if (!window.confirm(`Change status to "${statusLabel}"?`)) {
      setEnquiries([...enquiries]);
      return;
    }
    try {
      const currentEnquiry = enquiries.find((e) => e.id === id);
      const updatedData = { ...currentEnquiry, status: newStatus };
      await updateEnquiry(id, updatedData);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    } catch (err) {
      setError(err);
    }
  };

  const handleAssignUser = async (id, userId) => {
    const parsedUserId = parseInt(userId);
    const selectedUser = staffUsers.find(u => u.id === parsedUserId);
    const userName = selectedUser?.user?.name || "Unassigned";

    if (!window.confirm(`Assign this to ${userName}?`)) {
      setEnquiries([...enquiries]);
      return;
    }

    try {
      const currentEnquiry = enquiries.find((e) => e.id === id);
      const updatedData = { ...currentEnquiry, assigned_to: parsedUserId };
      await updateEnquiry(id, updatedData);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, assigned_to: parsedUserId } : e)));
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  const startEdit = (enquiry) => {
    setEditingEnquiry(enquiry);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contacted": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "qualified": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "converted": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "lost": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Enquiry Management</h1>
            <p className="text-slate-400 mt-1">Track and manage your customer pipeline efficiently.</p>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              showAddForm 
              ? "bg-slate-700 hover:bg-slate-600 text-white" 
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
            }`}
          >
            {showAddForm ? "Close Form" : (
              <><span className="text-xl">+</span> Add Enquiry</>
            )}
          </button>
        </div>

        {/* FORMS SECTION */}
        {(showAddForm || showEditForm) && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-4">
              {showAddForm ? "Create New Entry" : "Update Information"}
            </h2>
            {showAddForm ? (
              <AddEnquiryForm onAdd={handleAddEnquiry} />
            ) : (
              <EditEnquiryForm
                enquiry={editingEnquiry}
                onSave={handleEditEnquiry}
                onCancel={() => { setShowEditForm(false); setEditingEnquiry(null); }}
              />
            )}
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700/50 text-slate-300 uppercase text-xs font-bold tracking-wider">
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Assigned Representative</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-500 italic">No enquiries found in the database.</td>
                  </tr>
                ) : (
                  enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{e.client_name}</div>
                        <div className="text-sm text-slate-400">{e.client_phone || "No Phone Provided"}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <select
                          value={e.assigned_to || ""}
                          onChange={(event) => handleAssignUser(e.id, event.target.value)}
                          className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full max-w-[180px]"
                        >
                          <option value="" disabled>Unassigned</option>
                          {staffUsers.map((user) => (
                            <option key={user.id} value={user.id}>{user.user.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={e.status || "new"}
                          onChange={(event) => handleStatusChange(e.id, event.target.value)}
                          className={`border rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest focus:outline-none transition-all ${getStatusStyle(e.status)}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value} className="bg-slate-800 text-white">
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(e)}
                            className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          
                          <button
                            onClick={() => { setSelectedEntityId(e.id); setSelectedEntityType('enquiry'); setShowFollowUpModal(true); }}
                            className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                            title="Follow-ups"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          </button>

                          <button
                            onClick={() => handleDeleteEnquiry(e.id)}
                            className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
      </div>

      {showFollowUpModal && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          entityId={selectedEntityId}
          entityType={selectedEntityType}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default EnquiryManagement;