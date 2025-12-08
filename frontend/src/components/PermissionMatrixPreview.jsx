import React from 'react';

const PermissionMatrixPreview = ({ roleName, onClose }) => {
  const permissionsData = {
    "Dashboard": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H2z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
      actions: {
        View: true,
        Create: false,
        Edit: true,
        Delete: false,
        Manage: true,
      },
    },
    "Users": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      ),
      actions: {
        View: true,
        Create: true,
        Edit: true,
        Delete: false,
        Manage: true,
      },
    },
    "Attendance": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14H8v-2h3v2zm0-4H8V8h3v4zm5 0h-3V8h3v4z"></path>
          <path d="M9 13H6v-2h3v2zm0-4H6V5h3v4z"></path>
        </svg>
      ),
      actions: {
        View: true,
        Create: false,
        Edit: true,
        Delete: false,
        Manage: false,
      },
    },
    "Finance & Billing": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h10V8.414L12.586 5A2 2 0 0012 4.414V4H6zm0 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
        </svg>
      ),
      actions: {
        View: true,
        Create: false,
        Edit: false,
        Delete: false,
        Manage: false,
      },
    },
    "Projects & Tasks": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        </svg>
      ),
      actions: {
        View: true,
        Create: true,
        Edit: true,
        Delete: true,
        Manage: true,
      },
    },
    "Assets & Documents": {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
        </svg>
      ),
      actions: {
        View: true,
        Create: true,
        Edit: true,
        Delete: true,
        Manage: false,
      },
    },
  };

  const ActionToggle = ({ isChecked }) => (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isChecked ? 'bg-cyan-500' : 'border border-gray-600'}`}>
      {isChecked && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-4xl font-bold text-white mb-2">Permission Matrix Preview</h2>
        <p className="text-xl text-gray-400 mb-8">Viewing permissions for: <span className="text-white">{roleName}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(permissionsData).map(([moduleName, data]) => (
            <div key={moduleName} className="bg-[#2a2a2a] p-5 rounded-lg border border-gray-700">
              <div className="flex items-center text-cyan-400 mb-4">
                {data.icon}
                <h3 className="text-lg font-semibold ml-2">{moduleName}</h3>
              </div>
              <ul className="space-y-3">
                {Object.entries(data.actions).map(([actionName, isAllowed]) => (
                  <li key={actionName} className="flex justify-between items-center text-gray-300">
                    <span>{actionName}</span>
                    <ActionToggle isChecked={isAllowed} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-600 transition-colors duration-200 text-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrixPreview;
