import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Save, X } from 'lucide-react';

const QuotationForm = ({ quotation, onSave, onCancel, leadId }) => {
  const [formData, setFormData] = useState({
    expiry_date: '',
    notes: '',
  });

  useEffect(() => {
    if (quotation) {
      setFormData({
        expiry_date: quotation.expiry_date || '',
        notes: quotation.notes || '',
      });
    }
  }, [quotation]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedExpiryDate = formData.expiry_date || ''; 

    const dataToSave = {
      ...formData,
      expiry_date: formattedExpiryDate,
      lead: quotation ? quotation.lead : leadId,
    };
   
    if (dataToSave.lead) {
      dataToSave.lead = parseInt(dataToSave.lead);
    }

    onSave(quotation ? { ...quotation, ...dataToSave } : dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="expiry_date" className="block text-sm font-medium text-slate-400 mb-2">Expiry Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input
              type="date"
              id="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
              required
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-400 mb-2">Notes & Terms</label>
        <div className="relative">
           <FileText className="absolute left-3 top-3 text-slate-500" size={16} />
           <textarea
            id="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none placeholder-slate-600"
            placeholder="Add relevant notes, terms, or conditions..."
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Save size={16} />
          {quotation ? 'Update Quotation' : 'Create Quotation'}
        </button>
      </div>
    </form>
  );
};

export default QuotationForm;
