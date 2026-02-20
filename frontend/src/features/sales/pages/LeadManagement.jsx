import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Calendar, FileText, 
  UserPlus, CheckCircle, ChevronRight, Filter, Search, MoreVertical 
} from 'lucide-react';
import AddLeadForm from '../components/lead/AddLeadForm.jsx';
import EditLeadForm from '../components/lead/EditLeadForm.jsx';
import FollowUpModal from '../components/enquiry/FollowUpModal.jsx';
import QuotationList from '../components/lead/QuotationList.jsx';
import { useAuth } from '../../../shared/context/AuthContext';
import { getleads, createlead, updatelead, deletelead, getEmployees } from '../../../shared/services/apiClient';

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20" },
  { value: "negotiation", label: "Negotiation", color: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" },
  { value: "won", label: "Won", color: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  { value: "lost", label: "Lost", color: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20" },
];

const LeadManagement = () => {
  const { user } = useAuth();
  const currentUserId = user ? user.user_id : null;

  const [leads, setLeads] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffUsers, setStaffUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [currentLeadForFollowUp, setCurrentLeadForFollowUp] = useState(null);
  const [showQuotationManagement, setShowQuotationManagement] = useState(false);
  const [currentLeadForQuotation, setCurrentLeadForQuotation] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await getleads();
      console.log("Fetched leads:", res.data);
      setLeads(res.data);
    } catch (err) { setError(err); } 
    finally { setLoading(false); }
  };

  const fetchStaffUsers = async () => {
    try {
      const res = await getEmployees();
      if (Array.isArray(res.data)) setStaffUsers(res.data);
      console.log("Fetched staff users:", res.data);
    } catch (err) { console.error("Staff fetch error:", err); }
  };

  useEffect(() => {
    fetchLeads();
    fetchStaffUsers();
  }, []);

  const handleAddLead = async (newLeadData) => {
    try {
      const res = await createlead(newLeadData);
      setLeads((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) { setError(err); }
  };

  const handleEditLead = async (updatedLeadData) => {
    try {
      const res = await updatelead(updatedLeadData.id, updatedLeadData);
      setLeads((prev) => prev.map((e) => (e.id === updatedLeadData.id ? res.data : e)));
      setEditingLead(null);
      setShowEditForm(false);
    } catch (err) { setError(err); }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await deletelead(id);
      setLeads((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { setError(err); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const currentLead = leads.find((l) => l.id === id);
      const updatedData = { ...currentLead, status: newStatus };
      await updatelead(id, updatedData);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    } catch (err) { alert("Failed to update status"); }
  };

  const handleAssignUser = async (id, userId) => {
    const parsedUserId = parseInt(userId);
    const selectedUser = staffUsers.find(u => u.id === parsedUserId);
    const userName = selectedUser?.username || "Staff";
    
    if (!window.confirm(`Assign this lead to ${userName}?`)) return;

    try {
      const currentLead = leads.find((l) => l.id === id);
      await updatelead(id, { ...currentLead, assigned_to: parsedUserId });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, assigned_to: parsedUserId } : l)));
    } catch (err) { alert("Failed to assign"); }
  };

  const startEdit = (lead) => {
    setEditingLead(lead);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lead Management</h1>
          <p className="text-slate-400 mt-2 text-lg">Track, manage, and convert your business opportunities.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
            showAddForm 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
          }`}
        >
          {showAddForm ? 'Cancel' : <><Plus size={20} /> Add New Lead</>}
        </button>
      </div>

      {/* Quick Stats Summary */}
      {!showAddForm && !showEditForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Leads</p>
                <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Filter size={20} />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Won Opportunities</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{leads.filter(l => l.status === 'won').length}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
           <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Negotiation</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{leads.filter(l => l.status === 'negotiation').length}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <FileText size={20} />
              </div>
            </div>
          </div>
           <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">Proposal Sent</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">{leads.filter(l => l.status === 'proposal_sent').length}</p>
              </div>
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                <FileText size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Container */}
      {(showAddForm || (showEditForm && editingLead)) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
               <h2 className="text-xl font-bold text-white">
                 {showAddForm ? 'Create New Lead' : 'Edit Lead Details'}
               </h2>
               <button 
                onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingLead(null); }}
                className="text-slate-400 hover:text-white transition-colors"
               >
                 Close
               </button>
            </div>
            {showAddForm && <AddLeadForm onAdd={handleAddLead} staffUsers={staffUsers} />}
            {showEditForm && editingLead && (
              <EditLeadForm 
                lead={editingLead} 
                onSave={handleEditLead} 
                onCancel={() => { setShowEditForm(false); setEditingLead(null); }} 
                staffUsers={staffUsers} 
              />
            )}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      {!showAddForm && !showEditForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-white">All Leads</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-600 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Source & Score</th>
                  <th className="px-6 py-4">Assignments</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {leads.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-16 text-slate-500 italic">No leads found in the system.</td></tr>
                ) : (
                  leads.map((lead) => {
                    const statusObj = STATUS_OPTIONS.find(s => s.value === (lead.status || 'open'));
                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                {lead.enquiry?.client_name?.charAt(0) || 'C'}
                             </div>
                             <div>
                                <div className="font-semibold text-white group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => startEdit(lead)}>
                                  {lead.enquiry?.client_name || 'Unknown Client'}
                                </div>
                                <div className="text-sm text-slate-400 flex flex-col">
                                  <span>{lead.enquiry?.client_email}</span>
                                  <span className="text-xs text-slate-500">{lead.enquiry?.client_phone}</span>
                                </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                {lead.source_details?.name || 'N/A'}
                              </span>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-400">Score: <b className="text-blue-400">{lead.lead_score}</b></span>
                                {lead.priority && (
                                  <span className={`uppercase font-bold ${
                                    lead.priority === 'high' ? 'text-rose-400' : 
                                    lead.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'
                                  }`}>
                                    {lead.priority}
                                  </span>
                                )}
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide font-semibold">
                              <UserPlus size={12} /> Assigned Staff
                            </label>
                            <select
                              value={lead.assigned_to || ""}
                              onChange={(e) => handleAssignUser(lead.id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-full max-w-[160px] cursor-pointer hover:border-slate-600 transition-colors"
                            >
                              <option value="" disabled>Select Staff</option>
                              {staffUsers.map((u) => <option key={u.id} value={u.id}>{u.user.name}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                             <div className="relative">
                                <select
                                  value={lead.status || "open"}
                                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                  className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer border border-transparent hover:border-slate-600 transition-all ${statusObj?.color || 'bg-slate-800 text-slate-400'}`}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value} className="bg-slate-900 text-slate-300">
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                   <ChevronRight size={12} className="rotate-90" />
                                </div>
                             </div>
                             
                             {lead.next_action && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                   <Calendar size={12} className="text-slate-600" />
                                   <span className="truncate max-w-[120px]" title={lead.next_action}>Next: {lead.next_action}</span>
                                </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => startEdit(lead)} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" 
                              title="Edit Lead"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => { setCurrentLeadForFollowUp(lead); setShowFollowUpModal(true); }} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" 
                              title="Follow Up"
                            >
                              <Calendar size={16} />
                            </button>
                            <button 
                              onClick={() => { setCurrentLeadForQuotation(lead); setShowQuotationManagement(true); }} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-colors" 
                              title="Manage Quotations"
                            >
                              <FileText size={16} />
                            </button>
                            <div className="h-4 w-px bg-slate-800 mx-1"></div>
                            <button 
                              onClick={() => handleDeleteLead(lead.id)} 
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" 
                              title="Delete Lead"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowUpModal && currentLeadForFollowUp && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          entityId={currentLeadForFollowUp.id}
          entityType="lead"
          currentUserId={currentUserId}
          onFollowUpAdded={fetchLeads}
        />
      )}

      {/* Quotation Management Modal */}
      {showQuotationManagement && currentLeadForQuotation && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-0 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
               <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-purple-500" size={24} />
                    Quotations
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Manage proposals for <span className="text-white font-medium">{currentLeadForQuotation.enquiry?.client_name}</span>
                  </p>
               </div>
               <button 
                onClick={() => { setShowQuotationManagement(false); setCurrentLeadForQuotation(null); }} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2.5 rounded-full transition-all"
               >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30 custom-scrollbar">
               <QuotationList leadId={currentLeadForQuotation.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;