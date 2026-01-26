import React, { useState, useEffect } from 'react';

const EditEnquiryForm = ({ enquiry, onSave, onCancel }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceInterested, setServiceInterested] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');

  useEffect(() => {
    if (enquiry) {
      setClientName(enquiry.client_name || '');
      setClientEmail(enquiry.client_email || '');
      setClientPhone(enquiry.client_phone || '');
      setServiceInterested(enquiry.service_interested || '');
      setBudgetRange(enquiry.budget_range || '');
      setTimeline(enquiry.timeline || '');
      setSource(enquiry.source || '');
      setNotes(enquiry.notes || '');
      setStatus(enquiry.status || 'new');
    }
  }, [enquiry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...enquiry,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      service_interested: serviceInterested,
      budget_range: budgetRange,
      timeline,
      source,
      notes,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-gray-100 rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="clientName">
            Client Name *
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="clientEmail">
            Client Email *
          </label>
          <input
            type="email"
            id="clientEmail"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="clientPhone">
            Client Phone
          </label>
          <input
            type="text"
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="serviceInterested">
            Service Interested
          </label>
          <input
            type="text"
            id="serviceInterested"
            value={serviceInterested}
            onChange={(e) => setServiceInterested(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., Video Production, Graphics Design"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="budgetRange">
            Budget Range
          </label>
          <input
            type="text"
            id="budgetRange"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., $5000-$10000"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="timeline">
            Timeline
          </label>
          <input
            type="text"
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., 2-3 weeks"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="source">
            Source
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social media">Social Media</option>
            <option value="email campaign">Email Campaign</option>
            <option value="phone call">Phone Call</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="4"
            placeholder="Additional information about the enquiry..."
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditEnquiryForm;
