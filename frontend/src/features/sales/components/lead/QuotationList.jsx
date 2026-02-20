import React, { useState, useEffect } from 'react';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  generateQuotationPdf,
  sendQuotation,
  getServices
} from '../../../../shared/services/apiClient';
import QuotationForm from './QuotationForm';
import QuotationItemForm from './QuotationItemForm';
import { FileText, Plus, Edit2, Trash2, Download, Send, Eye, MoreHorizontal, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

const QuotationList = ({ leadId }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showQuotationItemForm, setShowQuotationItemForm] = useState(false);
  const [currentQuotationForItems, setCurrentQuotationForItems] = useState(null);
  const [services, setServices] = useState([]);

  const QUOTATION_STATUS_OPTIONS = [
    { value: "draft", label: "Draft", color: "bg-slate-700 text-slate-300" },
    { value: "sent", label: "Sent", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { value: "accepted", label: "Accepted", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { value: "rejected", label: "Rejected", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    { value: "revised", label: "Revised", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { value: "expired", label: "Expired", color: "bg-slate-800 text-slate-500 border-slate-700" },
  ];

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await getQuotations(leadId);
      setQuotations(res.data);
      console.log(res.data)
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
        fetchQuotations();
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
    try {
      await updateQuotation(id, { status: newStatus });
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

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg text-sm border border-rose-500/20">Error: {error.message}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {!showQuotationItemForm && (
        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <div>
            <h3 className="text-white font-semibold">Quotations List</h3>
            <p className="text-slate-400 text-xs mt-1">Manage proposals sent to this lead</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingQuotation(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showAddForm ? 'bg-slate-700 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}
          >
            {showAddForm ? <><XCircle size={16} /> Cancel</> : <><Plus size={16} /> New Quotation</>}
          </button>
        </div>
      )}

      {showAddForm && (
         <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
           <h3 className="text-lg font-bold text-white mb-4">Create New Quotation</h3>
           <QuotationForm
             onSave={handleAddQuotation}
             onCancel={() => setShowAddForm(false)}
             leadId={leadId}
           />
         </div>
       )}
 
       {editingQuotation && (
         <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-white mb-4">Edit Quotation Details</h3>
           <QuotationForm
             quotation={editingQuotation}
             onSave={handleEditQuotation}
             onCancel={() => setEditingQuotation(null)}
             leadId={leadId}
           />
         </div>
       )}

      {showQuotationItemForm && currentQuotationForItems && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-700">
             <div>
                <h3 className="text-lg font-bold text-white">Manage Items</h3>
                <p className="text-slate-400 text-sm mt-1">Quotation #{currentQuotationForItems.quotation_number || currentQuotationForItems.id}</p>
             </div>
             <button 
                onClick={() => { setShowQuotationItemForm(false); setCurrentQuotationForItems(null); fetchQuotations(); }}
                className="text-slate-400 hover:text-white transition-colors"
             >
                Close Manager
             </button>
          </div>
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

      {!showQuotationItemForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {quotations.length === 0 ? (
             <div className="text-center py-12">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-500 mb-3">
                  <FileText size={24} />
               </div>
               <p className="text-slate-400">No quotations created yet.</p>
               <p className="text-slate-600 text-xs mt-1">Create a new quotation to get started.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="px-6 py-4">Ref #</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {quotations.map((quotation) => {
                     const statusConfig = QUOTATION_STATUS_OPTIONS.find(s => s.value === quotation.status) || QUOTATION_STATUS_OPTIONS[0];
                     return (
                        <tr key={quotation.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                             {quotation.quotation_number || `#${quotation.id}`}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Issued: {quotation.issue_date ? new Date(quotation.issue_date).toLocaleDateString() : 'N/A'}</span>
                                <span className="text-xs text-rose-400/80">Expires: {quotation.expiry_date ? new Date(quotation.expiry_date).toLocaleDateString() : 'N/A'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white font-mono">
                             ${parseFloat(quotation.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                             <select
                                value={quotation.status}
                                onChange={(e) => handleUpdateStatus(quotation.id, e.target.value)}
                                className={`appearance-none bg-transparent ${statusConfig.color} border px-2 py-1 rounded text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:ring-1 focus:ring-blue-500/50 transition-colors border-transparent hover:border-slate-600`}
                             >
                                {QUOTATION_STATUS_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
                                    {opt.label}
                                  </option>
                                ))}
                             </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => startManageItems(quotation)}
                                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Manage Items"
                                >
                                  <div className="flex items-center gap-1.5 text-xs font-medium">
                                     <Edit2 size={14} /> Items
                                  </div>
                                </button>
                                <button
                                  onClick={() => startEditQuotation(quotation)}
                                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                  title="Edit Details"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                                <button
                                  onClick={() => handleGeneratePdf(quotation.id)}
                                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-colors"
                                  title="Generate PDF"
                                >
                                  <Download size={16} />
                                </button>
                                {quotation.pdf_file && (
                                  <a
                                    href={quotation.pdf_file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                                    title="View PDF"
                                  >
                                    <Eye size={16} />
                                  </a>
                                )}
                                {(quotation.status === 'draft' || quotation.status === 'revised') && (
                                  <button
                                    onClick={() => handleSendQuotation(quotation.id)}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                                    title="Mark Sent"
                                  >
                                    <Send size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteQuotation(quotation.id)}
                                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotationList;