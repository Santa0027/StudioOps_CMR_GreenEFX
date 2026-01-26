import React, { useState } from 'react';

const AddLeadForm = ({ onAdd, staffUsers }) => { // Accept staffUsers prop
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    enquiry_status: 'new', // Status for the nested Enquiry
    lead_status: 'open', // Status for the Lead itself
    services_requested: '',
    estimated_budget: '',
    expected_delivery_date: '',
    notes: '',
    assigned_to: '', // Add assigned_to field
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
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
      services_requested: formData.services_requested,
      estimated_budget: formData.estimated_budget === '' ? null : parseFloat(formData.estimated_budget),
      expected_delivery_date: formData.expected_delivery_date || null,
      notes: formData.notes,
      client: null, // Placeholder, backend might create or handle this
      assigned_to: formData.assigned_to === '' ? null : parseInt(formData.assigned_to), // Use selected assigned_to
    };
    onAdd(newLead);
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      enquiry_status: 'new',
      lead_status: 'open',
      services_requested: '',
      estimated_budget: '',
      expected_delivery_date: '',
      notes: '',
      assigned_to: '',
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          >
            <option value="">Select Staff</option>
            {staffUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.user ? user.user.name : 'Unknown'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="services_requested">
            Services Requested
          </label>
          <input
            type="text"
            id="services_requested"
            value={formData.services_requested}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="estimated_budget">
            Estimated Budget
          </label>
          <input
            type="number"
            id="estimated_budget"
            value={formData.estimated_budget}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="expected_delivery_date">
            Expected Delivery Date
          </label>
          <input
            type="date"
            id="expected_delivery_date"
            value={formData.expected_delivery_date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-indigo-500" // Dark style
          />
        </div>
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
