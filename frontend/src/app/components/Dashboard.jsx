import React from 'react';
import { useAuth } from '../../shared/context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

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
        return 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20';
      case 'On Hold':
        return 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20';
      default:
        return 'bg-slate-700/50 text-slate-400';
    }
  };

  const userEmailInitial = user && user.email ? user.email[0].toUpperCase() : 'U';
  const userDisplayName = user && user.email ? user.email : 'Guest';
  const userRoleDisplay = user && user.role ? user.role : 'Role';

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Top Nav/Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/50">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-6 self-end md:self-auto">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-slate-950"></span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-white">{userDisplayName}</span>
                    <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded-full">{userRoleDisplay}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 p-[2px] shadow-lg shadow-blue-900/20 cursor-pointer hover:shadow-blue-500/20 transition-all">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{userEmailInitial}</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-400 mt-2 text-lg">Welcome back, {userDisplayName}! Here's your studio's performance snapshot.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3l-2.5 4L7 9m2 2l3 3m0 0l3 3m-3-3l-6 6"></path></svg>
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Projects</p>
                <div className="flex items-baseline mt-2">
                    <p className="text-3xl font-bold text-white">42</p>
                    <span className="ml-2 text-sm font-medium text-emerald-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        12%
                    </span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Since last month</span>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3l-2.5 4L7 9m2 2l3 3m0 0l3 3m-3-3l-6 6"></path></svg>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Completed</p>
               <div className="flex items-baseline mt-2">
                    <p className="text-3xl font-bold text-white">18</p>
                     <span className="ml-2 text-sm font-medium text-emerald-400 flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        8%
                    </span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                 <span className="text-xs text-slate-500">This Month</span>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0H9m3 0h3"></path></svg>
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Revenue</p>
                <div className="flex items-baseline mt-2">
                    <p className="text-3xl font-bold text-white">$125k</p>
                     <span className="ml-2 text-sm font-medium text-emerald-400 flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        4.5%
                    </span>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Monthly Gross</span>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0H9m3 0h3"></path></svg>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg className="w-24 h-24 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h.01M7 15h.01M10 15h.01M13 15h.01M16 15h.01M8 20h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pending</p>
              <div className="flex items-baseline mt-2">
                    <p className="text-3xl font-bold text-white">5</p>
                    <span className="ml-2 text-sm font-medium text-rose-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        2
                    </span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Approvals needed</span>
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 15h.01M10 15h.01M13 15h.01M16 15h.01M8 20h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
                 <select className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none">
                     <option>Last 6 Months</option>
                     <option>This Year</option>
                 </select>
            </div>
           
            {/* Placeholder for Revenue Chart */}
            <div className="h-64 flex items-center justify-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800 relative group overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                 <img src="https://via.placeholder.com/800x300/1e293b/475569?text=Chart+Visualization" alt="Revenue Chart Placeholder" className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity mix-blend-overlay"/>
                 <span className="absolute text-slate-500 font-medium">Interactive Chart Component</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Project Status</h2>
                <button className="p-1 hover:bg-slate-800 rounded">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
            </div>
            {/* Placeholder for Project Status Chart */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-8 border-slate-800"></div>
                {/* Inner progress rings (simplified for placeholder) */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-teal-500 border-r-purple-500 border-l-emerald-500 rotate-45 shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">42</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Total</span>
                </div>
              </div>
              <div className="w-full mt-8 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>In Progress</span>
                    <span className="font-semibold text-white">60%</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>Completed</span>
                    <span className="font-semibold text-white">25%</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>On Hold</span>
                    <span className="font-semibold text-white">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
            <div>
                 <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                 <p className="text-sm text-slate-400 mt-1">Status updates from your team</p>
            </div>
            
            <button className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2.5 rounded-xl transition-all border border-slate-700 flex items-center shadow-lg shadow-black/20">
              <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800/50">
              <thead className="bg-slate-950/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projects.map((project, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 mr-3 border border-slate-700">
                                {project.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{project.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{project.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{project.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusClasses(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                        <button className="text-slate-500 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                        </button>
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