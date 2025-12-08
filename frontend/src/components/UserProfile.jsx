import React from 'react';

const UserProfile = () => {
  const user = {
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Alexandra Chen',
    title: 'Lead 3D Animator',
    id: 'SO-84321',
    status: 'Active',
    personal: {
      email: 'a.chen@studioops.com',
      phoneNumber: '+1 234 567 8900',
      address: '123 Creative Lane, Anytown, USA',
      gender: 'Female',
      dateOfBirth: '15/08/1995',
    },
    employment: {
      department: '3D Animation',
      jobTitle: 'Lead 3D Animator',
      reportingManager: 'David Lee',
      joiningDate: '01/06/2020',
      workLocation: 'San Francisco Office',
    },
    systemAccess: {
      assignedRole: 'Animator - Level 2',
      permissionsSummary: ['Project Access', 'Task Management', 'Asset Upload', 'Time Logging', 'View Reports'],
    },
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold">User Profile</h1>
        <div className="relative ml-auto">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <button className="p-2 ml-4 rounded-full hover:bg-gray-800 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="p-2 ml-2 rounded-full hover:bg-gray-800 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.59 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <div className="w-10 h-10 ml-4 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
          AD
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
          <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-gray-400 mb-1">{user.title}</p>
          <p className="text-gray-500 text-sm mb-4">ID: {user.id}</p>
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6">
            {user.status}
          </span>
          <button className="flex items-center justify-center w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
          <button className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 16.25V16m11.5-7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 3.5a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reset Passw...
          </button>
          <button className="flex items-center justify-center w-full px-4 py-2 text-red-500 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L12 12m-9 9l9-9m0 0l-9-9" />
            </svg>
            Disable User
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="flex border-b border-gray-700 mb-6">
            {['Overview', 'Account & Security', 'KYC / Documents', 'Attendance', 'Assigned Projects', 'Activity'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${tab === 'Overview' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
              {Object.entries(user.personal).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Employment</h3>
              {Object.entries(user.employment).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">System Access</h3>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Assigned Role</span>
              <span className="text-white">{user.systemAccess.assignedRole}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Permissions Summary</span>
              <div className="flex flex-wrap gap-2">
                {user.systemAccess.permissionsSummary.map((permission, index) => (
                  <span key={index} className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
