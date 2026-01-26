import React, { useEffect, useState } from "react";
import AddEnquiryForm from "../components/Enquirypage/AddEnquiryForm";
import EditEnquiryForm from "../components/Enquirypage/EditEnquiryForm";
import FollowUpModal from "../components/FollowUpModal.jsx"; // Import FollowUpModal
import { useAuth } from '../context/AuthContext'; // Import useAuth

import {
  getEnquiries,
  createEnquiry,
  updateEnquiry, // Assuming this handles both status and assignment updates
  deleteEnquiry,
  getEmployees, // Import getEmployees
} from "../api/api";

// 1. Define Status Options
const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

// 2. Define Users List (In a real app, you might fetch this from an API)
const STAFF_USERS = []; // Will be fetched dynamically

const EnquiryManagement = () => {
  const { user } = useAuth(); // Use useAuth hook
  const currentUserId = user ? user.user_id : null; // Get current user ID (Corrected to user.user_id)

  console.log("EnquiryManagement: User from useAuth:", user); // Added log
  console.log("EnquiryManagement: currentUserId:", currentUserId); // Added log

  const [enquiries, setEnquiries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]); // State for staff users

  const [showFollowUpModal, setShowFollowUpModal] = useState(false); // State for modal visibility
  const [selectedEntityId, setSelectedEntityId] = useState(null); // State for selected lead/enquiry ID
  const [selectedEntityType, setSelectedEntityType] = useState(null); // State for selected entity type ('enquiry' or 'lead')


  // FETCH ENQUIRIES
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

  // FETCH STAFF USERS (Employees)
  const fetchStaffUsers = async () => {
    try {
      const res = await getEmployees(); // Call getEmployees
      console.log("Employees API response data:", res.data); // Log response data
      if (Array.isArray(res.data)) {
        setStaffUsers(res.data);
      } else {
        console.error("Employees API did not return an array:", res.data);
        setStaffUsers([]); // Ensure it's always an array
      }
    } catch (err) {
      setError(err);
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchStaffUsers(); // Fetch staff users (employees) when component mounts
  }, []);

  // CREATE
  const handleAddEnquiry = async (data) => {
    try {
      const dataWithDefaults = { ...data, status: "new", assigned_to: null };
      const res = await createEnquiry(dataWithDefaults);
      setEnquiries((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err)  {
      setError(err);
    }
  };

  // UPDATE (Full Edit Form)
  const handleEditEnquiry = async (data) => {
    try {
      const res = await updateEnquiry(data.id, data);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === data.id ? res.data : e))
      );
      setShowEditForm(false);
      setEditingEnquiry(null);
    } catch (err) {
      setError(err);
    }
  };

  // --- HANDLE STATUS CHANGE WITH CONFIRM ---
  const handleStatusChange = async (id, newStatus) => {
    // 1. Confirm First
    const statusLabel = STATUS_OPTIONS.find(s => s.value === newStatus)?.label || newStatus;
    const confirmMsg = `Are you sure you want to change status to "${statusLabel}"?`;
    if (!window.confirm(confirmMsg)) {
      // If cancelled, we force a re-render to snap the dropdown back to original value
      // (This trick works because we haven't updated the state yet)
      setEnquiries([...enquiries]); 
      return;
    }

    try {
      const currentEnquiry = enquiries.find((e) => e.id === id);
      const updatedData = { ...currentEnquiry, status: newStatus };

      await updateEnquiry(id, updatedData);

      // Update UI
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      setError(err);
      alert("Failed to update status");
    }
  };

  // --- HANDLE ASSIGN USER WITH CONFIRM ---
  const handleAssignUser = async (id, userId) => {
    const parsedUserId = parseInt(userId); // Ensure userId is an integer

    // 1. Find user name for the prompt
    // Assuming employee objects fetched from API have a 'username' field, otherwise adjust to 'name' or 'first_name'
    const selectedUser = staffUsers.find(u => u.id === parsedUserId);
    const userName = (selectedUser && selectedUser.username) ? selectedUser.username : "Unassigned"; // Corrected to user.username

    // 2. Confirm First
    const confirmMsg = `Are you sure you want to assign this to ${userName}?`; // Corrected variable usage
    if (!window.confirm(confirmMsg)) {
      setEnquiries([...enquiries]); // Revert UI selection
      return;
    }

    try {
      const currentEnquiry = enquiries.find((e) => e.id === id);
      // We store the user ID (or name, depending on your backend)
      const updatedData = { ...currentEnquiry, assigned_to: parsedUserId }; // Send as integer

      await updateEnquiry(id, updatedData);

      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, assigned_to: parsedUserId } : e))
      );
    } catch (err) {
      setError(err);
      alert("Failed to assign user");
    }
  };

  // DELETE
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

  const handleOpenFollowUpModal = (id, type) => {
    setSelectedEntityId(id);
    setSelectedEntityType(type);
    setShowFollowUpModal(true);
  };

  const handleCloseFollowUpModal = () => {
    setShowFollowUpModal(false);
    setSelectedEntityId(null);
    setSelectedEntityType(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "text-blue-400 border-blue-400";
      case "contacted": return "text-cyan-400 border-cyan-400";
      case "qualified": return "text-yellow-400 border-yellow-400";
      case "converted": return "text-emerald-400 border-emerald-400";
      case "lost": return "text-red-400 border-red-400";
      default: return "text-gray-400 border-gray-600";
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400 bg-gray-900 min-h-screen">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-400 bg-gray-900 min-h-screen">{error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Enquiry Management</h1>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {showAddForm ? "Cancel" : "Add Enquiry"}
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-gray-800 p-5 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Add New Enquiry</h2>
          <AddEnquiryForm onAdd={handleAddEnquiry} />
        </div>
      )}

      {/* EDIT FORM */}
      {showEditForm && editingEnquiry && (
        <div className="bg-gray-800 p-5 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Edit Enquiry</h2>
          <EditEnquiryForm
            enquiry={editingEnquiry}
            onSave={handleEditEnquiry}
            onCancel={() => { setShowEditForm(false); setEditingEnquiry(null); }}
          />
        </div>
      )}

      {/* TABLE */}
      {!showAddForm && !showEditForm && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-3 border border-gray-700 text-left">Client Name</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Phone</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Assigned To</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Status</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-400">No enquiries found</td></tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2 border border-gray-700">{e.client_name}</td>
                    <td className="px-4 py-2 border border-gray-700">{e.client_phone || "-"}</td>
                    
                    {/* ASSIGN USER DROPDOWN */}
                    <td className="px-4 py-2 border border-gray-700">
                      <select
                        value={e.assigned_to || ""}
                        onChange={(event) => handleAssignUser(e.id, event.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 w-full"
                      >
                        <option value="" disabled>Select Staff</option>
                        {staffUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.user.name} {/* Corrected to user.username */}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td className="px-4 py-2 border border-gray-700">
                      <select
                        value={e.status || "new"}
                        onChange={(event) => handleStatusChange(e.id, event.target.value)}
                        className={`bg-gray-800 border rounded px-2 py-1 text-sm font-medium focus:outline-none ${getStatusColor(e.status)}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value} className="text-gray-200">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-2 border border-gray-700 flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(e)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded mr-2 flex items-center justify-center"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5a2.25 2.25 0 012.25-2.25H9M16.862 4.487L13.5 7.837" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEnquiry(e.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded flex items-center justify-center"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.161H7.636a2.25 2.25 0 01-2.244-2.161L4.735 6.536m10.027-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.161H7.636a2.25 2.25 0 01-2.244-2.161L4.735 6.536m10.027-3.21c.342.052.682.107 1.022.166M9.25 5.25v-1.5a1.5 1.5 0 011.5-1.5h2.5a1.5 1.5 0 011.5 1.5v1.5M4.5 6h15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenFollowUpModal(e.id, 'enquiry')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded flex items-center justify-center"
                        title="Follow-ups"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25H21M7.5 1.5h7.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25H21" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={handleCloseFollowUpModal}
          entityId={selectedEntityId}
          entityType={selectedEntityType}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default EnquiryManagement;