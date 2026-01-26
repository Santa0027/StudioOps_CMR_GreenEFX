import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackageItemsForPackage, createPackageItemForPackage, updatePackageItem, deletePackageItem, getPackage } from '../api/api';
import PackageItemForm from '../components/package/PackageItemForm'; // Assuming the form is extracted to a separate component

const PackageItemPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageItems, setPackageItems] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchPackageAndItems = async () => {
    try {
      setLoading(true);
      const [pkgRes, itemsRes] = await Promise.all([
        getPackage(packageId),
        getPackageItemsForPackage(packageId)
      ]);
      setPkg(pkgRes.data);
      setPackageItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to fetch package details or items:', err);
      setError('Failed to fetch package details or items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (packageId) {
        fetchPackageAndItems();
    }
  }, [packageId]);

  const handleAddItemClick = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItemClick = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this package item?')) {
      return;
    }
    try {
      await deletePackageItem(packageId, itemId);
      alert('Package Item deleted successfully!');
      fetchPackageAndItems(); // Refresh list
    } catch (err) {
      console.error('Failed to delete package item:', err);
      setError('Failed to delete package item. Please try again.');
    }
  };

  if (loading) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-gray-100">Loading...</div>;
  if (error) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-red-400">Error: {error}</div>;
  if (!pkg) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-gray-100">Package not found.</div>;

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Items for "{pkg.name}"</h1>
        <button onClick={() => navigate('/packages')} className="text-gray-400 hover:text-white">
            Back to Packages
        </button>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddItemClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
        >
          Add New Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Quantity</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Unit</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packageItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-3 px-4 text-center text-sm text-gray-400">No items found for this package.</td>
              </tr>
            ) : (
              packageItems.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-200">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{item.unit}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    <button
                      onClick={() => handleEditItemClick(item)}
                      className="text-blue-400 hover:text-blue-300 mr-2"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showItemForm && (
        <PackageItemForm
          packageId={packageId}
          initialItem={editingItem}
          onClose={() => setShowItemForm(false)}
          onItemSaved={fetchPackageAndItems}
        />
      )}
    </div>
  );
};

export default PackageItemPage;
