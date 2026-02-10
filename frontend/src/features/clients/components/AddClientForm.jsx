import React, { useState } from 'react';
import { 
  X, Building2, User, Mail, Globe, Image, 
  CreditCard, Hash, Landmark, FileText, MapPin, StickyNote
} from 'lucide-react';
import { createClient } from '../../../shared/services/apiClient';

function AddClientForm({ onClose, onAddSuccess }) {
  const [clientName, setClientName] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [status, setStatus] = useState('Active');
  const [logoUrl, setLogoUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      await createClient(clientData);
      if (onAddSuccess) onAddSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to add client:', err);
      alert('Failed to add client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "flex items-center gap-2 text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Building2 size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add New Client</h2>
            <p className="text-sm text-slate-400">Fill in the details below</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <User size={18} className="text-blue-500" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className={labelClasses}>
                <Building2 size={14} />
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                className={inputClasses}
                placeholder="e.g., QuantumLeap"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className={labelClasses}>
                <User size={14} />
                Primary Contact *
              </label>
              <input
                type="text"
                id="contactPerson"
                className={inputClasses}
                placeholder="e.g., Alina Petrova"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>
                <Mail size={14} />
                Email *
              </label>
              <input
                type="email"
                id="email"
                className={inputClasses}
                placeholder="e.g., contact@quantumleap.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="website" className={labelClasses}>
                <Globe size={14} />
                Website
              </label>
              <input
                type="url"
                id="website"
                className={inputClasses}
                placeholder="e.g., https://innovations.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="status" className={labelClasses}>
                Status
              </label>
              <select
                id="status"
                className={inputClasses + " cursor-pointer"}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="logoUrl" className={labelClasses}>
                <Image size={14} />
                Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                className={inputClasses}
                placeholder="e.g., https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <CreditCard size={18} className="text-emerald-500" />
            Financial Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gstNumber" className={labelClasses}>
                <Hash size={14} />
                GST Number
              </label>
              <input
                type="text"
                id="gstNumber"
                className={inputClasses}
                placeholder="e.g., 27AABCZ4655P1ZX"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bankName" className={labelClasses}>
                <Landmark size={14} />
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                className={inputClasses}
                placeholder="e.g., State Bank of India"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="accountNumber" className={labelClasses}>
                <FileText size={14} />
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                className={inputClasses}
                placeholder="e.g., 1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ifscCode" className={labelClasses}>
                <Hash size={14} />
                IFSC Code
              </label>
              <input
                type="text"
                id="ifscCode"
                className={inputClasses}
                placeholder="e.g., SBIN0000001"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Other Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <StickyNote size={18} className="text-amber-500" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className={labelClasses}>
                <MapPin size={14} />
                Address
              </label>
              <textarea
                id="address"
                className={inputClasses + " resize-none"}
                placeholder="e.g., 123 Main St, Anytown, Anystate, 12345"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
              />
            </div>
            <div>
              <label htmlFor="notes" className={labelClasses}>
                <StickyNote size={14} />
                Notes
              </label>
              <textarea
                id="notes"
                className={inputClasses + " resize-none"}
                placeholder="Any other relevant information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            'Add Client'
          )}
        </button>
      </div>
    </div>
  );
}

export default AddClientForm;
