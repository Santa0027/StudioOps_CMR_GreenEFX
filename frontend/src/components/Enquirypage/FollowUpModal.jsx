import React, { useState, useEffect } from 'react';
import { createLeadFollowUp, deleteLeadFollowUp, getLeadFollowUps, createFollowUp, deleteFollowUp, getFollowUps } from '../../api/api'; // Import all follow-up API functions

const FollowUpModal = ({ isOpen, onClose, entityId, entityType, currentUserId }) => {
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
        created_by: currentUserId, // Assuming currentUserId is passed and required by backend
      };

      if (isLead) {
        newFollowUpData.lead = entityId;
      } else {
        newFollowUpData.enquiry = entityId;
      }

      const res = await createApi(newFollowUpData);
      setFollowUps((prev) => [...prev, res.data]);
      setNewFollowUpText('');
      setNewFollowUpDate('');
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

    setLoading(true);
    setError(null);
    try {
      await deleteApi(id);
      setFollowUps((prev) => prev.filter((fu) => fu.id !== id));
    } catch (err) {
      setError('Failed to delete follow-up.');
      console.error('Failed to delete follow-up:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Follow-ups for {entityType === 'lead' ? 'Lead' : 'Enquiry'} #{entityId}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && <p className="text-gray-400">Loading follow-ups...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* List existing follow-ups */}
          {followUps.length > 0 ? (
            <ul className="space-y-3 mb-6">
              {followUps.map((fu) => (
                <li key={fu.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm">
                      {new Date(fu.follow_up_date).toLocaleString()} by User {fu.created_by}
                    </p>
                    <p className="text-white mt-1">{fu.notes}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFollowUp(fu.id)}
                    className="text-red-400 hover:text-red-500 ml-4 p-1 rounded-full hover:bg-gray-600 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p className="text-gray-400 mb-4">No follow-ups yet.</p>
          )}

          {/* Add new follow-up form */}
          <form onSubmit={handleAddFollowUp} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Add New Follow-up</h3>
            <div>
              <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-300 mb-1">
                Follow-up Date and Time
              </label>
              <input
                type="datetime-local"
                id="followUpDate"
                value={newFollowUpDate}
                onChange={(e) => setNewFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="followUpNotes"
                rows="3"
                value={newFollowUpText}
                onChange={(e) => setNewFollowUpText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
                placeholder="Add follow-up notes..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Follow-up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
