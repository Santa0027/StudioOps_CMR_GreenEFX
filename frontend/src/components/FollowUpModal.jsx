import React, { useState, useEffect } from 'react';
import { createLeadFollowUp, deleteLeadFollowUp, getLeadFollowUps, createFollowUp, deleteFollowUp, getFollowUps } from '../api/api';
import { X, Trash2, Calendar, Clock, Send, MessageSquare } from 'lucide-react';

const FollowUpModal = ({ isOpen, onClose, entityId, entityType, currentUserId, onFollowUpAdded }) => {
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUpText, setNewFollowUpText] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLead = entityType === 'lead';
  const fetchApi = isLead ? getLeadFollowUps : getFollowUps;
  const createApi = isLead ? createLeadFollowUp : createFollowUp;
  const deleteApi = isLead ? deleteLeadFollowUp : deleteFollowUp;

  const fetchEntityFollowUps = async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi();
      const filteredFollowUps = res.data.filter(
        (fu) => (isLead ? fu.lead === entityId : fu.enquiry === entityId)
      );
      // Sort by date descending
      filteredFollowUps.sort((a, b) => new Date(b.follow_up_date) - new Date(a.follow_up_date));
      setFollowUps(filteredFollowUps);
    } catch (err) {
      setError('Failed to fetch follow-ups.');
      console.error('Failed to fetch follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEntityFollowUps();
    }
  }, [isOpen, entityId, entityType]);

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!newFollowUpText.trim() || !newFollowUpDate.trim()) {
      alert('Please enter both notes and a follow-up date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newFollowUpData = {
        follow_up_date: newFollowUpDate,
        notes: newFollowUpText,
        created_by: currentUserId,
      };

      if (isLead) {
        newFollowUpData.lead = entityId;
      } else {
        newFollowUpData.enquiry = entityId;
      }

      const res = await createApi(newFollowUpData);
      setFollowUps((prev) => [res.data, ...prev]); // Add new at top
      setNewFollowUpText('');
      setNewFollowUpDate('');
      if (onFollowUpAdded) onFollowUpAdded();
    } catch (err) {
      setError('Failed to add follow-up.');
      console.error('Failed to add follow-up:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFollowUp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this follow-up?')) {
      return;
    }

    try {
      await deleteApi(id);
      setFollowUps((prev) => prev.filter((fu) => fu.id !== id));
      if (onFollowUpAdded) onFollowUpAdded();
    } catch (err) {
      setError('Failed to delete follow-up.');
      console.error('Failed to delete follow-up:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Follow-ups Timeline</h2>
                <p className="text-slate-400 text-xs">{isLead ? 'Lead' : 'Enquiry'} #{entityId}</p>
              </div>
           </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950/30 custom-scrollbar">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* New Follow-up Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-8">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-blue-400"/> Schedule New Follow-up
            </h3>
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newFollowUpDate}
                      onChange={(e) => setNewFollowUpDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
                      required
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Notes</label>
                 <textarea
                    rows="2"
                    value={newFollowUpText}
                    onChange={(e) => setNewFollowUpText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none placeholder-slate-600"
                    placeholder="Enter discussion points or next steps..."
                    required
                  ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !currentUserId}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {loading ? (
                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : <Send size={16} />} 
                   {loading ? 'Saving...' : 'Add Follow-up'}
                </button>
              </div>
            </form>
             {!currentUserId && (
                <p className="text-xs text-rose-400 mt-2 text-center bg-rose-500/5 p-2 rounded">
                  ⚠️ You must be logged in to add follow-ups.
                </p>
              )}
          </div>

          {/* Timeline */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {loading && followUps.length === 0 ? (
               <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
               </div>
            ) : followUps.length > 0 ? (
              followUps.map((fu) => (
                <div key={fu.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                     <Clock size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 bg-slate-800 border border-slate-700/50 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <time className="font-mono text-xs text-blue-400 font-medium">
                        {new Date(fu.follow_up_date).toLocaleDateString()}
                        <span className="text-slate-500 mx-2">|</span>
                        {new Date(fu.follow_up_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </time>
                      <button
                        onClick={() => handleDeleteFollowUp(fu.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{fu.notes}</p>
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                       <div className="h-5 w-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                          U
                       </div>
                       <span className="text-xs text-slate-500">Created by {fu.created_by || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-500 mb-3">
                   <Calendar size={24} />
                </div>
                <p className="text-slate-400">No follow-ups recorded yet.</p>
                <p className="text-slate-600 text-xs mt-1">Schedule one above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;