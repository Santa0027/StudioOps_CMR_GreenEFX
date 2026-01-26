import React, { useState, useEffect } from 'react';
import AddClientForm from './AddClientForm';
import EditClientForm from './EditClientForm'; // Import EditClientForm
import { getClients, createClient, updateClient, deleteClient } from '../api/api';

function ClientManagement() {
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditClientForm, setShowEditClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);


  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }
    try {
      await deleteClient(id);
      alert("Client deleted successfully!");
      fetchClients(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete client:", err);
      alert("Failed to delete client. Please try again.");
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-300';
      case 'On Hold':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'Archived':
        return 'bg-gray-500/20 text-gray-300';
      default:
        return '';
    }
  };

  if (loading) return <div className="flex-1 overflow-auto p-6 text-center text-gray-400">Loading clients...</div>;
  if (error) return <div className="flex-1 overflow-auto p-6 text-center text-red-400">Error: {error.message}</div>;

  return (
    <div className="flex-1 overflow-auto p-6">
      <header className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <button
          onClick={() => setShowAddClientForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition duration-200 ease-in-out"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Client
        </button>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <div className="relative">
            <select className="bg-[#2a2a2a] text-white text-sm py-2 px-3 rounded-md appearance-none pr-8">
              <option>Status: All</option>
              <option>Active</option>
              <option>On Hold</option>
              <option>Archived</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
            <select className="bg-[#2a2a2a] text-white text-sm py-2 px-3 rounded-md appearance-none pr-8">
              <option>Project Type</option>
              <option>Web Development</option>
              <option>Mobile App</option>
              <option>UI/UX Design</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="relative">
            <select className="bg-[#2a2a2a] text-white text-sm py-2 px-3 rounded-md appearance-none pr-8">
              <option>Date Added</option>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="p-2 bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          </button>
          <button className="p-2 bg-blue-600 rounded-md text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {/* Assuming client.logo_url exists, otherwise a placeholder */}
                    <img src={client.logo_url || 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=CL'} alt={`${client.client_name} logo`} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{client.client_name}</p>
                    <p className="text-sm text-gray-400">{client.website}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setShowEditClientForm(true);
                    }}
                    className="text-yellow-500 hover:text-yellow-600 mr-2"
                    title="Edit Client"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete Client"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-400">Primary Contact</p>
                <p className="font-medium">{client.contact_person}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 border-t border-gray-800 pt-4">
              <div className="flex items-center text-sm text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6m-2 0V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H3"></path></svg>
                {/* Assuming there's a way to get active project count */}
                {/* {client.projects} Active Projects */} 0 Active Projects
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(client.status)}`}>
                {client.status}
              </span>
            </div>
          </div>
        ))}
        {/* Add New Client Card */}
        <div
          onClick={() => setShowAddClientForm(true)}
          className="bg-[#2a2a2a] p-6 rounded-lg shadow-md border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 cursor-pointer"
        >
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-sm">Add New Client</p>
        </div>
      </div>

      {showAddClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <AddClientForm onClose={() => setShowAddClientForm(false)} onAddSuccess={fetchClients} />
        </div>
      )}

      {showEditClientForm && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <EditClientForm
            client={editingClient}
            onClose={() => {
              setShowEditClientForm(false);
              setEditingClient(null);
            }}
            onEditSuccess={fetchClients}
          />
        </div>
      )}
    </div>
  );
}

export default ClientManagement;
