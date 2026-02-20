import React, { useState, useEffect } from 'react';
import { createPackageItemForPackage, updatePackageItem } from '../../../shared/services/apiClient';

const PackageItemForm = ({ packageId, initialItem, onClose, onItemSaved }) => {
  const [name, setName] = useState(initialItem ? initialItem.name : '');
  const [quantity, setQuantity] = useState(initialItem ? initialItem.quantity : '');
  const [unit, setUnit] = useState(initialItem ? initialItem.unit : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setQuantity(initialItem.quantity || '');
      setUnit(initialItem.unit || '');
    } else {
        setName('');
        setQuantity('');
        setUnit('');
    }
  }, [initialItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const itemData = {
      name,
      quantity: parseInt(quantity),
      unit,
    };

    try {
      if (initialItem && initialItem.id) {
        await updatePackageItem(packageId, initialItem.id, itemData);
        alert('Package Item updated successfully!');
      } else {
        await createPackageItemForPackage(packageId, itemData);
        alert('Package Item added successfully!');
      }
      if (onItemSaved) onItemSaved();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to save package item:', err);
      setError('Failed to save package item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] p-8 rounded-lg shadow-lg max-w-md mx-auto border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-white text-center">{initialItem ? 'Edit Package Item' : 'Add New Package Item'}</h2>
        {error && <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Item Name</label>
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
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-300">Unit (e.g., count, pages)</label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
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
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageItemForm;
