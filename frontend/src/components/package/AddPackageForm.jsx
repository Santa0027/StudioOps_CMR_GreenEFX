import React, { useState, useEffect } from 'react';
import { createPackage } from '../../api/api';

const AddPackageForm = ({ onPackageAdded, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: '' }]);
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState('monthly'); // Default to 'monthly' or 'one_time' as per backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: '', unit: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const packageData = {
      name,
      description,
      // Ensure items are correctly formatted for the backend (e.g., quantity as int)
      items: items.map(item => ({
        name: item.name,
        quantity: parseInt(item.quantity, 10), // Ensure quantity is an integer
        unit: item.unit,
      })),
      price: parseFloat(price),
      frequency: frequency,
    };

    try {
      await createPackage(packageData);
      alert('Package added successfully!');
      if (onPackageAdded) onPackageAdded();
      if (onClose) onClose();
      // Reset form
      setName('');
      setDescription('');
      setItems([{ name: '', quantity: '', unit: '' }]);
      setPrice('');
      setFrequency('monthly');
    } catch (err) {
      console.error('Failed to add package:', err);
      if (err.response && err.response.data) {
        // Attempt to parse specific error messages from the backend
        let errorMessages = [];
        for (const key in err.response.data) {
          if (Array.isArray(err.response.data[key])) {
            errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${err.response.data[key]}`);
          }
        }
        setError(`Failed to add package: ${errorMessages.join('; ')}`);
      } else {
        setError('Failed to add package. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">Add New Package</h2>
        {error && <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Package Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-200">Package Items</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-3 border border-gray-700 rounded-md bg-gray-700">
                <div>
                  <label htmlFor={`item-name-${index}`} className="block text-sm font-medium text-gray-300">Item Name</label>
                  <input
                    type="text"
                    id={`item-name-${index}`}
                    name="name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, e)}
                    className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`item-quantity-${index}`} className="block text-sm font-medium text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id={`item-quantity-${index}`}
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`item-unit-${index}`} className="block text-sm font-medium text-gray-300">Unit (e.g., count, pages)</label>
                  <input
                    type="text"
                    id={`item-unit-${index}`}
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, e)}
                    className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="one_time">One-time</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackageForm;