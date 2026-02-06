import React, { useState, useEffect } from 'react';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  generateQuotationPdf,
  sendQuotation,
  getServices
} from '../../api/api';
import QuotationForm from './QuotationForm'; // Will create this next
import QuotationItemForm from './QuotationItemForm'; // Will create this too

const QuotationList = ({ leadId }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showQuotationItemForm, setShowQuotationItemForm] = useState(false);
  const [currentQuotationForItems, setCurrentQuotationForItems] = useState(null);
  const [services, setServices] = useState([]); // For populating service dropdowns

  const QUOTATION_STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "revised", label: "Revised" },
    { value: "expired", "label": "Expired" },
  ];

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await getQuotations(leadId);
      setQuotations(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch services:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchServices();
  }, [leadId]);

  const handleAddQuotation = async (newQuotationData) => {
    try {
      const dataToSend = { ...newQuotationData, lead: leadId };
      const res = await createQuotation(dataToSend);
      setQuotations((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) {
      setError(err);
      console.error("Failed to add quotation:", err);
    }
  };

  const handleEditQuotation = async (updatedQuotationData) => {
    try {
      const res = await updateQuotation(updatedQuotationData.id, updatedQuotationData);
      setQuotations((prev) =>
        prev.map((q) => (q.id === updatedQuotationData.id ? res.data : q))
      );
      setEditingQuotation(null);
      setShowAddForm(false);
    } catch (err) {
      setError(err);
      console.error("Failed to edit quotation:", err);
    }
  };

  const handleDeleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await deleteQuotation(id);
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err);
      console.error("Failed to delete quotation:", err);
    }
  };

  const handleGeneratePdf = async (id) => {
    try {
      const res = await generateQuotationPdf(id);
      if (res.data.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
        alert("PDF generated and opened in a new tab!");
        fetchQuotations(); // Refresh to show pdf_file URL
      } else {
        alert("PDF generation initiated. No direct download URL returned.");
      }
    } catch (err) {
      setError(err);
      alert("Failed to generate PDF.");
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleSendQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to send this quotation?")) return;
    try {
      await sendQuotation(id);
      alert("Quotation marked as sent!");
      fetchQuotations();
    } catch (err) {
      setError(err);
      alert("Failed to send quotation.");
      console.error("Failed to send quotation:", err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;
    try {
      await updateQuotation(id, { status: newStatus }); // Simplified for status update
      alert("Quotation status updated!");
      fetchQuotations();
    } catch (err) {
      setError(err);
      alert("Failed to update status.");
      console.error("Failed to update quotation status:", err);
    }
  };

  const startEditQuotation = (quotation) => {
    setEditingQuotation(quotation);
    setShowAddForm(false);
  };

  const startManageItems = (quotation) => {
    setCurrentQuotationForItems(quotation);
    setShowQuotationItemForm(true);
  };

  if (loading) return <div className="text-gray-400">Loading quotations...</div>;
  if (error) return <div className="text-red-400">Error: {error.message}</div>;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Quotations</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingQuotation(null);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
        >
          {showAddForm ? 'Cancel Add' : 'Add New Quotation'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Add Quotation</h3>
          <QuotationForm
            onSave={handleAddQuotation}
            onCancel={() => setShowAddForm(false)}
            leadId={leadId}
          />
        </div>
      )}

      {editingQuotation && (
        <div className="mb-4 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Edit Quotation</h3>
          <QuotationForm
            quotation={editingQuotation}
            onSave={handleEditQuotation}
            onCancel={() => setEditingQuotation(null)}
            leadId={leadId}
          />
        </div>
      )}

      {showQuotationItemForm && currentQuotationForItems && (
        <div className="mb-4 p-4 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Manage Quotation Items for # {currentQuotationForItems.quotation_number || currentQuotationForItems.id}</h3>
          <QuotationItemForm
            quotation={currentQuotationForItems}
            services={services}
            onClose={() => {
              setShowQuotationItemForm(false);
              setCurrentQuotationForItems(null);
              fetchQuotations(); // Refresh quotations after item changes
            }}
          />
        </div>
      )}

      {quotations.length === 0 ? (
        <p className="text-gray-400">No quotations for this lead yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Issue Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Expiry Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Total</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {quotations.map((quotation) => (
                <tr key={quotation.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{quotation.quotation_number || quotation.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(quotation.issue_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(quotation.expiry_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${parseFloat(quotation.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditQuotation(quotation)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuotation(quotation.id)}
                      className="text-red-600 hover:text-red-900 mr-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleGeneratePdf(quotation.id)}
                      className="text-purple-600 hover:text-purple-900 mr-2"
                    >
                      Generate PDF
                    </button>
                    {quotation.pdf_file && (
                      <a
                        href={quotation.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View PDF
                      </a>
                    )}
                    {(quotation.status === 'draft' || quotation.status === 'revised') && (
                      <button
                        onClick={() => handleSendQuotation(quotation.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Send
                      </button>
                    )}
                    <select
                      value={quotation.status}
                      onChange={(e) => handleUpdateStatus(quotation.id, e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded text-gray-300 px-2 py-1 text-xs"
                    >
                      {QUOTATION_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => startManageItems(quotation)}
                      className="text-yellow-600 hover:text-yellow-900 ml-2"
                    >
                      Manage Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotationList;