import React, { useState, useEffect } from 'react';
import { getQuotationItems, createQuotationItem, updateQuotationItem, deleteQuotationItem } from '../../api/api';

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
        service: formData.service || null, // Allow null if no service selected
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
      fetchQuotationItems(); // Refresh list
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

  if (loading) return <div className="text-gray-400">Loading items...</div>;
  if (error) return <div className="text-red-400">Error: {error.message}</div>;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-white mb-4">Items for Quotation # {quotation.quotation_number || quotation.id}</h4>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-300">Service</label>
          <select
            id="service"
            value={formData.service}
            onChange={handleServiceChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a Service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-300">Unit Price</label>
          <input
            type="number"
            id="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="md:col-span-3 flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => { setEditingItem(null); setFormData({ service: '', description: '', quantity: 1, unit_price: 0.00 }); }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>

      <h5 className="text-md font-semibold text-white mb-2">Current Items</h5>
      {items.length === 0 ? (
        <p className="text-gray-400">No items added to this quotation yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Service</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Qty</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Unit Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Total</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{item.service_name || 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${parseFloat(item.total_price).toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default QuotationItemForm;
