import React, { useState, useEffect } from 'react';
import { 
  X, Building2, User, Mail, Globe, Image, 
  CreditCard, Hash, Landmark, FileText, MapPin, StickyNote, Save
} from 'lucide-react';
import { updateClient } from '../../../shared/services/apiClient';

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
      await updateClient(client.id, clientData);
      if (onEditSuccess) onEditSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to update client:', err);
      alert('Failed to update client. Please try again.');
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
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Building2 size={24} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Edit Client</h2>
            <p className="text-sm text-slate-400">Update client information</p>
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
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default EditClientForm;
