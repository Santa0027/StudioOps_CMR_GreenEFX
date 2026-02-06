import React, { useState, useEffect } from 'react';

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
    // Ensure expiry_date is a valid date string
    const formattedExpiryDate = formData.expiry_date || ''; // Handle empty string if date not selected

    const dataToSave = {
      ...formData,
      expiry_date: formattedExpiryDate,
      // For updates, the lead ID should be taken from the existing quotation object
      // For new quotations, it comes from leadId prop
      lead: quotation ? quotation.lead : leadId,
      // Any other fields that need to be sent (e.g., initial status, total_amount if calculated client-side)
    };
    // Ensure lead is passed as an integer ID
    if (dataToSave.lead) {
      dataToSave.lead = parseInt(dataToSave.lead);
    }

    onSave(quotation ? { ...quotation, ...dataToSave } : dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-300">Expiry Date</label>
        <input
          type="date"
          id="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {quotation ? 'Save Changes' : 'Add Quotation'}
        </button>
      </div>
    </form>
  );
};

export default QuotationForm;
