import React from 'react';

function Dashboard() {
  const projects = [
    { name: 'Project "Orion"', client: 'Nova Corp', dueDate: '2024-12-15', status: 'In Progress' },
    { name: 'Nebula Rebrand', client: 'Galactic Studios', dueDate: '2024-11-30', status: 'Completed' },
    { name: 'Vortex Animation', client: 'Cosmo Ent.', dueDate: '2025-01-20', status: 'On Hold' },
    { name: 'Astra Commercial', client: 'Starlight Inc.', dueDate: '2024-12-05', status: 'In Progress' },
    { name: 'Cyberflow UI Kit', client: 'SynthWave Co.', dueDate: '2024-10-28', status: 'Completed' },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-teal-500/20 text-teal-300';
      case 'Completed':
        return 'bg-green-500/20 text-green-300';
      case 'On Hold':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Top Nav/Header */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div className="relative flex items-center bg-[#2a2a2a] rounded-lg px-4 py-2 w-80">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="bg-transparent outline-none text-white text-sm w-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <svg className="w-6 h-6 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#1a1a1a]"></span>
          </div>
          <div className="flex items-center space-x-2 bg-[#2a2a2a] rounded-full p-1 pr-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">
              {/* User Avatar Placeholder */}
            </div>
            <div>
              <span className="block text-sm font-semibold">Admin</span>
              <span className="block text-xs text-gray-400">Creative Director</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back, Admin! Here's your studio's performance snapshot.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-4xl font-bold mt-1">42</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3l-2.5 4L7 9m2 2l3 3m0 0l3 3m-3-3l-6 6"></path></svg>
            </div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Completed This Month</p>
              <p className="text-4xl font-bold mt-1">18</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Monthly Revenue</p>
              <p className="text-4xl font-bold mt-1">$125,430</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0H9m3 0h3"></path></svg>
            </div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
              <p className="text-4xl font-bold mt-1">5</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 15h.01M10 15h.01M13 15h.01M16 15h.01M8 20h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            {/* Placeholder for Revenue Chart */}
            <div className="h-48 flex items-center justify-center bg-gray-800 rounded-md mt-4">
              <img src="https://via.placeholder.com/600x200/2a2a2a/7c3aed?text=Revenue+Chart" alt="Revenue Chart Placeholder" className="w-full h-full object-cover"/>
            </div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Project Status</h2>
            {/* Placeholder for Project Status Chart */}
            <div className="flex flex-col items-center justify-center mt-4">
              <div className="relative w-32 h-32">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                {/* Inner progress rings (simplified for placeholder) */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent"
                     style={{ background: 'conic-gradient(#7c3aed 0% 60%, #00cec9 60% 85%, #888 85% 100%)' }}>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">42</span>
                  <span className="absolute bottom-6 text-xs text-gray-400">Total</span>
                </div>
              </div>
              <div className="flex justify-between w-full mt-4 text-sm text-gray-400">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>In Progress (60%)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>Completed (25%)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>On Hold (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <button className="bg-gray-700 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Generate Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PROJECT NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CLIENT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">DUE DATE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {projects.map((project, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{project.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{project.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{project.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
