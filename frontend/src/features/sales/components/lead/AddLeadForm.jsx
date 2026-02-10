import React, { useState, useEffect } from 'react';
import { getLeadSources } from '../../../../shared/services/apiClient'; // Import the new API function

const AddLeadForm = ({ onAdd, staffUsers }) => { // Accept staffUsers prop
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    enquiry_status: 'new', // Status for the nested Enquiry
    lead_status: 'open', // Status for the Lead itself
    // services_requested: '', // This will be removed later
    estimated_budget: '',
    expected_delivery_date: '',
    notes: '',
    assigned_to: '', // Add assigned_to field
    source: '', // New field
    source_campaign: '', // New field
    lead_score: 0, // New field
    priority: 'medium', // New field
    next_action: '', // New field
    next_action_date: '', // New field
    lost_reason: '', // New field
  });

  const [leadSources, setLeadSources] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const res = await getLeadSources();
        setLeadSources(res.data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch lead sources:", err);
      }
    };
    fetchLeadSources();
  }, []); // Run once on component mount


  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare the data structure to match the API expectation
    const newLead = {
      enquiry: {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        status: formData.enquiry_status,
      },
      status: formData.lead_status,
      // services_requested: formData.services_requested, // Removed as it's replaced by LeadServiceItem
      estimated_budget: formData.estimated_budget === '' ? null : parseFloat(formData.estimated_budget),
      expected_delivery_date: formData.expected_delivery_date || null,
      notes: formData.notes,
      client: null, // Placeholder, backend might create or handle this
      assigned_to: formData.assigned_to === '' ? null : parseInt(formData.assigned_to), // Use selected assigned_to
      source: formData.source === '' ? null : parseInt(formData.source), // New field
      source_campaign: formData.source_campaign, // New field
      lead_score: formData.lead_score === '' ? 0 : parseInt(formData.lead_score), // New field
      priority: formData.priority, // New field
      next_action: formData.next_action, // New field
      next_action_date: formData.next_action_date || null, // New field
      lost_reason: formData.lost_reason, // New field
    };
    onAdd(newLead);
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      enquiry_status: 'new',
      lead_status: 'open',
      // services_requested: '', // Removed
      estimated_budget: '',
      expected_delivery_date: '',
      notes: '',
      assigned_to: '',
      source: '',
      source_campaign: '',
      lead_score: 0,
      priority: 'medium',
      next_action: '',
      next_action_date: '',
      lost_reason: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-gray-800 text-gray-200 rounded-lg shadow"> {/* Dark style */}
      <h3 className="text-lg font-semibold mb-4 text-white">Enquiry Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="client_name">
            Client Name
          </label>
          <input
            type="text"
            id="client_name"
            value={formData.client_name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="client_email">
            Client Email
          </label>
          <input
            type="email"
            id="client_email"
            value={formData.client_email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="client_phone">
            Client Phone
          </label>
          <input
            type="text"
            id="client_phone"
            value={formData.client_phone}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="enquiry_status">
            Enquiry Status
          </label>
          <select
            id="enquiry_status"
            value={formData.enquiry_status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4 text-white">Lead Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="lead_status">
            Lead Status
          </label>
          <select
            id="lead_status"
            value={formData.lead_status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="open">Open</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="assigned_to">
            Assigned To
          </label>
          <select
            id="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Staff</option>
            {staffUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.user ? user.user.name : user.username || 'Unknown'} {/* Use user.username as fallback */}
              </option>
            ))}
          </select>
        </div>
        
        {/* New Lead Detail Fields */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="source">
            Lead Source
          </label>
          <select
            id="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Source</option>
            {leadSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="source_campaign">
            Source Campaign
          </label>
          <input
            type="text"
            id="source_campaign"
            value={formData.source_campaign}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="lead_score">
            Lead Score
          </label>
          <input
            type="number"
            id="lead_score"
            value={formData.lead_score}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="next_action">
            Next Action
          </label>
          <input
            type="text"
            id="next_action"
            value={formData.next_action}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="next_action_date">
            Next Action Date
          </label>
          <input
            type="date"
            id="next_action_date"
            value={formData.next_action_date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        {formData.lead_status === 'lost' && (
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lost_reason">
              Lost Reason
            </label>
            <textarea
              id="lost_reason"
              value={formData.lost_reason}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500"
              rows="2"
            ></textarea>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          rows="3"
        ></textarea>
      </div>

      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4" // Dark style
      >
        Add Lead
      </button>
    </form>
  );
};

export default AddLeadForm;