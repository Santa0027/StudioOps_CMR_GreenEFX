import React, { useState, useEffect } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage } from '../../../shared/services/apiClient';
import AddPackageForm from '../components/AddPackageForm';
import EditPackageForm from '../components/EditPackageForm';
import { useNavigate } from 'react-router-dom';


const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPackageForm, setShowAddPackageForm] = useState(false);
  const [showEditPackageForm, setShowEditPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const navigate = useNavigate();


  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackages();
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError('Failed to fetch packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }
    try {
      await deletePackage(id);
      alert('Package deleted successfully!');
      fetchPackages(); // Refresh list
    } catch (err) {
      console.error('Failed to delete package:', err);
      setError('Failed to delete package. Please try again.');
    }
  };

  const handleManageItemsClick = (pkg) => {
    navigate(`/master/packages/${pkg.id}/items`);
  };

  if (loading) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-gray-100">Loading packages...</div>;
  if (error) return <div className="container mx-auto p-6 bg-[#2C2C2E] min-h-screen text-red-400">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Work Packages</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddPackageForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors duration-200"
        >
          Add New Package
        </button>
      </div>

      {/* Existing Packages List */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Existing Work Packages</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Items</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Frequency</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-3 px-4 text-center text-sm text-gray-400">No packages found.</td>
              </tr>
            ) : (
              packages.map(pkg => (
                <tr key={pkg.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-200">{pkg.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{pkg.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">
                    <ul className="list-disc list-inside">
                      {pkg.items.map((item, idx) => (
                        <li key={idx}>{item.quantity} {item.unit} {item.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-200">${parseFloat(pkg.price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-200">{pkg.frequency}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setShowEditPackageForm(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleManageItemsClick(pkg)}
                      className="text-green-400 hover:text-green-300 mr-2"
                      title="Manage Items"
                    >
                      Manage Items
                    </button>
                    <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddPackageForm && (
        <AddPackageForm
          onClose={() => setShowAddPackageForm(false)}
          onPackageAdded={fetchPackages}
        />
      )}

      {showEditPackageForm && editingPackage && (
        <EditPackageForm
          package={editingPackage}
          onClose={() => {
            setShowEditPackageForm(false);
            setEditingPackage(null);
          }}
          onPackageUpdated={fetchPackages}
        />
      )}
    </div>
  );
};

export default PackageManagement;