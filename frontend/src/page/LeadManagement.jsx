import React, { useState, useEffect } from 'react';
import AddLeadForm from '../components/lead/AddLeadForm';
import EditLeadForm from '../components/lead/EditLeadForm'; // Import EditLeadForm
import FollowUpModal from '../components/FollowUpModal.jsx'; // Import FollowUpModal
import { useAuth } from '../context/AuthContext'; // Import useAuth

import { getleads,createlead,updatelead,deletelead,getEmployees} from '../api/api';


// 1. Define Status Options for Leads
const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];


const LeadManagement = () => {
  const { user } = useAuth(); // Use useAuth hook
  const currentUserId = user ? user.user_id : null; // Get current user ID (Corrected to user.user_id)

  const [leads, setLeads] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffUsers,setStaffUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [currentLeadForFollowUp, setCurrentLeadForFollowUp] = useState(null);

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await getleads();
      setLeads(res.data)
    }catch (err){
      setError(err);
    }finally{
      setLoading(false);
    }
  }


  const fetchStaffUsers = async()=> {
    try{
      const res = await getEmployees(); // Assuming getUsers fetches all users, including staff
      console.log(res.data)
      if(Array.isArray(res.data)){
        setStaffUsers(res.data);
        console.log(res.data)
      }else {
        console.error("Users API did not return an array : ", res.data)
        setStaffUsers([]);
      }

    }catch(err){
      setError(err);
      console.error("Failed to fetch staff users:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStaffUsers();
  }, []);

  const handleAddLead = async (newLeadData) => {
   try{
    const res  = await createlead(newLeadData); // Use newLeadData here
    setLeads((prev) => [...prev , res.data]);
    setShowAddForm(false);
   }catch (err){
    setError(err);
    console.error("Failed to add lead:", err);
   }
  };

  const handleEditLead = async (updatedLeadData) => {
    try{
      const res = await updatelead(updatedLeadData.id,updatedLeadData);
      setLeads((prev) => // Update leads in the state, not editingLead
      prev.map((e)=> (e.id===updatedLeadData.id ?res.data :e)));
      setEditingLead(null);
      setShowEditForm(false)
    }catch (err){
      setError(err);
      console.error("Failed to edit lead:", err);
    }
  };

  const handleDeleteLead = async (id) => {
    if(!window.confirm("Delete this lead")) return;
    try{
      await deletelead(id);
      setLeads((prev)=> prev.filter((e)=> e.id !==id));
    }catch (err){
      setError(err);
      console.error("Failed to delete lead:", err);
    }
  };

  // --- HANDLE STATUS CHANGE WITH CONFIRM ---
  const handleStatusChange = async (id, newStatus) => {
    const statusLabel = STATUS_OPTIONS.find(s => s.value === newStatus)?.label || newStatus;
    const confirmMsg = `Are you sure you want to change status to "${statusLabel}"?`;
    if (!window.confirm(confirmMsg)) {
      setLeads([...leads]);
      return;
    }

    try {
      const currentLead = leads.find((l) => l.id === id);
      const updatedData = { ...currentLead, status: newStatus };

      await updatelead(id, updatedData);

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      setError(err);
      alert("Failed to update status");
      console.error("Failed to update lead status:", err);
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
      setLeads([...leads]); // Revert UI selection
      return;
    }

    try {
      const currentLead = leads.find((l) => l.id === id);
      // We store the user ID (or name, depending on your backend)
      const updatedData = { ...currentLead, assigned_to: parsedUserId }; // Send as integer

      await updatelead(id, updatedData);

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, assigned_to: parsedUserId } : l))
      );
    } catch (err) {
      setError(err);
      alert("Failed to assign user");
    }
  };
  

  const startEdit = (lead) => {
    setEditingLead(lead);
    setShowEditForm(true);
    setShowAddForm(false); // Hide add form if editing
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "text-blue-400 border-blue-400";
      case "proposal_sent": return "text-cyan-400 border-cyan-400";
      case "negotiation": return "text-yellow-400 border-yellow-400";
      case "won": return "text-emerald-400 border-emerald-400";
      case "lost": return "text-red-400 border-red-400";
      default: return "text-gray-400 border-gray-600";
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400 bg-gray-900 min-h-screen">Loading leads...</div>;
  if (error) return <div className="p-6 text-center text-red-400 bg-gray-900 min-h-screen">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Lead Management</h1>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowEditForm(false); // Hide edit form if showing add form
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {showAddForm ? 'Cancel Add' : 'Add New Lead'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 p-5 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Add New Lead</h2>
          <AddLeadForm onAdd={handleAddLead} staffUsers={staffUsers} />
        </div>
      )}

      {showEditForm && editingLead && (
        <div className="bg-gray-800 p-5 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Edit Lead</h2>
          <EditLeadForm lead={editingLead} onSave={handleEditLead} onCancel={() => {setShowEditForm(false); setEditingLead(null);}} staffUsers={staffUsers} />
        </div>
      )}
      
      {!showAddForm && !showEditForm && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-3 border border-gray-700 text-left">Client Name</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Email</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Phone</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Source</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Lead Score</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Priority</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Next Action</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Assigned To</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Lead Status</th>
                <th className="px-4 py-3 border border-gray-700 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-400">No leads found</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2 border border-gray-700">{lead.enquiry?.client_name}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.enquiry?.client_email}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.enquiry?.client_phone}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.source_details?.name || 'N/A'}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.lead_score}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.priority}</td>
                    <td className="px-4 py-2 border border-gray-700">{lead.next_action}</td>
                    
                    {/* ASSIGN USER DROPDOWN */}
                    <td className="px-4 py-2 border border-gray-700">
                      <select
                        value={lead.assigned_to || ""}
                        onChange={(event) => handleAssignUser(lead.id, event.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 w-full"
                      >
                        <option value="" disabled>Select Staff</option>
                        {staffUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} {/* Corrected to user.name based on UserSerializer */}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td className="px-4 py-2 border border-gray-700">
                      <select
                        value={lead.status || "open"}
                        onChange={(event) => handleStatusChange(lead.id, event.target.value)}
                        className={`bg-gray-800 border rounded px-2 py-1 text-sm font-medium focus:outline-none ${getStatusColor(lead.status)}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value} className="text-gray-200">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-2 border border-gray-700">
                      <button
                        onClick={() => startEdit(lead)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setCurrentLeadForFollowUp(lead);
                          setShowFollowUpModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Follow Up
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showFollowUpModal && currentLeadForFollowUp && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          entityId={currentLeadForFollowUp.id}
          entityType="lead"
          currentUserId={currentUserId}
          onFollowUpAdded={fetchLeads} // Refresh leads after a follow-up
        />
      )}
    </div>
  );
};

export default LeadManagement;
