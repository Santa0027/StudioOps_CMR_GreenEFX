import React from 'react';

const InvoiceDetails = () => {
  // Mock data for demonstration
  const clientInfo = {
    name: "Client Company Inc.",
    address: "123 Business St, Suite 400, City, State 12345",
    email: "contact@clientcompany.com"
  };

  const invoiceDetails = {
    id: 'INV-2025-001',
    client: {
      name: "Client Company Inc.",
      address: "123 Business St, Suite 400, City, State 12345",
      email: "contact@clientcompany.com"
    },
    projects: [
      {
        name: "CRM StudioOps Project",
        id: "PROJ-2025-001",
        startDate: "2025-01-15",
        endDate: "2025-03-31",
        budget: 15000,
        tasks: [
          "Frontend UI development for user management module",
          "Backend API integration for client data",
          "Database schema design and implementation",
          "Testing and bug fixing for core functionalities",
        ],
      },
    ],
    totalAmount: 15000,
    date: '2025-03-01',
    dueDate: new Date(new Date('2025-03-01').setMonth(new Date('2025-03-01').getMonth() + 1)).toLocaleDateString(),
    notes: "Thank you for your business! Please make payment by the due date. For any questions regarding this invoice, please contact us."
  };

  // Function to simulate fetching invoice details based on ID (not implemented in this mock)
  // For now, we'll just use the mock invoiceDetails directly

  // If you want to simulate multiple projects
  // const invoiceDetails = {
  //   id: 'INV-2025-002',
  //   client: {
  //     name: "Global Tech Solutions",
  //     address: "456 Tech Ave, Suite 700, Town, State 54321",
  //     email: "info@globaltech.com"
  //   },
  //   projects: [
  //     {
  //       name: "Website Redesign",
  //       id: "PROJ-2025-002",
  //       startDate: "2025-02-01",
  //       endDate: "2025-04-15",
  //       budget: 20000,
  //       tasks: [
  //         "Homepage UI/UX overhaul",
  //         "Backend content management system integration",
  //         "Mobile responsiveness implementation",
  //       ],
  //     },
  //     {
  //       name: "Mobile App Development",
  //       id: "PROJ-2025-004",
  //       startDate: "2025-04-01",
  //       endDate: "2025-07-31",
  //       budget: 25000,
  //       tasks: [
  //         "iOS app UI/UX design",
  //         "Android app development",
  //         "API integration and testing",
  //       ],
  //     },
  //   ],
  //   totalAmount: 45000,
  //   date: '2025-03-15',
  //   dueDate: new Date(new Date('2025-03-15').setMonth(new Date('2025-03-15').getMonth() + 1)).toLocaleDateString(),
  //   notes: "Payment due within 30 days. Contact us for any queries."
  // };
  const calculateTotal = () => {
    return invoiceDetails.totalAmount;
  };

  return (
    <div className="container mx-auto p-6 bg-[#2C2C2E] shadow-lg rounded-lg text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-white">Invoice</h1>

      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-400">CRM StudioOps</h2>
          <p className="text-gray-400">Your Business Address, City, State 12345</p>
          <p className="text-gray-400">contact@crmstudioops.com</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">Invoice # {invoiceDetails.id}</p>
          <p className="text-gray-400">Date: {invoiceDetails.date}</p>
          <p className="text-gray-400">Due Date: {invoiceDetails.dueDate}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-gray-200">Bill To:</h3>
        <p className="text-gray-200 font-medium">{invoiceDetails.client.name}</p>
        <p className="text-gray-400">{invoiceDetails.client.address}</p>
        <p className="text-gray-400">{invoiceDetails.client.email}</p>
      </div>

      {/* Project Details */}
      <div className="mb-8 p-4 bg-gray-800 rounded-md">
        <h3 className="text-xl font-semibold mb-2 text-gray-200">Projects Included:</h3>
        {invoiceDetails.projects.map((project, index) => (
          <div key={index} className="mb-4 last:mb-0 border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
            <p className="text-gray-200"><span className="font-medium">Project Name:</span> {project.name}</p>
            <p className="text-gray-400"><span className="font-medium">Project ID:</span> {project.id}</p>
            <p className="text-gray-400"><span className="font-medium">Start Date:</span> {project.startDate}</p>
            <p className="text-gray-400"><span className="font-medium">End Date:</span> {project.endDate}</p>
            <p className="text-gray-200 mt-2"><span className="font-medium">Budget:</span> ${project.budget.toFixed(2)}</p>
            {project.tasks && project.tasks.length > 0 && (
              <>
                <p className="text-gray-400 mt-2"><span className="font-medium">Key Tasks:</span></p>
                <ul className="list-disc list-inside text-gray-400 ml-4">
                  {project.tasks.map((taskDesc, taskIdx) => (
                    <li key={taskIdx}>{taskDesc}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Total Amount */}
      <div className="mb-8">
        <div className="flex justify-end bg-gray-700 p-4 rounded-md">
          <p className="text-xl font-bold text-gray-100">Total Due: ${calculateTotal().toFixed(2)}</p>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="border-t border-gray-700 pt-6 text-gray-400 text-sm">
        <p>{invoiceDetails.notes}</p>
      </div>
    </div>
  );
};

export default InvoiceDetails;
