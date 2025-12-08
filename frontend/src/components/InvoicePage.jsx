import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const InvoicePage = () => {
  // Mock data for invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV-2025-001', client: 'Client Company Inc.', projects: ['CRM StudioOps Project'], amount: 15000, status: 'Paid', date: '2025-03-01' },
    { id: 'INV-2025-002', client: 'Global Tech Solutions', projects: ['Website Redesign', 'Mobile App Development'], amount: 45000, status: 'Pending', date: '2025-03-15' },
    { id: 'INV-2025-003', client: 'Creative Marketing Agency', projects: ['Social Media Campaign'], amount: 10000, status: 'Overdue', date: '2025-02-20' },
  ]);

  const handleDelete = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Invoices</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-200">All Invoices</h2>
        <Link to="/invoice/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
          Create New Invoice
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1C1C1E] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Invoice ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Client</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Projects</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-3 px-4 text-sm text-gray-200">{invoice.id}</td>
                <td className="py-3 px-4 text-sm text-gray-200">{invoice.client}</td>
                <td className="py-3 px-4 text-sm text-gray-200">
                  {invoice.projects.map((project, idx) => (
                    <div key={idx}>{project}</div>
                  ))}
                </td>
                <td className="py-3 px-4 text-sm text-gray-200">${invoice.amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-sm text-gray-200">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${invoice.status === 'Paid' ? 'bg-green-700 text-green-100' :
                       invoice.status === 'Pending' ? 'bg-yellow-700 text-yellow-100' :
                       'bg-red-700 text-red-100'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-200">{invoice.date}</td>
                <td className="py-3 px-4 text-center text-sm">
                  <Link to={`/invoice/${invoice.id}`} className="text-blue-400 hover:text-blue-200 mr-4">View</Link>
                  <button onClick={() => handleDelete(invoice.id)} className="text-red-400 hover:text-red-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicePage;
