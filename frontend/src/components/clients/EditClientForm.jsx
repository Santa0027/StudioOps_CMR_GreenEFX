import React, { useState, useEffect } from 'react';
import { updateClient } from '../../api/api'; // Import the API function

function EditClientForm({ client, onClose, onEditSuccess }) {
  const [clientName, setClientName] = useState(client.client_name || '');
  const [website, setWebsite] = useState(client.website || '');
  const [contactPerson, setContactPerson] = useState(client.contact_person || '');
  const [status, setStatus] = useState(client.status || 'Active');
  const [logoUrl, setLogoUrl] = useState(client.logo_url || '');
  const [gstNumber, setGstNumber] = useState(client.gst_number || '');
  const [email, setEmail] = useState(client.email || '');
  const [bankName, setBankName] = useState(client.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(client.account_number || '');
  const [ifscCode, setIfscCode] = useState(client.ifsc_code || '');
  const [address, setAddress] = useState(client.address || '');
  const [notes, setNotes] = useState(client.notes || '');
  const [loading, setLoading] = useState(false);

  // Update form fields if client prop changes (e.g., when editing a different client)
  useEffect(() => {
    setClientName(client.client_name || '');
    setWebsite(client.website || '');
    setContactPerson(client.contact_person || '');
    setStatus(client.status || 'Active');
    setLogoUrl(client.logo_url || '');
    setGstNumber(client.gst_number || '');
    setEmail(client.email || '');
    setBankName(client.bank_name || '');
    setAccountNumber(client.account_number || '');
    setIfscCode(client.ifsc_code || '');
    setAddress(client.address || '');
    setNotes(client.notes || '');
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const clientData = {
      client_name: clientName,
      website: website,
      contact_person: contactPerson,
      status: status,
      logo_url: logoUrl,
      gst_number: gstNumber,
      email: email,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      address: address,
      notes: notes,
    };

    try {
      await updateClient(client.id, clientData); // Use updateClient with client.id
      alert('Client updated successfully!');
      if (onEditSuccess) onEditSuccess(); // Refresh client list in parent
      if (onClose) onClose(); // Close form/modal
    } catch (err) {
      console.error('Failed to update client:', err);
      alert('Failed to update client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-700">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Edit Client</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4 md:mb-0">
              <label htmlFor="clientName" className="block text-gray-300 text-sm font-bold mb-2">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., QuantumLeap"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="contactPerson" className="block text-gray-300 text-sm font-bold mb-2">
                Primary Contact
              </label>
              <input
                type="text"
                id="contactPerson"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., Alina Petrova"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., contact@quantumleap.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="website" className="block text-gray-300 text-sm font-bold mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., innovations.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="status" className="block text-gray-300 text-sm font-bold mb-2">
                Status
              </label>
              <select
                id="status"
                className="shadow-sm border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="logoUrl" className="block text-gray-300 text-sm font-bold mb-2">
                Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., https://via.placeholder.com/40/20c997/ffffff?text=QL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4 md:mb-0">
              <label htmlFor="gstNumber" className="block text-gray-300 text-sm font-bold mb-2">
                GST Number
              </label>
              <input
                type="text"
                id="gstNumber"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., 27AABCZ4655P1ZX"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="bankName" className="block text-gray-300 text-sm font-bold mb-2">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., State Bank of India"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="accountNumber" className="block text-gray-300 text-sm font-bold mb-2">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., 1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="mb-4 md:mb-0">
              <label htmlFor="ifscCode" className="block text-gray-300 text-sm font-bold mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                id="ifscCode"
                className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                placeholder="e.g., SBIN0000001"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Other Details</h3>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-300 text-sm font-bold mb-2">
              Address
            </label>
            <textarea
              id="address"
              className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
              placeholder="e.g., 123 Main St, Anytown, Anystate, 12345"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block text-gray-300 text-sm font-bold mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              className="shadow-sm appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
              placeholder="Any other relevant information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="col-span-full flex items-center justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Client'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditClientForm;
