import React, { useState, useEffect } from 'react';
import { getQuotationItems, createQuotationItem, updateQuotationItem, deleteQuotationItem } from '../../../../shared/services/apiClient';
import { Plus, Trash2, Edit2, Save, X, DollarSign, Package } from 'lucide-react';

const QuotationItemForm = ({ quotation, services, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    service: '',
    description: '',
    quantity: 1,
    unit_price: 0.00,
  });
  const [editingItem, setEditingItem] = useState(null);

  const fetchQuotationItems = async () => {
    try {
      setLoading(true);
      const res = await getQuotationItems(quotation.id);
      setItems(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch quotation items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationItems();
  }, [quotation.id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleServiceChange = (e) => {
    const serviceId = parseInt(e.target.value);
    const selectedService = services.find(s => s.id === serviceId);
    setFormData((prev) => ({
      ...prev,
      service: serviceId,
      description: selectedService ? selectedService.name : '',
      unit_price: selectedService ? selectedService.base_price : 0.00,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        quotation: quotation.id,
        service: formData.service || null,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
      };

      if (editingItem) {
        await updateQuotationItem(editingItem.id, dataToSave);
      } else {
        await createQuotationItem(dataToSave);
      }
      setFormData({ service: '', description: '', quantity: 1, unit_price: 0.00 });
      setEditingItem(null);
      fetchQuotationItems();
    } catch (err) {
      setError(err);
      console.error("Failed to save quotation item:", err);
    }
  };

  const startEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      service: item.service || '',
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    });
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteQuotationItem(id);
      fetchQuotationItems(); // Refresh list
    } catch (err) {
      setError(err);
      console.error("Failed to delete quotation item:", err);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg text-sm border border-rose-500/20">Error: {error.message}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Item Form Card */}
      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 shadow-sm">
        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
           <Plus size={16} className="text-blue-500" />
           {editingItem ? 'Edit Line Item' : 'Add Line Item'}
        </h4>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
             <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Service Type</label>
             <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <select
                  id="service"
                  value={formData.service}
                  onChange={handleServiceChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Custom Item</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-slate-600"
              required
              placeholder="Item details..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Qty</label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Unit Price</label>
            <div className="relative">
               <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
               <input
                type="number"
                id="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end">
             {editingItem ? (
                 <div className="flex gap-2 w-full">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex justify-center items-center"
                      title="Update"
                    >
                       <Save size={16} />
                    </button>
                     <button
                      type="button"
                      onClick={() => { setEditingItem(null); setFormData({ service: '', description: '', quantity: 1, unit_price: 0.00 }); }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg transition-colors flex justify-center items-center"
                      title="Cancel"
                    >
                       <X size={16} />
                    </button>
                 </div>
             ) : (
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex justify-center items-center shadow-lg shadow-blue-500/20"
                  title="Add Item"
                >
                  <Plus size={20} />
                </button>
             )}
          </div>
        </form>
      </div>

      {/* Items Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No items added to this quotation yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <th className="px-5 py-3 w-12">#</th>
                  <th className="px-5 py-3">Service / Description</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-right">Unit Price</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors group">
                     <td className="px-5 py-3 text-xs text-slate-500 font-mono">{index + 1}</td>
                    <td className="px-5 py-3">
                       <div className="font-medium text-slate-200 text-sm">{item.service_name || 'Custom Item'}</div>
                       <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-300 font-mono">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-sm text-slate-300 font-mono">${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-white font-mono">${parseFloat(item.total_price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => startEditItem(item)}
                          className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900/50 border-t border-slate-800">
                  <tr>
                      <td colSpan="4" className="px-5 py-3 text-right text-sm font-medium text-slate-400">Total Amount:</td>
                      <td className="px-5 py-3 text-right text-base font-bold text-white font-mono">
                          ${items.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}
                      </td>
                      <td></td>
                  </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Check & Close
        </button>
      </div>
    </div>
  );
};

export default QuotationItemForm;
