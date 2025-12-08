import React, { useState } from 'react';

const PackageManagement = () => {
  const [packages, setPackages] = useState([
    {
      id: 'PKG-001',
      name: 'Social Media Monthly Standard',
      description: 'Standard monthly package for social media content.',
      items: [
        { name: 'Static Posters', quantity: 4, unit: 'count' },
        { name: 'Short Video Reels', quantity: 1, unit: 'count' },
        { name: 'Motion Graphics', quantity: 1, unit: 'count' },
      ],
      price: 1500,
      frequency: 'Monthly',
    },
    {
      id: 'PKG-002',
      name: 'Website Launch Package',
      description: 'Comprehensive package for launching a new website.',
      items: [
        { name: 'Website Pages Design', quantity: 5, unit: 'count' },
        { name: 'Content Writing', quantity: 10, unit: 'pages' },
        { name: 'SEO Setup', quantity: 1, unit: 'project' },
      ],
      price: 5000,
      frequency: 'One-time',
    },
  ]);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    items: [{ name: '', quantity: '', unit: '' }],
    price: '',
    frequency: 'Monthly',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPackage(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...newPackage.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setNewPackage(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setNewPackage(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: '', unit: '' }]
    }));
  };

  const removeItem = (index) => {
    const newItems = newPackage.items.filter((_, i) => i !== index);
    setNewPackage(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `PKG-${String(packages.length + 1).padStart(3, '0')}`;
    setPackages(prev => [...prev, { ...newPackage, id, price: parseFloat(newPackage.price) }]);
    setNewPackage({
      name: '',
      description: '',
      items: [{ name: '', quantity: '', unit: '' }],
      price: '',
      frequency: 'Monthly',
    });
  };

  const handleDelete = (id) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
  };

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Work Packages</h1>

      {/* Add New Package Form */}
      <div className="mb-8 p-6 bg-gray-800 rounded-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Create New Package</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Package Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newPackage.name}
              onChange={handleChange}
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              id="description"
              name="description"
              value={newPackage.description}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Package Items */}
          <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-200">Package Items</h3>
          <div className="space-y-3">
            {newPackage.items.map((item, index) => (
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
                {newPackage.items.length > 1 && (
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
                value={newPackage.price}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={newPackage.frequency}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#1C1C1E] border border-gray-700 rounded-md shadow-sm p-2 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow-lg transition-colors duration-200"
            >
              Add Package
            </button>
          </div>
        </form>
      </div>

      {/* Existing Packages List */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Existing Work Packages</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Package ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Items</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Frequency</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-3 px-4 text-sm text-gray-200">{pkg.id}</td>
                <td className="py-3 px-4 text-sm text-gray-200">{pkg.name}</td>
                <td className="py-3 px-4 text-sm text-gray-200">{pkg.description}</td>
                <td className="py-3 px-4 text-sm text-gray-200">
                  <ul className="list-disc list-inside">
                    {pkg.items.map((item, idx) => (
                      <li key={idx}>{item.quantity} {item.unit} {item.name}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-200">${pkg.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-sm text-gray-200">{pkg.frequency}</td>
                <td className="py-3 px-4 text-center text-sm">
                  <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageManagement;
