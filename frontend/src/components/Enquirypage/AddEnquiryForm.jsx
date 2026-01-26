import React, { useState } from "react";

const AddEnquiryForm = ({ onAdd }) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceInterested, setServiceInterested] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("new");

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
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

    // reset form
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setServiceInterested("");
    setBudgetRange("");
    setTimeline("");
    setSource("");
    setNotes("");
    setStatus("new");
  };



  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Client Email *
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Client Phone
          </label>
          <input
            type="text"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Service Interested
          </label>
          <input
            type="text"
            value={serviceInterested}
            onChange={(e) => setServiceInterested(e.target.value)}
            placeholder="Video Production, Design..."
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Budget Range
          </label>
          <input
            type="text"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            placeholder="$5000 - $10000"
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Timeline
          </label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="2–3 weeks"
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">Select source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social media">Social Media</option>
            <option value="email campaign">Email Campaign</option>
            <option value="phone call">Phone Call</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
            className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded"
        >
          Add Enquiry
        </button>
      </div>
    </form>
  );
};

export default AddEnquiryForm;
